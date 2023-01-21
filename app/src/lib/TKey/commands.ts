export enum CommandLength {
	CommandLen1 = 0,
	CommandLen4 = 1,
	CommandLen32 = 2,
	CommandLen128 = 3
}

export const cmdByteLength = (len: CommandLength) => {
	switch (len) {
		case CommandLength.CommandLen1:
			return 1;
		case CommandLength.CommandLen4:
			return 4;
		case CommandLength.CommandLen32:
			return 32;
		case CommandLength.CommandLen128:
			return 128;
	}
};

export enum CommandEndpoint {
	Firmware = 2,
	App = 3
}

export interface Command {
	commandCode: number;
	commandLength: CommandLength;
	commandEndpoint: CommandEndpoint;
}

const cmdGetNameVersion: Command = {
	commandCode: 0x01,
	commandLength: CommandLength.CommandLen1,
	commandEndpoint: CommandEndpoint.Firmware
};

const rspGetNameVersion: Command = {
	commandCode: 0x02,
	commandLength: CommandLength.CommandLen32,
	commandEndpoint: CommandEndpoint.Firmware
};

const cmdLoadApp: Command = {
	commandCode: 0x03,
	commandLength: CommandLength.CommandLen128,
	commandEndpoint: CommandEndpoint.Firmware
};

const rspLoadApp: Command = {
	commandCode: 0x04,
	commandLength: CommandLength.CommandLen4,
	commandEndpoint: CommandEndpoint.Firmware
};

const cmdLoadAppData: Command = {
	commandCode: 0x05,
	commandLength: CommandLength.CommandLen128,
	commandEndpoint: CommandEndpoint.Firmware
};

const rspLoadAppData: Command = {
	commandCode: 0x06,
	commandLength: CommandLength.CommandLen4,
	commandEndpoint: CommandEndpoint.Firmware
};

const rspLoadAppDataReady: Command = {
	commandCode: 0x07,
	commandLength: CommandLength.CommandLen128,
	commandEndpoint: CommandEndpoint.Firmware
};

const cmdGetUDI: Command = {
	commandCode: 0x08,
	commandLength: CommandLength.CommandLen1,
	commandEndpoint: CommandEndpoint.Firmware
};

const rspGetUDI: Command = {
	commandCode: 0x09,
	commandLength: CommandLength.CommandLen32,
	commandEndpoint: CommandEndpoint.Firmware
};

const cmdGetPublicKey: Command = {
	commandCode: 0x03,
	commandLength: CommandLength.CommandLen1,
	commandEndpoint: CommandEndpoint.App
};

const rspGetPublicKey: Command = {
	commandCode: 0x04,
	commandLength: CommandLength.CommandLen128,
	commandEndpoint: CommandEndpoint.App
};

const cmdSign: Command = {
	commandCode: 0x05,
	commandLength: CommandLength.CommandLen128,
	commandEndpoint: CommandEndpoint.App
};

const rspSign: Command = {
	commandCode: 0x06,
	commandLength: CommandLength.CommandLen4,
	commandEndpoint: CommandEndpoint.App
};

export default {
	firmwareCommands: {
		cmdGetNameVersion,
		rspGetNameVersion,
		cmdLoadApp,
		rspLoadApp,
		cmdLoadAppData,
		rspLoadAppData,
		rspLoadAppDataReady,
		cmdGetUDI,
		rspGetUDI
	}
};
