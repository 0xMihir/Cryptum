import {
	cmdByteLength,
	CommandStatus,
	type Command,
	type CommandEndpoint,
	type CommandLength
} from './commands';
import commands from './commands';
import { blake2s } from 'blakejs';
import { hexdump } from './utils';

interface FramingHeader {
	ID: number;
	Endpoint: CommandEndpoint;
	CommandLength: CommandLength;
}

function parseHeader(b: number): FramingHeader {
	const f: FramingHeader = {} as FramingHeader;

	if ((b & 0x80) !== 0) {
		throw new Error('version bit #7 is not zero');
	}
	if ((b & 0x4) !== 0) {
		throw new Error('unused bit #2 is not zero');
	}

	f.ID = (b & 0x60) >> 5;
	f.Endpoint = (b & 0x18) >> 3;
	f.CommandLength = b & 0x3;

	return f;
}

const makeBuffer = (command: Command, id?: number): Uint8Array => {
	id = id || 2;
	const { commandCode, commandLength, commandEndpoint } = command;
	const buffer = new Uint8Array(1 + cmdByteLength(commandLength));
	if (id > 3) throw new Error('Frame ID must be between 0 and 3');
	if (commandLength > 3) throw new Error('Command length must be between 0 and 3');
	if (commandEndpoint > 3) throw new Error('Command endpoint must be between 0 and 3');

	buffer[0] = (id << 5) | (commandEndpoint << 3) | commandLength;
	buffer[1] = commandCode;
	return buffer;
};

const loadApp = (size: number, userSecret?: string): Uint8Array => {
	const buffer = makeBuffer(commands.firmwareCommands.cmdLoadApp, 2);

	buffer[2] = size;
	buffer[3] = size >> 8;
	buffer[4] = size >> 16;
	buffer[5] = size >> 24;

	if (!userSecret || userSecret.length == 0) {
		buffer[6] = 0;
	} else {
		buffer[6] = 1;
		const hash = blake2s(userSecret);
		buffer.set(hash, 7);
	}

	return buffer;
};

const loadAppData = (data: Uint8Array): Uint8Array => {
	const buffer = makeBuffer(commands.firmwareCommands.cmdLoadAppData, 2);
	buffer.set(data, 2);
	return buffer;
};

class TkeyConnection {
	private port: SerialPort;
	private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
	private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
	private open = false;

	private readTimeout = 1000;

	public static async connect(port: SerialPort): Promise<TkeyConnection> {
		const connection = new TkeyConnection(port);

		await port.open({ baudRate: 62500 });

		if (!port.readable) throw new Error('Serial port is not readable');
		connection.reader = port.readable.getReader();

		if (!port.writable) throw new Error('Serial port is not writable');
		connection.writer = port.writable.getWriter();

		connection.open = true;

		return connection;
	}

	public async writeFrame(data: Uint8Array): Promise<void> {
		if (!this.writer) throw new Error('Serial port is not writable');
		await this.writer.write(data);
	}

	public async readFrame(
		expectedCommand: Command,
		expectedID?: number,
		timeout = true
	): Promise<Uint8Array> {
		if (!this.reader) throw new Error('Serial port is not readable');
		expectedID = expectedID || 2;
		if (expectedCommand.commandEndpoint > 3)
			throw new Error('Command endpoint must be between 0 and 3');
		if (expectedCommand.commandLength > 3)
			throw new Error('Command length must be between 0 and 3');
		if (expectedID > 3) throw new Error('Frame ID must be between 0 and 3');
		if (!this.reader) throw new Error('Serial port is not readable');
		let buffer = makeBuffer(expectedCommand, expectedID);
		let offset = 0;

		if (timeout) {
			// eslint-disable-next-line no-constant-condition
			while (true) {
				if (offset >= buffer.length) {
					break;
				}
				const timer = setTimeout(() => {
					this.reader?.releaseLock();
					console.log('Timeout');
					if (this.port.readable) {
						this.reader = this.port.readable.getReader();
					}
				}, this.readTimeout);

				const { value, done } = await this.reader.read();
				clearTimeout(timer);

				if (done) {
					break;
				}

				if (value) {
					buffer.set(value, offset);
					offset += value.length;
				}
			}
		} else {
			// eslint-disable-next-line no-constant-condition
			while (true) {
				if (offset >= buffer.length) {
					break;
				}

				const { value, done } = await this.reader.read();

				if (done) {
					break;
				}

				if (value) {
					buffer.set(value, offset);
					offset += value.length;
				}
			}
		}

		while (buffer[0] == 0) {
			buffer = buffer.slice(1);
		}

		const header = parseHeader(buffer[0]);

		if (header.ID !== expectedID) {
			console.log(hexdump(buffer));
			console.log(header);
			throw new Error(`Expected ID ${expectedID} but got ${header.ID}`);
		}
		if (expectedCommand.commandLength !== header.CommandLength) {
			throw new Error(
				'Expected command length ' +
					expectedCommand.commandLength +
					' but got ' +
					header.CommandLength
			);
		}

		return buffer;
	}

