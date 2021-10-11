<script>
	import supabase from '$lib/db.js';
	import { dataHasChanged } from '$lib/store.js';
	import { tick } from 'svelte';

	export let actionData;
	export let eventID;
	export let eventI;
	export let actionI;

	async function getStates() {
		let { data, error } = await supabase.from('states').select();
		return data;
	}

	async function deleteAction() {
		const { data, error } = await supabase.from('actions').delete().eq('id', actionData.id);
	}

	async function updateCommitmentState() {
		const { data, error } = await supabase
			.from('commitments')
			.update({ state_id: actionData.state_id - 1 })
			.eq('id', actionData.commitment.id);
	}

	async function deleteActionProcedure() {
		dataHasChanged.set(true);
		await deleteAction();
		await updateCommitmentState();
		await tick();
		dataHasChanged.set(false);
	}
</script>

<div class="flex flex-wrap text-sm bg-white p-3 mt-1 rounded dark:bg-black dark:text-white">
	<div class="w-3/12 m-auto">
		<span
			><span class="font-bold pl-2">Action</span>
			<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">{eventI + 1}.{actionI + 1}</span
			></span
		>
	</div>
	<div class="w-8/12">
		<p class="font-bold pl-1">
			Commitment {actionData.commitments.title} set to {#await getStates() then states}
				{#each states as state}
					{#if state.id == actionData.state_id}
						<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">{state.state}</span>
					{/if}
				{/each}
			{/await}
		</p>
		<p class="pl-1">Message</p>
	</div>
	<div class="w-1/12 m-auto">
		<button
			on:click|preventDefault={deleteActionProcedure}
			class="text-red-600 text-2xl font-bold rounded pr-2 float-right"
		>
			-
		</button>
	</div>
</div>
