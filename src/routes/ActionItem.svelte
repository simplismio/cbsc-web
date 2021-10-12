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

	async function deleteMessage() {
		const { data, error } = await supabase
			.from('messages')
			.delete()
			.eq('id', actionData.messages[0].id);
		return;
	}

	async function deleteAction() {
		const { data, error } = await supabase.from('actions').delete().eq('id', actionData.id);
		return;
	}

	async function updateCommitmentState() {
		const { data, error } = await supabase
			.from('commitments')
			.update({ state_id: actionData.state_id - 1 })
			.eq('id', actionData.commitments.id);
		return;
	}

	async function deleteActionProcedure() {
		dataHasChanged.set(true);
		if (actionData.messages[0] != undefined) {
			await deleteMessage();
		}
		await deleteAction();
		await updateCommitmentState();
		await tick();
		dataHasChanged.set(false);
	}

	async function getAgents() {
		let { data: agents, error } = await supabase.from('agents').select();
		if (error) throw new Error(error.message);
		return agents;
	}
</script>

<!-- {(console.log(actionData.commmitments.id), '')} -->

<div class="flex flex-wrap text-sm bg-white p-3 mt-1 rounded dark:bg-black dark:text-white">
	<div class="w-3/12 m-auto">
		<span
			><span class="font-bold pl-2">Action</span>
			<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">{eventI + 1}.{actionI + 1}</span
			></span
		>
	</div>
	<div class="w-8/12 m-auto">
		<p class="font-bold pl-1">
			Commitment {actionData.commitments.title} set to {#await getStates() then states}
				{#each states as state}
					{#if state.id == actionData.state_id}
						<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">{state.state}</span>
					{/if}
				{/each}
			{/await}
			by
			{#await getAgents() then agents}
				{#each agents as agent}
					{#if agent.id == actionData.commitments.debtor_id}
						<span class="italic">{agent.role_short}</span>
					{/if}
				{/each}
			{/await}
		</p>
		{#if actionData.messages[0] != undefined}
			<p class="pl-1">{actionData.messages[0].message}</p>
		{/if}
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
