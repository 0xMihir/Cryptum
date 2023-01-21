<script lang="ts">
    import { Modal } from "sveltestrap";

    export let header = "Error";

    let message = "";
    export function showError(error: string) {
        message = error;
        isOpen = true;
    }

    let isOpen = false;

    function toggle() {
        isOpen = ! isOpen;
    }
</script>

<Modal body {header} {isOpen} {toggle}>
    <p class="text-danger">{message}</p>
</Modal>