	public async loadBinary(app: Uint8Array, secret?: string): Promise<boolean> {
		const loadAppCmd = loadApp(app.byteLength, secret);
		const localDigest = blake2s(app);

		await this.writeFrame(loadAppCmd);
		await this.readFrame(commands.firmwareCommands.rspLoadApp);

		let offset = 0;
		if (!this.reader) throw new Error('Serial port is not readable');
		while (offset + 127 < app.byteLength) {
			const chunk = app.slice(offset, offset + 127);
			const cmd = loadAppData(chunk);		
			await this.writeFrame(cmd);
			offset += 127;
			await this.readFrame(commands.firmwareCommands.rspLoadAppData);
		}

		const lastChunk = app.slice(offset);
		const cmd = loadAppData(lastChunk);
		await this.writeFrame(cmd);
		const loadAppDataReadyResp = await this.readFrame(
			commands.firmwareCommands.rspLoadAppDataReady
		);

		// check arraybuffer equality
		const deviceDigest = loadAppDataReadyResp.slice(3, 3 + 32);
		if (localDigest.length !== deviceDigest.length) {
			return false;
		}
		for (let i = 0; i < localDigest.length; i++) {
			if (localDigest[i] !== deviceDigest[i]) {
				return false;
			}
		}
		return true;
	}

	public async getPublicKey(): Promise<Uint8Array> {
		const cmd = makeBuffer(commands.appCommands.cmdGetPublicKey);
		await this.writeFrame(cmd);
		const rsp = await this.readFrame(commands.appCommands.rspGetPublicKey);
		return rsp.slice(2, 2 + 32);
	}

	public async signData(data: Uint8Array): Promise<Uint8Array> {
		const sizeCmd = makeBuffer(commands.appCommands.cmdSetSize);
		sizeCmd[2] = data.byteLength;
		sizeCmd[3] = data.byteLength >> 8;
		sizeCmd[4] = data.byteLength >> 16;
		sizeCmd[5] = data.byteLength >> 24;

		await this.writeFrame(sizeCmd);

		const sizeRsp = await this.readFrame(commands.appCommands.rspSetSize);

		if (sizeRsp[2] !== CommandStatus.Success) {
			throw new Error('Failed to set size');
		}

		let offset = 0;

		while (offset + 127 < data.byteLength) {
			const chunk = data.slice(offset, offset + 127);
			const cmd = makeBuffer(commands.appCommands.cmdSignData);
			cmd.set(chunk, 2);
			await this.writeFrame(cmd);
			offset += 127;
			const signDataResp = await this.readFrame(commands.appCommands.rspSignData);
			if (signDataResp[2] !== CommandStatus.Success) {
				throw new Error('Failed to sign data');
			}
		}

		const lastChunk = data.slice(offset);
		const lastSignCmd = makeBuffer(commands.appCommands.cmdSignData);
		lastSignCmd.set(lastChunk, 2);
		await this.writeFrame(lastSignCmd);
		const signDataResp = await this.readFrame(commands.appCommands.rspSignData, 2, false);
		if (signDataResp[2] !== CommandStatus.Success) {
			throw new Error('Failed to sign data');
		}

		const getSigCmd = makeBuffer(commands.appCommands.cmdGetSignature);
		await this.writeFrame(getSigCmd);
		const getSigResp = await this.readFrame(commands.appCommands.rspGetSignature, 2, false);
		if (getSigResp[2] !== CommandStatus.Success) {
			throw new Error('Failed to get signature');
		}

		return getSigResp.slice(3, 3 + 64);
	}

