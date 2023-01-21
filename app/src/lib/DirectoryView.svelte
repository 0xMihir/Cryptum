<script lang="ts">
	import { Directory, File } from "./directoryTree";
	import FileIcon from "./FileIcon.svelte";

    export let directory: Directory;
</script>

<div>
    {#each directory.childrenArray().filter(child => child instanceof Directory) as child (child.name)}
        <FileIcon name={child.name}/>
    {/each}
    {#each directory.childrenArray().filter(child => child instanceof File) as child (child.name)}
        <FileIcon name={child.name}/>
    {/each}
</div>