<script>
	import supabase from '$lib/db.js';
	import { dataHasChanged } from '$lib/store.js';
	import { tick } from 'svelte';

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

<button
	on:click|preventDefault={deleteActionProcedure}
	class="text-red-600 text-2xl font-bold rounded float-right"
>
	-
</button>
