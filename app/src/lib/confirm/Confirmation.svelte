<script lang="ts">
	import { Modal, ModalBody, ModalFooter, Button } from 'sveltestrap';

	import type { ConfirmationStore } from './confirm';
	import { ConfirmStage } from './confirm';

	export let header = 'Confirm';
	export let confirmationStore: ConfirmationStore;

	$: isOpen = $confirmationStore.stage !== ConfirmStage.None;

	function cancelAction() {
		$confirmationStore.stage = ConfirmStage.Cancel;
	}

	function confirmAction() {
		$confirmationStore.stage = ConfirmStage.Confirm;
	}
</script>

<Modal {header} {isOpen} toggle={cancelAction}>
	<ModalBody>
		<slot />
		{#if $confirmationStore.errorMessage}
			<p class="text-danger">{$confirmationStore.errorMessage}</p>
		{/if}
	</ModalBody>
	<ModalFooter>
		<Button color="primary" on:click={confirmAction}>Confirm</Button>
		<Button color="secondary" on:click={cancelAction}>Cancel</Button>
	</ModalFooter>
</Modal>
