<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { File } from "./directoryTree";

	const eventDispatcher = createEventDispatcher();

	let fileInput: HTMLInputElement;

	async function readFile(e: Event) {
		let contents;
		const reader = new FileReader();

		if (fileInput.files == null) {
			console.log('No file was selected');
			return;
		}

		const file = fileInput.files[0];
		console.log(file);

		reader.readAsDataURL(file);
		reader.onload = (e) => {
			contents = e.target?.result;
			if (contents == null || contents == undefined) {
				console.log('Could not read file');
				return;
			}
			fileUpload(file.name, contents);
		};
	}

	async function fileUpload(name: string, contents: string | ArrayBuffer | null | undefined) {
		const res = await fetch('https://localhost:5173/files', {
			method: 'POST',
			body: contents
		});

		const body = (await res?.body?.getReader()?.read())?.value;
		if (res.ok && res.body != null) {
			const file = new File(name, new TextDecoder().decode(body));
			eventDispatcher("fileUploaded", file);
		} else {
			// TODO: show popup
		}
		console.log(contents);
	}
</script>

<div class="uploadContainer">
	<input class="hidden" type="file" on:change={(e) => readFile(e)} bind:this={fileInput} />
	<button class="btn btn-primary upload-button" on:click={() => fileInput.click()}>Upload File</button>
</div>

<style>
	.hidden {
		display: none;
	}
	.upload-button {
		width: 100%;
		height: 100%;
	}
</style>
