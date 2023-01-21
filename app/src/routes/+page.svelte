<script lang="ts">
	const buttonPress = async () => {
		// if (navigator.usb) {
		//     console.log("USB is supported");
		//     const device = await navigator.usb.requestDevice({
		//         filters: [
		//             { vendorId: 4615, productId: 34951 }
		//         ]
		//     });
		//     window.device = device
		//     await device.open();
		//     // await device.selectConfiguration(1);
		//     await device.claimInterface(1);

		//     // const cmdFrame = 0b1011000;
		//                      //76543210
		//     const cmdFrame = 88;
		//     const getPublicKey = 0x03;

		//     const getPublicKeyPayload = new Uint8Array([cmdFrame, getPublicKey]);
		//     // print as hex with comma separation
		//     console.log(Array.from(getPublicKeyPayload).map(x => x.toString(16)).join(', '));

		//     const response = await device.transferOut(2, getPublicKeyPayload);
		//     console.log(response);

		//     const publicKey = await device.transferIn(2, 129);
		//     console.log(publicKey.data);
		//     console.log(Array.from(publicKey.data).map(x => x.toString(16)).join(', '));
		// }

		if ('serial' in navigator) {
			let port = await (navigator as any).serial.requestPort();
			await port.open({ baudRate: 62500 });
			window.port = port;

			const writer = port.writable.getWriter();
			const reader = port.readable.getReader();

			const cmdFrame = 88;
			const getPublicKey = 0x03;
			const getPublicKeyPayload = new Uint8Array([cmdFrame, getPublicKey]);

			writer.write(getPublicKeyPayload);
			let response = new Uint8Array(129);
            let offset = 0;

			// eslint-disable-next-line no-constant-condition
			while (true) {
                if (offset >= 129) {
                    reader.releaseLock();
                    break;
                }
				const { value, done } = await reader.read();
                if (done) {
                    console.log(response);
                    reader.releaseLock();
                    break;
                }

				response.set(value, offset);
                offset += value.length;
			}
            
            console.log(response);
		}
	};
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<button on:click={buttonPress}>Click me</button>
