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

<div class="flex flex-wrap text-sm bg-white p-3 mt-1 rounded dark:bg-black dark:text-white">
	<div class="w-3/12 m-auto">
		<span
			><span class="font-bold">Action</span>
			<span class="font-bold dark:bg-gray-600 rounded pl-1 pr-1">{eventI + 1}.{actionI + 1}</span
			></span
		>
	</div>
	<div class="w-8/12">
		<p class="font-bold">
			Commitment {actionData.commitments.title} set to {#await getStates() then states}
				{#each states as state}
					{#if state.id == actionData.state_id}
						<span class="font-bold">{state.state}</span>
					{/if}
				{/each}
			{/await}
		</p>
		<p>Message</p>
	</div>
	<div class="w-1/12 m-auto">
		<DeleteActionButton
			actionID={actionData.id}
			commitmentID={actionData.commitments.id}
			stateID={actionData.state_id}
		/>
	</div>
</div>
