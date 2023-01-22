<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { File } from "./directoryTree";
	import ErrorPopup from "./ErrorPopup.svelte";

	const eventDispatcher = createEventDispatcher();

	let fileInput: HTMLInputElement;
	let errorPopup: ErrorPopup;

	async function readFile(e: Event) {
		let contents;
		const reader = new FileReader();

		if (fileInput.files == null) {
			console.log('No file was selected');
			return;
		}

		const file = fileInput.files[0];
		console.log(file);

		reader.readAsText(file);
		reader.onload = (e) => {
			contents = e.target?.result;
			if (contents == null || contents == undefined) {
				errorPopup.showError("Could not read file");
				return;
			}
			eventDispatcher("fileUploaded", {
				name: file.name,
				data: contents,
			});
		};
	}
</script>

<div class="uploadContainer">
	<input class="hidden" type="file" on:change={(e) => readFile(e)} bind:this={fileInput} />
	<button class="btn btn-primary upload-button" on:click={() => fileInput.click()}>Upload File</button>
</div>

<ErrorPopup bind:this={errorPopup}/>

<style>
	.hidden {
		display: none;
	}
	.upload-button {
		width: 100%;
		height: 100%;
	}
</style>
