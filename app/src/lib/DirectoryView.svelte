<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Directory, File, INode } from './directoryTree';
	import FileIcon from './FileIcon.svelte';
	import ContextMenu from './ContextMenu.svelte';

	export let directory: Directory;
	export let selectedFileName: string | null = null;

	let node: INode;
	let isFile: boolean;
	let pos = { x: 0, y: 0 };
	let showMenu = false;

	const dispatcher = createEventDispatcher();

	function fileClicked(file: INode) {
		if (selectedFileName == file.name) {
			dispatcher('fileOpened', file);
		} else {
			selectedFileName = file.name;
		}
	}

	async function handleRightClick(event: any, childNode: INode, isFil: boolean) {
		// fixe type error
		let e = event as MouseEvent;
		isFile = isFil;

		if (showMenu) {
			showMenu = false;
			await new Promise((res) => setTimeout(res, 100));
		}

		pos = { x: e.clientX, y: e.clientY };
		showMenu = true;
		node = childNode;
	}
</script>

{#if showMenu}
	<ContextMenu
		x={pos.x}
		y={pos.y}
		{node}
		currentDirectory={directory}
		on:closemenu={() => {
			console.log('close');
			showMenu = false;
		}}
		on:foldersUpdated
	/>
{/if}

<div class="d-flex flex-row flex-wrap">
	{#each directory
		.childrenArray()
		.filter((child) => child instanceof Directory) as child (child.name)}
		<FileIcon
			icon="folder-blue.svg"
			name={child.name}
			selected={child.name == selectedFileName}
			on:click={() => fileClicked(child)}
			on:contextmenu={(e) => handleRightClick(e, child, false)}
		/>
	{/each}
	{#each directory.childrenArray().filter((child) => child instanceof File) as child (child.name)}
		<FileIcon
			icon="text-x-generic.svg"
			name={child.name}
			selected={child.name == selectedFileName}
			on:click={() => fileClicked(child)}
			on:contextmenu={(e) => handleRightClick(e, child, true)}
		/>
	{/each}
</div>
