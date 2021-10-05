<script>
	import supabase from '$lib/db';
	import { dataHasChanged } from '$lib/store.js';
	import { tick } from 'svelte';
	import IoIosRemove from 'svelte-icons/io/IoIosRemove.svelte';

	export let actionID;
	export let commitmentID;
	export let stateID;

	async function deleteAction() {
		const { data, error } = await supabase.from('actions').delete().eq('id', actionID);
	}

	async function updateCommitmentState() {
		const { data, error } = await supabase
			.from('commitments')
			.update({ state_id: stateID - 1 })
			.eq('id', commitmentID);
	}

	async function deleteActionProcedure() {
		dataHasChanged.set(true);
		await deleteAction();
		await updateCommitmentState();
		await tick();
		dataHasChanged.set(false);
	}
</script>

<span on:click|preventDefault={deleteActionProcedure}>
	<IoIosRemove />
</span>
