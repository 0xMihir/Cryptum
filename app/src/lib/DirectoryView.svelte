<script lang="ts">
    import { createEventDispatcher } from "svelte";
	import { Directory, File, INode } from "./directoryTree";
	import FileIcon from "./FileIcon.svelte";

    export let directory: Directory;

    export let selectedFileName: string | null = null;

    const dispatcher = createEventDispatcher();

    function fileClicked(file: INode) {
        if (selectedFileName == file.name) {
            dispatcher("fileOpened", file);
        } else {
            selectedFileName = file.name;
        }
    }
</script>

<div class="d-flex flex-row flex-wrap">
    {#each directory.childrenArray().filter(child => child instanceof Directory) as child (child.name)}
        <FileIcon icon="folder-blue.svg" name={child.name} selected={child.name == selectedFileName} on:click={() => fileClicked(child)}/>
    {/each}
    {#each directory.childrenArray().filter(child => child instanceof File) as child (child.name)}
        <FileIcon icon="text-x-generic.svg" name={child.name} selected={child.name == selectedFileName} on:click={() => fileClicked(child)}/>
    {/each}
</div>