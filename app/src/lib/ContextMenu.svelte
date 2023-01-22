<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let uuid = '';
	export let x: Number;
	export let y: Number;
	$: menuStyle = "position: absolute; top: " + y.toString() + "px; left: " + x.toString() + "px;";

	function moveFile() {
		console.log("file move");
	}

	async function removeFile() {
		console.log("file delete");
		const res = await fetch('http://localhost:5173/files/' + uuid, {
			method: 'DELETE'
		});
	}
</script>

<!--TODO: Handle if it's a directory instead-->
<div class="menu" style={menuStyle} >
	<button on:click={moveFile} class="option">Move File</button>
	<button on:click={removeFile} class="option">Remove File</button>
</div>

<svelte:window on:click={() => dispatch('closemenu')}/>

<style>
	.option {
		background-color: white;
		width: 100%;
		display: block;
	}
</style>
