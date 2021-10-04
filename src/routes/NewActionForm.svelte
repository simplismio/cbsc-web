<script>
	import supabase from '$lib/db';
	import { tick } from 'svelte';
	import { dataHasChanged } from '$lib/store.js';
	import IoIosAdd from 'svelte-icons/io/IoIosAdd.svelte';

	let states = [
		{ id: 1, value: 'committed' },
		{ id: 2, value: 'activated' },
		{ id: 3, value: 'satisfied' }
	];

	let selectedCommitment;
	let selectedState;
	export let eventID;

	let startOptionCommitments = 'commitment';
	let startOptionStates = 'new state';

	async function insertAction() {
		const { data, error } = await supabase
			.from('actions')
			.insert([{ commitment_id: selectedCommitment, event_id: eventID }]);
	}

	async function updateCommitmentState() {
		const { data, error } = await supabase
			.from('commitments')
			.update({ state: selectedState })
			.eq('id', selectedCommitment);
	}

	async function insertActionProcedure() {
		dataHasChanged.set(true);
		await insertAction();
		await updateCommitmentState();
		selectedCommitment = startOptionCommitments;
		await tick();
		dataHasChanged.set(false);
	}

	async function getCommitments() {
		let { data, error } = await supabase.from('commitments').select();
		return data;
	}
</script>

<hr />
<form class="max-w-lg w-full">
	<div class="flex mt-3">
		<div class="flex-grow h-8">
			<span class="ml-1 mr-1">Set state for</span>
			<select bind:value={selectedCommitment}>
				<option>{startOptionCommitments}</option>
				{#await getCommitments() then commitments}
					{#each commitments as commitment}
						<option value={commitment.id} class="p-5">
							{commitment.title}
						</option>
					{/each}
				{/await}
			</select>
			<span class="ml-1 mr-1">to</span>
			<span>
				<select bind:value={selectedState}>
					<option>{startOptionStates}</option>
					{#each states as state}
						<option value={state.value}>
							{state.value}
						</option>
					{/each}
				</select>
			</span>
		</div>
		<div class="flex-none w-10 h-8">
			<span on:click|preventDefault={insertActionProcedure} class="gray-400">
				<IoIosAdd />
			</span>
		</div>
	</div>
</form>
