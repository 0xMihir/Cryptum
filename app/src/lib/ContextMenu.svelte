<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Directory, INode } from './directoryTree';
	import { File } from './directoryTree';
	const dispatch = createEventDispatcher();

	export let currentDirectory: Directory;
	export let node: INode;
	export let x: Number;
	export let y: Number;
	$: menuStyle = "position: absolute; top: " + y.toString() + "px; left: " + x.toString() + "px;";

	function moveNode() {
		console.log("file move");
	}

	async function removeNode() {
		currentDirectory.removeChild(node.name);
		dispatch("foldersUpdated");
		if (node instanceof File) {
			await node.deleteFromServer();
		}
	}
</script>

<!--TODO: Handle if it's a directory instead-->
<div class="menu" style={menuStyle} >
	<button on:click={moveNode} class="option">Move File</button>
	<button on:click={removeNode} class="option">Remove File</button>
</div>

<svelte:window on:click={() => dispatch('closemenu')}/>

<style>
	.option {
		background-color: white;
		width: 100%;
		display: block;
	}
</style>
