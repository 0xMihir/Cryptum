<script lang="ts">
    export let name: string;
    export let selected: boolean;
</script>

<div on:click>
    <p>{name}</p>
</div>