<script lang="ts">
    export let name: string;
    export let selected: boolean;
</script>

<div on:click class:text-bg-primary={selected}>
    <p>{name}</p>
</div>