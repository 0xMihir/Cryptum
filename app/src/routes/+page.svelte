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

        if (navigator.serial) {
            let port = await navigator.serial.requestPort();

            port.open({ baudRate: 115200 });
            console.log(port);

            const reader = port.readable.getReader();
            const writer = port.writable.getWriter();


        }
    }
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<button on:click={buttonPress}>Click me</button>