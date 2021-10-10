<script>
	import supabase from '$lib/db.js';
	import DeleteActionButton from './DeleteActionButton.svelte';

	export let actionData;
	export let eventID;
	export let eventI;
	export let actionI;

	async function getStates() {
		let { data, error } = await supabase.from('states').select();
		return data;
	}
</script>

<div class="flex flex-wrap text-sm bg-white p-5 mt-3 rounded">
	<div class="w-3/12 m-auto">
		<span class="">Action <span class="font-bold">{eventI + 1}.{actionI + 1}</span></span>
	</div>
	<div class="w-8/12">
		<span class="">Commitment</span>
		<span class="font-bold">{actionData.commitments.title}</span>
		<span class="">set to</span>
		{#await getStates() then states}
			{#each states as state}
				{#if state.id == actionData.state_id}
					<span class="font-bold">{state.state}</span>
				{/if}
			{/each}
		{/await}
	</div>
	<div class="w-1/12 m-auto">
		<DeleteActionButton
			actionID={actionData.id}
			commitmentID={actionData.commitments.id}
			stateID={actionData.state_id}
		/>
	</div>
</div>
