<script lang="ts">
	import { Directory, INode } from "$lib/directoryTree";
	import DirectoryView from "$lib/DirectoryView.svelte";

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

<DirectoryView directory={root}/>
