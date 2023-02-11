<script lang="ts">
	import { goto } from '$app/navigation';
	import { fromHex, toHex } from './TKey/utils';
	import { connection } from './stores/connection';
	import tk from '$lib/TKey';
	import '@fontsource/roboto';

	async function doesUserExist(pubKey: string) {
		const response = await fetch('/api/checkpub', {
			method: 'POST',
			body: JSON.stringify({ pubKey }),
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

	async function getName(pubKey: string) {
		const response = await fetch('/api/name', {
			method: 'POST',
			body: JSON.stringify({ pubKey }),
			headers: {
				'content-type': 'application/json'
			}
		});
		if (response.ok) {
			const data = await response.json();
			return data.name;
		} else {
			console.log('error');
		}
	}

	const login = async () => {
		const port = await navigator.serial.requestPort({
			filters: [{ usbVendorId: 4615, usbProductId: 34951 }]
		});
		const appBin = await fetch('/app.bin');
		const blob = await appBin.blob();

		const appBuffer = new Uint8Array(await blob.arrayBuffer());

		const conn = await tk.TkeyConnection.connect(port);
		connection.set(conn);


		let successfulLoad = false;

		try {
			successfulLoad = await conn.loadBinary(appBuffer);
		} catch (e) {
			console.log("get name")
			const name = await conn.getNameVersion();
			console.log(name)

			if (new TextDecoder().decode(name.slice(0, 7)) == 'cryptum') {
				successfulLoad = true;
				console.log('Already loaded');
			}
		}

		if (!successfulLoad) {
			console.log('Failed to load binary');
			return;
		} else {
			console.log('Loaded binary');
		}

		const publicKey = await conn.getPublicKey();
		// get hex string
		const pubKey = toHex(publicKey);

		const { nonce } = await getNonce();

		const signed = await conn.signData(fromHex(nonce));
		const sig = toHex(signed);

		await fetch('/api/login', {
			method: 'POST',
			body: JSON.stringify({ pubKey: pubKey, nonce, sig }),
			headers: {
				'content-type': 'application/json'
			}
		});

		const data = await doesUserExist(pubKey);
		const name = await getName(pubKey);
		if (data['exists']) {
			setCookie('name', name);
			goto('/drive');
		} else {
			goto('/create');
		}

		console.log(data);
		console.log(name);
	};
	/*
	 * General utils for managing cookies in Typescript.
	 */
	function setCookie(name: string, val: string) {
		const date = new Date();
		const value = val;

		// Set it expire in 7 days
		date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000);

		// Set it
		document.cookie = name + '=' + value + '; expires=' + date.toUTCString() + '; path=/';
	}
</script>

<button on:click={login}>Login</button>

<style>
	button {
		background-image: linear-gradient(to left, #ff0790, #2300ff); /* Green */
		border: none;
		font-family: 'Roboto', sans-serif;
		color: white;
		padding: 10px 32px;
		text-align: center;

		text-decoration: none;
		display: block;
		border-radius: 30px;
		font-size: 20px;
		margin: auto;
		height: 70%;
	}
</style>
