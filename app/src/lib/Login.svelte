<script lang="ts">
	import { goto } from '$app/navigation';
	import { fromHex, toHex, hexdump } from './TKey/utils';
    import tk from '$lib/TKey';
	import "@fontsource/roboto";

	async function doesUserExist(uuid: string) {
		const response = await fetch('/api/checkpub', {
			method: 'POST',
			body: JSON.stringify({ uuid }),
			headers: {
				'content-type': 'application/json'
			}
		});
		if (response.ok) {
			const data = await response.json();
			return data;
		} else {
			console.log('error');
		}
	}

	async function getNonce() {
		const response = await fetch('/api/nonce', {
			method: 'GET'
		});
		if (response.ok) {
			const data = await response.json();
			return data;
		} else {
			console.log('error');
		}
	}

	async function getName(uuid: string) {
		const response = await fetch('/api/name', {
			method: 'POST',
			body: JSON.stringify({ uuid }),
			headers: {
				'content-type': 'application/json'
			}
		});
		if (response.ok) {
			const data = await response.json();
			return data;
		} else {
			console.log('error');
		}
	}
	// pass wr_zAhUEuJ3IrtO9d8t_-A
	// user cygnusx26
	// doesUserExist('cygnusx26', 'wr_zAhUEu').then((data) => {
	//         console.log(data);
	//     });
	const login = async () => {
		let port = await navigator.serial.requestPort({
			filters: [{ usbVendorId: 4615, usbProductId: 34951 }]
		});
		const appBin = await fetch('/app.bin');
		const blob = await appBin.blob();

		const appBuffer = new Uint8Array(await blob.arrayBuffer());
		
		const conn = await tk.TkeyConnection.connect(port);

		const successfulLoad = await conn.loadBinary(appBuffer);		

		if (!successfulLoad) {
			console.log('Failed to load binary');
			return;
		} else {
			console.log('Loaded binary');
		}

		const publicKey = await conn.getPublicKey();
		// get hex string
		const pubKey = toHex(publicKey);
		console.log(pubKey);

        const { nonce } = await getNonce(); // random string
		
		const signed = await conn.signData(new TextEncoder().encode(nonce));
		const signature = new TextDecoder().decode(signed);
		const data = await doesUserExist(pubKey);
		const name = await getName(pubKey);

		if (data["exists"]) {
			setCookie('uuid', pubKey);
			setCookie('name',name["results"][0]["name"]);
			return await goto('/drive');
		} else {
			setCookie('uuid', pubKey);
			return await goto('/create');
		}
	};
	/*
	* General utils for managing cookies in Typescript.
	*/
	function setCookie(name: string, val: string) {
		const date = new Date();
		const value = val;

		// Set it expire in 7 days
		date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));

		// Set it
		document.cookie = name+"="+value+"; expires="+date.toUTCString()+"; path=/";
	}
</script>

<button on:click={login}>Login</button>


<style>
	button {
		background-image: linear-gradient(to left, #FF0790, #2300FF); /* Green */
		border: none;
		font-family: 'Roboto', sans-serif;
		color: white;
		padding: 20px 32px;
		text-align: center;

		text-decoration: none;
		display: inline-block;
		border-radius: 30px;
		font-size: 30px;
		margin: auto;
	}
</style>