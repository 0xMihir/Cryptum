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

const makeBuffer = (command: Command, id: number): Uint8Array => {
	const { commandCode, commandLength, commandEndpoint } = command;
	const buffer = new Uint8Array(1 + cmdByteLength(commandLength));
	if (id > 3) throw new Error('Frame ID must be between 0 and 3');
	if (commandLength > 3) throw new Error('Command length must be between 0 and 3');
	if (commandEndpoint > 3) throw new Error('Command endpoint must be between 0 and 3');

	buffer[0] = (id << 5) | (commandEndpoint << 3) | commandLength;
	buffer[1] = commandCode;
	return buffer;
};

const loadApp = (size: number, userSecret: string) : Uint8Array => {
	const buffer = makeBuffer(commands.firmwareCommands.cmdLoadApp, 2);

	buffer[2] = size;
	buffer[3] = size >> 8;
	buffer[4] = size >> 16;
	buffer[5] = size >> 24;

	if (userSecret.length == 0) {
		buffer[6] = 0;
	} else {
		buffer[6] = 1;
		const hash = blake2s(userSecret)
		buffer.set(hash, 7);
	}
	
	return buffer;
}

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

	public async readFrame(expectedCommand: Command, expectedID: number): Promise<Uint8Array> {
		if (expectedCommand.commandEndpoint > 3)
			throw new Error('Command endpoint must be between 0 and 3');
		if (expectedCommand.commandLength > 3)
			throw new Error('Command length must be between 0 and 3');
		if (expectedID > 3) throw new Error('Frame ID must be between 0 and 3');
		if (!this.reader) throw new Error('Serial port is not readable');
		const buffer = makeBuffer(expectedCommand, expectedID);
		let offset = 0;

		const { value, done }: any = await Promise.race([
			this.reader.read(),
			new Promise((_, reject) => setTimeout(reject, this.readTimeout, new Error('Timeout')))
		]);

		if (value) {
			buffer.set(value, offset);
			offset += value.length;
		} else {
			throw new Error('No data received');
		}

		const header = parseHeader(buffer[0]);

		if (header.CommandLength !== expectedCommand.commandLength)
			if (!done) {
				// eslint-disable-next-line no-constant-condition
				while (true) {
					if (offset >= buffer.length) {
						this.reader.releaseLock();
						break;
					}
					const { value, done } = await this.reader.read();
					if (done) {
						this.reader.releaseLock();
						break;
					}

					if (value) {
						buffer.set(value, offset);
						offset += value.length;
					}
				}
			}

		return buffer;
	}

	public async loadAppChunk(chunk: Uint8Array) {
		const buffer = makeBuffer(commands.firmwareCommands.cmdLoadAppData, 2);

	public setReadTimeout(timeout: number): void {
		this.readTimeout = timeout;
	}

	private constructor(port: SerialPort) {
		this.port = port;
	}
}

export default {
	makeBuffer,
	commands,
	TkeyConnection
};
