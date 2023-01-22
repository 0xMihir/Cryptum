import { cmdByteLength, type Command, type CommandEndpoint, type CommandLength } from './commands';
import commands from './commands';
import { blake2s } from 'blakejs';

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

const loadApp = (size: number, userSecret: string): Uint8Array => {
	const buffer = makeBuffer(commands.firmwareCommands.cmdLoadApp, 2);

	buffer[2] = size;
	buffer[3] = size >> 8;
	buffer[4] = size >> 16;
	buffer[5] = size >> 24;

	if (userSecret.length == 0) {
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

	private readTimeout = 1000;

	public static async connect(port: SerialPort): Promise<TkeyConnection> {
		const connection = new TkeyConnection(port);

		await port.open({ baudRate: 62500 });

		if (!port.readable) throw new Error('Serial port is not readable');
		connection.reader = port.readable.getReader();

		if (!port.writable) throw new Error('Serial port is not writable');
		connection.writer = port.writable.getWriter();

		return connection;
	}

	public async writeFrame(data: Uint8Array): Promise<void> {
		if (!this.writer) throw new Error('Serial port is not writable');
		await this.writer.write(data);
	}

	public async readFrame(expectedCommand: Command, expectedID?: number): Promise<Uint8Array> {
		expectedID = expectedID || 2;
		if (expectedCommand.commandEndpoint > 3)
			throw new Error('Command endpoint must be between 0 and 3');
		if (expectedCommand.commandLength > 3)
			throw new Error('Command length must be between 0 and 3');
		if (expectedID > 3) throw new Error('Frame ID must be between 0 and 3');
		if (!this.reader) throw new Error('Serial port is not readable');
		const buffer = makeBuffer(expectedCommand, expectedID);
		let offset = 0;

		const start = Date.now();
		while (Date.now() - start < this.readTimeout) {
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

		const header = parseHeader(buffer[0]);

		if (header.ID !== expectedID) {
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

	public async loadBinary(app: Uint8Array): Promise<boolean> {
		const loadAppCmd = loadApp(app.byteLength, 'password');
		const localDigest = blake2s(app);

		await this.writeFrame(loadAppCmd);

		const loadAppResp = await this.readFrame(commands.firmwareCommands.rspLoadApp);

		let offset = 0;

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

	public async close(): Promise<void> {
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

	private constructor(port: SerialPort) {
		this.port = port;
	}
}

const hexdump = (buffer: string | ArrayBuffer | Uint8Array, blockSize?: number) => {
	//determine the type of variable "buffer", and convert this to "string".
	if (typeof buffer === 'string') {
		//console.log("buffer is string");
		//do nothing
	} else if (buffer instanceof ArrayBuffer && buffer.byteLength !== undefined) {
		buffer = String.fromCharCode(...new Uint8Array(buffer));
	} else if (Array.isArray(buffer)) {
		//console.log("buffer is Array");
		buffer = String.fromCharCode(...buffer);
	} else if (buffer.constructor === Uint8Array) {
		buffer = String.fromCharCode(...buffer);
	} else {
		//console.log("Error: buffer is unknown...");
		return false;
	}

	blockSize = blockSize || 16;
	const lines = [];
	const hex = '0123456789abcdef';
	for (let b = 0; b < buffer.length; b += blockSize) {
		const block = buffer.slice(b, Math.min(b + blockSize, buffer.length));
		const addr = ('0000' + b.toString(16)).slice(-4);
		let codes = block
			.split('')
			.map(function (ch) {
				const code = ch.charCodeAt(0);
				return hex[(0xf0 & code) >> 4] + hex[0x0f & code] + ' ';
			})
			.join('');
		codes += '	'.repeat(blockSize - block.length);
		let chars = block.replace(/[\u00-\u1F\x20]/g, '.');
		chars += ' '.repeat(blockSize - block.length);
		//		lines.push(addr + " " + codes + "  " + chars);				//old code
		lines.push(codes + '  //' + chars + '	' + addr); //new code
	}
	return lines.join('\n');
};

export default {
	makeBuffer,
	loadApp,
	loadAppData,
	hexdump,
	commands,
	TkeyConnection
};
