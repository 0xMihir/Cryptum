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
	// pass wr_zAhUEuJ3IrtO9d8t_-A
	// user cygnusx26
	// doesUserExist('cygnusx26', 'wr_zAhUEu').then((data) => {
	//         console.log(data);
	//     });
	const login = async () => {
        const str = await getstr(); // random string
		const data = await doesUserExist('wr_zAhUEu');
		if (data.exists) {
			console.log('user exists');
			return await goto('/drive');
		} else {
			console.log('user does nsot exist');
			return await goto('/drive');
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
</script>

<button on:click={login}>Login</button>
