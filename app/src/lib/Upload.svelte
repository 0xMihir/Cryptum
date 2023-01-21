<script lang="ts">
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
			fileUpload(contents);
		};
	}

	async function fileUpload(contents: string | ArrayBuffer | null | undefined) {
		const res = await fetch('http://localhost:5173/files', {
			method: 'POST',
			body: contents
		});
		console.log(contents);
	}
</script>

<div class="uploadContainer">
	<input class="hidden" type="file" on:change={(e) => readFile(e)} bind:this={fileInput} />
	<button on:click={() => fileInput.click()}>Upload</button>
</div>

<style>
	.hidden {
		display: none;
	}
</style>
