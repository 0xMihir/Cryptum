<script lang="ts">
    import { Breadcrumb, BreadcrumbItem } from 'sveltestrap';
	import { Directory, INode, File } from "./directoryTree";
    import DirectoryView from "./DirectoryView.svelte";

    export let rootDirectory: Directory;

    $: directoryStack = [rootDirectory];

    export function currentDirectory(): Directory {
        return directoryStack[directoryStack.length - 1];
    }

    // returns true if file is added, meaning there are no files with the same name
    export function addFile(file: INode): boolean {
        if (currentDirectory().hasFile(file.name)) {
            return false;
        } else {
            directoryStack[directoryStack.length - 1].addChild(file);
            directoryStack = directoryStack;
            return true;
        }
    }

    function openFile(event: CustomEvent) {
        const file = event.detail;

        if (file instanceof Directory) {
            directoryStack = [...directoryStack, file];
            console.log(directoryStack);
        } else if (file instanceof File) {
            const link = document.createElement("a");
            link.href = "/files/" + file.uuid;
            link.download = file.name;
            link.click();
        }
    }

    function navigateToBreadcumbIndex(index: number) {
        directoryStack.splice(index + 1);
        directoryStack = directoryStack;
    }
</script>

<div class="top-bar">
    <Breadcrumb>
        {#each directoryStack as directory, i}
            <BreadcrumbItem active={i == directoryStack.length - 1}>
                <span class:parent-directory={i != directoryStack.length - 1} on:click={() => navigateToBreadcumbIndex(i)}>
                    {directory.name}
                </span>
            </BreadcrumbItem>
        {/each}
    </Breadcrumb>
</div>

<DirectoryView directory={directoryStack[directoryStack.length - 1]} on:fileOpened={openFile}/>

<style>
    .top-bar {
        overflow: hidden;
        background-color: #c5c5c5;
        width: 100%;
        padding-left: 2rem;
        padding-right: 2rem;
        padding-top: 1rem;
    }
    .parent-directory {
        cursor:pointer;
        color:blue;
        text-decoration:underline;
    }
</style>