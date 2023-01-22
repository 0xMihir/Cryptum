<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Directory, INode } from './directoryTree';
	const dispatch = createEventDispatcher();

	export let isFile: boolean;
	export let node: INode;
	export let x: Number;
	export let y: Number;
	$: menuStyle = "position: absolute; top: " + y.toString() + "px; left: " + x.toString() + "px;";

	function moveNode() {
		console.log("file move");
	}

	async function removeNode() {
		console.log("file delete");
		const res = await fetch('http://localhost:5173/files/' +  {
			method: 'DELETE'
		});
	}
</script>

<!--TODO: Handle if it's a directory instead-->
<div class="menu" style={menuStyle} >
	<div class="option-container">
		<button on:click={moveNode} class="option">Move File</button>
		<button on:click={removeNode} class="option">Remove File</button>
	</div>
</div>

<svelte:window on:click={() => dispatch('closemenu')}/>

<style>
	.option-container {
		border: 2px black solid
	}

	.option {
		border: none;
		background-color: white;
		width: 100%;
		display: block;
	}

	.option:hover {
		background-color: grey;
	}
	
</style>
