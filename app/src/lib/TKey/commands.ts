export enum CommandLength {
	CommandLen1 = 0,
	CommandLen4 = 1,
	CommandLen32 = 2,
	CommandLen128 = 3
}

export enum CommandStatus {
	Success = 0,
	Failure = 1
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

const makeFirmwareCommand = (commandCode: number, commandLength: CommandLength) => {
	return {
		commandCode,
		commandLength,
		commandEndpoint: CommandEndpoint.Firmware
	};
};

const makeApplicationCommand = (commandCode: number, commandLength: CommandLength) => {
	return {
		commandCode,
		commandLength,
		commandEndpoint: CommandEndpoint.App
	};
};

export interface Command {
	commandCode: number;
	commandLength: CommandLength;
	commandEndpoint: CommandEndpoint;
}

const fw_cmdGetNameVersion = makeFirmwareCommand(0x01, CommandLength.CommandLen1);
const fw_rspGetNameVersion = makeFirmwareCommand(0x02, CommandLength.CommandLen32);
const cmdLoadApp = makeFirmwareCommand(0x03, CommandLength.CommandLen128);
const rspLoadApp = makeFirmwareCommand(0x04, CommandLength.CommandLen4);
const cmdLoadAppData = makeFirmwareCommand(0x05, CommandLength.CommandLen128);
const rspLoadAppData = makeFirmwareCommand(0x06, CommandLength.CommandLen4);
const rspLoadAppDataReady = makeFirmwareCommand(0x07, CommandLength.CommandLen128);
const cmdGetUDI = makeFirmwareCommand(0x08, CommandLength.CommandLen1);
const rspGetUDI = makeFirmwareCommand(0x09, CommandLength.CommandLen32);

// App commands
const cmdGetNameVersion = makeFirmwareCommand(0x01, CommandLength.CommandLen1);
const rspGetNameVersion = makeFirmwareCommand(0x02, CommandLength.CommandLen32);
const cmdGetPublicKey = makeApplicationCommand(0x03, CommandLength.CommandLen1);
const rspGetPublicKey = makeApplicationCommand(0x04, CommandLength.CommandLen128);
const cmdSetSize = makeApplicationCommand(0x05, CommandLength.CommandLen32);
const rspSetSize = makeApplicationCommand(0x06, CommandLength.CommandLen4);
const cmdSignData = makeApplicationCommand(0x07, CommandLength.CommandLen128);
const rspSignData = makeApplicationCommand(0x08, CommandLength.CommandLen4);
const cmdGetSignature = makeApplicationCommand(0x09, CommandLength.CommandLen1);
const rspGetSignature = makeApplicationCommand(0x0a, CommandLength.CommandLen128);
const cmdAEADEncrypt = makeApplicationCommand(0x0b, CommandLength.CommandLen128);
const rspAEADEncrypt = makeApplicationCommand(0x0c, CommandLength.CommandLen128);
const cmdAEADDecrypt = makeApplicationCommand(0x0d, CommandLength.CommandLen128);
const rspAEADDecrypt = makeApplicationCommand(0x0e, CommandLength.CommandLen128);

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
	},
	appCommands: {
		cmdGetNameVersion,
		rspGetNameVersion,
		cmdGetPublicKey,
		rspGetPublicKey,
		cmdSetSize,
		rspSetSize,
		cmdSignData,
		rspSignData,
		cmdGetSignature,
		rspGetSignature,
		cmdAEADEncrypt,
		rspAEADEncrypt,
		cmdAEADDecrypt,
		rspAEADDecrypt
	}
};
