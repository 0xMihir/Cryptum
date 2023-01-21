<script lang="ts">
	import type { Directory } from "./directoryTree";

    export let rootDirectory: Directory;

    let currentDirectory: Directory = rootDirectory;
</script>

{#each currentDirectory.childrenArray() as child (child.name)}
    <div>
        {child.name}
    </div>
{/each}