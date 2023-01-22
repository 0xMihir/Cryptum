<script lang="ts">
    import { FormGroup, Label } from "sveltestrap";
	import { Directory, INode, File, type NewFile } from "$lib/directoryTree";
	import Upload from "$lib/Upload.svelte";
	import FileManager from "$lib/FileManager.svelte";
	import { ConfirmError, ConfirmOk, newConfirm } from "$lib/confirm/confirm";
	import Confirmation from "$lib/confirm/Confirmation.svelte";
    import ErrorPopup from "$lib/ErrorPopup.svelte";
	import { onMount } from "svelte";
    import { connection } from "$lib/stores/connection";
    import TKey from "$lib/TKey";


    // temp until server loads
    let root = new Directory("root");

    let fileManager: FileManager;

    let errorPopup: ErrorPopup;

    async function getRootFromServer() {
        try {
            const res = await fetch("/files/root", {
                method: "GET",
            });
            const data = new Uint8Array(await res.arrayBuffer())
            if (data == null) {
                errorPopup.showError("could not retrieve files from server");
                return;
            }           

            const conn = $connection;

            let decryptedBuffer = new Uint8Array(129);

            for (let i = 0; i < data.length - 127; i+=127) {
                const decrypted = await conn.decryptData(data.slice(i, i+127));
                // concat decrypted data
                const temp = new Uint8Array(decryptedBuffer.length + decrypted.length);
                temp.set(decryptedBuffer);
                temp.set(decrypted, decryptedBuffer.length);
                decryptedBuffer = temp;  
            }


            const inode = INode.fromJson(new TextDecoder().decode(data));
            if (inode != null && inode instanceof Directory) {
                fileManager.setRootDirectory(inode);
                root = inode;
            } else {
                errorPopup.showError("invalid folder structure recieved from server");
            }
        } catch (e) {
            errorPopup.showError("could not retrieve files from server");
        }
    }

    onMount(() => getRootFromServer());

    // updates the root file on server, returns false on failure
    async function updateRootOnServer(): Promise<boolean> {
        const rootJson = root.toString();

        try {
            const res = await fetch("/files/root", {
                method: "POST",
                body: rootJson,
            });
            if (!res.ok) {
                return false;
            }
        } catch (e) {
            return false;
        }
        return true;
    }

    async function addFile(newFile: NewFile) {
        if (fileManager.currentDirectory().hasFile(newFile.name)) {
            errorPopup.showError("could not add file, a file or folder with the name already exists");
            return;
        }

        try {
            const res = await fetch('/files', {
                method: 'POST',
                body: newFile.data,
                headers: {"content-type": "application/octet-stream"}
            });

            const body = (await res?.body?.getReader()?.read())?.value;
            if (res.ok && res.body != null) {
                const file = new File(newFile.name, new TextDecoder().decode(body));
                fileManager.addFile(file);
            } else {
                errorPopup.showError("could not upload file to server");
                return;
            }
        } catch (e) {
            errorPopup.showError("could not upload file to server");
            return;
        }

        if (!await updateRootOnServer()) {
            fileManager.currentDirectory().removeChild(newFile.name);
            errorPopup.showError("could not synchronize folder structure with server");
        }
    }

    const createFolderConfirm = newConfirm();
    let folderName = "";
    function createFolder() {
        createFolderConfirm.confirm(async confirmed => {
            if (confirmed) {
                if (folderName.trim() == "") {
                    return ConfirmError("please enter a non empty folder name");
                }
                const folder = new Directory(folderName);
                if (!fileManager.addFile(folder)) {
                    return ConfirmError("a file or folder with that name already exists");
                }

                if (!await updateRootOnServer()) {
                    fileManager.currentDirectory().removeChild(folder.name);
                    return ConfirmError("could not synchronize folder structure with server");
                }
            }
            return ConfirmOk;
        });
    }
</script>

<div class="sidebar bg-dark">
    <div class="spacing logo">
        <img src="logo.png" alt="logo"/>
        <h1 class="text-light">Cryptum</h1>
    </div>
    <div class="spacing">
        <Upload on:fileUploaded={event => addFile(event.detail)}></Upload>
    </div>
    <div class="spacing">
        <button class="btn btn-primary center" on:click={createFolder}>Create Folder</button>
    </div>
</div>
<div class="file-manager">
    <FileManager rootDirectory={root} bind:this={fileManager} on:foldersUpdated={updateRootOnServer}/>
</div>

<Confirmation header="Create Folder" confirmationStore={createFolderConfirm}>
    <FormGroup>
        <Label for="folderNameInput">Folder Name</Label>
        <input id="folderNameInput" type="text" class="form-control" bind:value={folderName}/>
    </FormGroup>
</Confirmation>

<ErrorPopup bind:this={errorPopup}/>

<style>
    .logo {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }
    .file-manager {
        margin-left: 350px;
    }
    .center {
        margin: auto;
        width: 100%;
    }
    .spacing {
        margin-bottom: 25px;
    }
    .sidebar {
        display: block;
        position: fixed;
        width: 350px;
        height: 100%;
        padding: 25px;
    }
</style>