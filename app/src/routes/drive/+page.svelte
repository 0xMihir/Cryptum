<script lang="ts">
	import { Directory, INode } from "$lib/directoryTree";
	import DriveSideBar from "$lib/DriveSideBar.svelte";
	import FileManager from "$lib/FileManager.svelte";

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
</script>

<DriveSideBar/>

<div class="file-manager">
    <FileManager rootDirectory={root}/>
</div>

<style>
    .file-manager {
        margin-left: 250px;
    }
</style>