<script lang="ts">
    import { FormGroup, Label } from "sveltestrap";
	import { Directory, INode, File } from "$lib/directoryTree";
	import Upload from "$lib/Upload.svelte";
	import FileManager from "$lib/FileManager.svelte";
	import { ConfirmError, ConfirmOk, newConfirm } from "$lib/confirm/confirm";
	import Confirmation from "$lib/confirm/Confirmation.svelte";
    import ErrorPopup from "$lib/ErrorPopup.svelte";

    const root = INode.fromJson(`{
        "type": "directory",
        "name": "root",
        "children": [
            {
                "type": "file",
                "name": "hi.txt",
                "uuid": "bleeeh"
            },
            {
                "type": "directory",
                "name": "people",
                "children": [
                    {
                        "type": "file",
                        "name": "bob ross.txt",
                        "uuid": "86"
                    },
                    {
                        "type": "directory",
                        "name": "time",
                        "children": [
                        ]
                    },
                    {
                        "type": "file",
                        "name": "kanye west.txt",
                        "uuid": "23"
                    }
                ]
            },
            {
                "type": "file",
                "name": "bruhv",
                "uuid": "uuid2"
            }
        ]
    }`) as Directory;

    let fileManager: FileManager;

    let errorPopup: ErrorPopup;

    function addFile(file: File) {
        if (!fileManager.addFile(file)) {
            errorPopup.showError("could not add file, a file or folder with the name already exists");
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
            }
            return ConfirmOk;
        });
    }
</script>

<div class="sidebar bg-dark">
    <div class="spacing">
        <Upload on:fileUploaded={event => addFile(event.detail)}></Upload>
    </div>
    <div class="spacing">
        <button class="btn btn-primary center" on:click={createFolder}>Create Folder</button>
    </div>
</div>
<div class="file-manager">
    <FileManager rootDirectory={root} bind:this={fileManager}/>
</div>

<Confirmation header="Create Folder" confirmationStore={createFolderConfirm}>
    <FormGroup>
        <Label for="folderNameInput">Folder Name</Label>
        <input id="folderNameInput" type="text" class="form-control" bind:value={folderName}/>
    </FormGroup>
</Confirmation>

<ErrorPopup bind:this={errorPopup}/>

<style>
    .file-manager {
        margin-left: 250px;
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
        width: 250px;
        height: 100%;
        padding: 25px;
    }
</style>