<script>
	import supabase from '$lib/db.js';
	import { dataHasChanged } from '$lib/store.js';
	import { tick } from 'svelte';

	export let eventID;

	async function deleteEvent() {
		const { data, error } = await supabase.from('events').delete().eq('id', eventID);
	}

	// async function updateCommitmentState() {
	// 	const { data, error } = await supabase
	// 		.from('commitments')
	// 		.update({ state_id: stateID - 1 })
	// 		.eq('id', commitmentID);
	// }

	async function deleteEventProcedure() {
		dataHasChanged.set(true);
		await deleteEvent();
		//await updateCommitmentState();
		await tick();
		dataHasChanged.set(false);
	}
</script>

<button
	on:click|preventDefault={deleteEventProcedure}
	class="bg-red-100 font-bold py-1 px-2 rounded float-right"
>
	-
</button>
