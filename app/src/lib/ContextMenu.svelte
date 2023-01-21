<script>
	export let uuid = '';
	// export let currentPath;

	function moveFile() {}

	async function removeFile() {
		const res = await fetch('http://localhost:5173/files/' + uuid, {
			method: 'DELETE'
		});
	}
</script>

<!--TODO: Handle if it's a directory instead-->
<div class="menu">
	<button on:click={moveFile} class="option">Move File</button>
	<button on:click={removeFile} class="option">Remove File</button>
</div>

<style>
	.option {
		background-color: white;
		width: 10%;
		height: 5%;
		display: block;
	}
</style>
