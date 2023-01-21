<script lang="ts">
	import tk from '$lib/TKey';
	const commands = tk.commands;

	async function doesUserExist(username: string, uuid: string) {
		const response = await fetch('/api/getusers', {
			method: 'POST',
			body: JSON.stringify({ username, uuid }),
			headers: {
				'content-type': 'application/json'
			}
		});

		return await response;
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
