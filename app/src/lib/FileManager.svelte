<script lang="ts">
    import ErrorPopup from './ErrorPopup.svelte';
    import { createEventDispatcher } from 'svelte';
    import { Breadcrumb, BreadcrumbItem } from 'sveltestrap';
	import { Directory, INode, File } from "./directoryTree";
    import DirectoryView from "./DirectoryView.svelte";
	import { connection } from './stores/connection';

    const dispatcher = createEventDispatcher();
    const conn = $connection;

    export let rootDirectory: Directory;

    let directoryStack = [rootDirectory];

    let errorPopup: ErrorPopup;

    // this is kind of a hack to get around some wierd stuff with reactivity
    // need to call this everytim root directory changes
    export function setRootDirectory(root: Directory) {
        rootDirectory = root;
        directoryStack = [root];
    }

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

    async function openFile(event: CustomEvent) {
        const file = event.detail;

        if (file instanceof Directory) {
            directoryStack = [...directoryStack, file];
        } else if (file instanceof File) {
            try {
                const fileData = await fetch("/files/" + file.uuid, {
                    method: "GET",
                });

                const fileArray = new Uint8Array(await fileData.arrayBuffer());
                const decryptedData = await conn.decrypt(fileArray);

                const fileBlob = new Blob([decryptedData]);
                const url = window.URL.createObjectURL(fileBlob);

                const link = document.createElement("a");
                link.href = url;
                link.download = file.name;
                link.click();
            } catch (e) {
                errorPopup.showError("failed to download file");
            }
            
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

    function foldersUpdated() {
        directoryStack = directoryStack;
        dispatcher("foldersUpdated");
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

<DirectoryView directory={directoryStack[directoryStack.length - 1]} on:fileOpened={openFile} on:foldersUpdated={foldersUpdated}/>

<ErrorPopup bind:this={errorPopup}/>

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