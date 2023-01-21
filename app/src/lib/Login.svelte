<script lang="ts">
	import { goto } from '$app/navigation';
	import { redirect } from '@sveltejs/kit';
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

	async function login() {
		const str = await getstr(); // random string
		const data = await doesUserExist('wr_zAhUEu');
		if (data.exists) {
			console.log('user exists');
			return await goto('/drive');
		} else {
			console.log('user does nsot exist');
			return await goto('/drive');
		}
	}
</script>

<button on:click={login}>Login</button>
