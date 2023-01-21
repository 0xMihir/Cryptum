<script lang="ts">
    export let icon: string;
    export let name: string;
    export let selected: boolean;
</script>

<div on:click class:text-bg-primary={selected} class="rounded file-icon d-flex flex-column align-items-center">
    <img class="file-icon-image" src={icon}/>
    <p class="text-center">{name}</p>
</div>

<style>
    .file-icon {
        width: 8rem;
        height: 10rem;
        padding: 1rem;
        margin: 1rem;
    }
    .file-icon-image {
        width: 6rem;
    }
</style>