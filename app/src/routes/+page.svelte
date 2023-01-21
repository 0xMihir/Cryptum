<script lang="ts">
    import {onMount} from 'svelte';
	import Upload from '../lib/Upload.svelte';

    onMount(() => {
        console.log('Hello from SvelteKit');
    });

</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<Upload/>


