<script lang="ts">
	import { onMount } from 'svelte';
	import Login from '../lib/Login.svelte';
	import ContextMenu from '../lib/ContextMenu.svelte';

	onMount(() => {
		console.log('Hello from SvelteKit');
	});
</script>

<h1>Cryptum</h1>
<h2>Encrypted file storage powered by the Tillitis TKey</h2>
<Login />
<footer>
	<p>
		Visit <a
			href="https://github.com/tillitis/tillitis-key1/blob/main/doc/framing_protocol/framing_protocol.md"
			>tillitis-key</a
		> to learn more
	</p>
</footer>
<ContextMenu />

<style>
	footer {
		text-align: right;
		padding: 3px;
		color: black;
		position: absolute;
		bottom: 0;
	}
</style>