	public async encryptData(data: Uint8Array): Promise<Uint8Array> {
		if (data.byteLength > 127) {
			throw new Error('Data too long');
		}
		const encryptDataCmd = makeBuffer(commands.appCommands.cmdAEADEncrypt);

		encryptDataCmd.set(data, 2);

		await this.writeFrame(encryptDataCmd);
		return (await this.readFrame(commands.appCommands.rspAEADEncrypt)).slice(3);
	}

	public async encrypt(input: Uint8Array): Promise<Uint8Array> {
		let length = input.length + 8;
		const paddingLength = 86 - (length % 86);
		length += paddingLength;

		const data = new Uint8Array(length);
		const n = input.length;
		data[0] = n;
		data[1] = n >> 8;
		data[2] = n >> 16;
		data[3] = n >> 24;
		data[4] = n >> 32;
		data[5] = n >> 40;
		data[6] = n >> 48;
		data[7] = n >> 56;

		data.set(input, 8);

		const encryptOutput = new Uint8Array((127 * data.length) / 86);

		let ei = 0;
		for (let pi = 0; pi < data.length; pi += 86) {
			const encrypted = await this.encryptData(data.slice(pi, pi + 86));
			encryptOutput.set(encrypted, ei);
			ei += 127;
		}

		return encryptOutput;
	}

	public async decryptData(data: Uint8Array): Promise<Uint8Array> {
		if (data.byteLength > 127) {
			throw new Error('Data too long');
		}
		const decryptDataCmd = makeBuffer(commands.appCommands.cmdAEADDecrypt);

		decryptDataCmd.set(data, 2);

		await this.writeFrame(decryptDataCmd);

		return (await this.readFrame(commands.appCommands.rspAEADDecrypt)).slice(2);
	}

	public async getNameVersion(): Promise<Uint8Array> {
		const cmd = makeBuffer(commands.appCommands.cmdGetNameVersion);
		await this.writeFrame(cmd);
		const resp = await this.readFrame(commands.appCommands.rspGetNameVersion);
		return resp.slice(2);
	}

	public async decrypt(data: Uint8Array): Promise<Uint8Array> {
		if (data.length % 127 != 0) {
			throw new Error('encrypted data must be a multiple of 127');
		}

		const decryptOutput = new Uint8Array(data.length);

		let di = 0;
		for (let ei = 0; ei < data.length; ei += 127) {
			const decrypted = await this.decryptData(data.slice(ei, ei + 127));
			decryptOutput.set(decrypted.slice(1), di);
			di += 86;
		}

		const length =
			decryptOutput[0] |
			(decryptOutput[1] << 8) |
			(decryptOutput[2] << 16) |
			(decryptOutput[3] << 24) |
			(decryptOutput[4] << 32) |
			(decryptOutput[5] << 40) |
			(decryptOutput[6] << 48) |
			(decryptOutput[7] << 56);

		return decryptOutput.slice(8, 8 + length);
	}

	public isOpen(): boolean {
		return this.open;
	}

	public async close(): Promise<void> {
		this.open = false;
		if (this.reader) {
			await this.reader.cancel();
		}
		if (this.writer) {
			await this.writer.close();
		}
		if (this.port) {
			await this.port.close();
		}
	}

	public setReadTimeout(timeout: number): void {
		this.readTimeout = timeout;
	}

	constructor(port: SerialPort) {
		this.port = port;
	}
}

export default {
	commands,
	TkeyConnection
};
