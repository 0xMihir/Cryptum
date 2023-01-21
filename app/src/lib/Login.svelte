<script lang="ts">
	import { goto } from '$app/navigation';
	import { redirect } from '@sveltejs/kit';
    import tk from '$lib/TKey';
	const commands = tk.commands;

	async function doesUserExist(uuid: String) {
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

	async function getstr() {
		const response = await fetch('/api/getstr', {
			method: 'GET'
		});
		if (response.ok) {
			const data = await response.json();
			return data;
		} else {
			console.log('error');
		}
	}

	async function getname(uuid: String) {
		const response = await fetch('/api/getname', {
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
        const str = await getstr(); // random string
		const uuid = 'sample_pubkey' // TODO: get pubkey from tkey
		const data = await doesUserExist(uuid);
		const name = await getname(uuid);
		console.log();
		if (data["exists"]) {
			setCookie('uuid', uuid);
			setCookie('name',name["results"][0]["name"]);
			return await goto('/drive');
		} else {
			setCookie('uuid', uuid);
			return await goto('/create');
		}
        
		let port = await navigator.serial.requestPort({
			filters: [{ usbVendorId: 4615, usbProductId: 34951 }]
		});

		const response = await fetch('/app.bin');
		const blob = await response.blob();
		const cmd = tk.makeBuffer(commands.firmwareCommands.cmdGetNameVersion, 2);
		const conn = await tk.TkeyConnection.connect(port);

		await conn.writeFrame(cmd);
		const resp = await conn.readFrame(commands.firmwareCommands.rspGetNameVersion, 2);
		console.log(resp);

        
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
