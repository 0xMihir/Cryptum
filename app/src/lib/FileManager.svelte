<script lang="ts">
	import type { Directory } from "./directoryTree";
    import DirectoryView from "./DirectoryView.svelte";

    export let rootDirectory: Directory;

    let directoryStack = [rootDirectory];
</script>

<DirectoryView directory={directoryStack[directoryStack.length - 1]}/>