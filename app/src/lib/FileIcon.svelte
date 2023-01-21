<script lang="ts">
    export let name: string;
    export let selected: boolean;
</script>

<div on:click class:text-bg-primary={selected} class="rounded file-icon">
    <p>{name}</p>
</div>

<style>
    .file-icon {
        width: 7rem;
        height: 9rem;
        padding: 1rem;
        margin: 1rem;
    }
</style>