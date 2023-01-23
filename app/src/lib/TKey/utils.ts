export const hexdump = (buffer: string | ArrayBuffer | Uint8Array, blockSize?: number) => {
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

export const toHex = (buffer: Uint8Array) => {
	let hex = '';
	for (let i = 0; i < buffer.byteLength; i++) {
		hex += ('0' + buffer[i].toString(16)).slice(-2);
	}
	return hex;
};

export const fromHex = (hex: string) => {
	const buffer = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2) {
		buffer[i / 2] = parseInt(hex.slice(i, i + 2), 16);
	}
	return buffer;
};

export default {
	hexdump,
	toHex,
	fromHex
};
