<script lang="ts">
	import { FormGroup, Label } from 'sveltestrap';
	import { createEventDispatcher } from 'svelte';
	import { ConfirmError, ConfirmOk, newConfirm } from './confirm/confirm';
	import Confirmation from './confirm/Confirmation.svelte';
	import { Directory, type INode } from './directoryTree';
	import { File } from './directoryTree';
	import SearchSelect from './SearchSelect.svelte';
	const dispatch = createEventDispatcher();

	export let currentDirectory: Directory;
	export let node: INode;
	export let x: Number;
	export let y: Number;
	$: menuStyle = "position: absolute; top: " + y.toString() + "px; left: " + x.toString() + "px;";

	let delayCloseMenu = false;

	interface Option {
        name: string,
        value: any,
    }
	const moveConfirm = newConfirm();
	let moveToOptions: Option[] = [];
	let selectedLocation: Directory | null = null;
	function moveNode() {
		delayCloseMenu = true;

		moveToOptions = [];
		for (const key in currentDirectory.children) {
			const child = currentDirectory.children[key];
			if (child instanceof Directory) {
				moveToOptions.push({
					name: key,
					value: child,
				});
			}
		}
		
		if (currentDirectory.parent != null) {
			moveToOptions.push({
				name: currentDirectory.parent.name + " (Parent)",
				value: currentDirectory.parent,
			});
		}

		moveConfirm.confirm(async confirmed => {
			if (confirmed) {
				if (selectedLocation == null) {
					return ConfirmError("please select a directory to move to");
				}

				if (selectedLocation.hasFile(node.name)) {
					return ConfirmError("this directory already contains a file with the same name");
				}

				currentDirectory.removeChildInode(node);
				selectedLocation.addChild(node);

				// without this timeout, we have graphical glitches
				setTimeout(() => {
					dispatch('closemenu');
					delayCloseMenu = false;
				}, 500);
				
				dispatch("foldersUpdated");
				return ConfirmOk;
			} else {
				dispatch('closemenu');
				delayCloseMenu = false;
				return ConfirmOk;
			}
		});
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
	<div class="option-container">
		<button on:click={moveNode} class="option">Move File</button>
		<button on:click={removeNode} class="option">Remove File</button>
	</div>
</div>

<Confirmation header="Move File" confirmationStore={moveConfirm}>
	<FormGroup>
		<Label for="destination">Select Destination</Label>
		<SearchSelect id="destination" bind:value={selectedLocation} options={moveToOptions}/>
	</FormGroup>
</Confirmation>

<svelte:window on:click={() => {
	if (!delayCloseMenu) {
		dispatch('closemenu');
	}
}}/>

<style>
	.option-container {
		border-radius: 5px;
		border: 2px lightgrey solid;
		overflow: hidden;
	}

	.option {
		border: none;
		background-color: white;
		width: 100%;
		display: block;
	}

	.option:hover {
		background-color: lightgrey;
	}
	
</style>
