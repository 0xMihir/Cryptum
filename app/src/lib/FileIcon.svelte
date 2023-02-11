<script lang="ts">
	export let icon: string;
	export let name: string;
	export let selected: boolean;
</script>

<div
	on:click
	on:contextmenu|preventDefault
	on:keypress
	class:text-bg-primary={selected}
	class="rounded file-icon d-flex flex-column align-items-center"
>
	<img class="file-icon-image" src={icon} alt="File" />
	<p class="file-icon-text text-center">{name}</p>
</div>

<style>
	.file-icon {
		width: 8rem;
		height: 10rem;
		padding: 1rem;
		margin: 1rem;
	}
	.file-icon:hover {
		background: #d0d0d0;
	}
	.file-icon-image {
		width: 6rem;
	}

	.file-icon-text {
		max-width: 100%;
	}
</style>
