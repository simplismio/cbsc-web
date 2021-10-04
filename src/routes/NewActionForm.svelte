<script>
	import supabase from '$lib/db';
	import { onMount, tick } from 'svelte';
	import { dataHasChanged } from '$lib/store.js';
	import IoIosAdd from 'svelte-icons/io/IoIosAdd.svelte';
	import Loader from './Loader.svelte';
	import { identity } from 'svelte/internal';

	let selectedCommitment;
	let selectedState;
	export let eventID;

	let startOptionCommitments = 'choose commitment';

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
		let { data, error } = await supabase
			.from('commitments')
			.select('id, title, states (id, state)');
		return data;
	}

	async function getStates() {
		let { data, error } = await supabase.from('states').select();
		return data;
	}

	let changed = false;
</script>

<hr />
<form class="max-w-lg w-full">
	<div class="flex mt-3">
		<div class="flex-grow h-8">
			<div>
				{#await getCommitments() then commitments}
					{#each commitments as commitment}
						<div>
							<span>
								{commitment.title}
							</span>
							<span> {commitment.states.state} </span>
						</div>
					{/each}
				{/await}
			</div>

			<!-- {#if changed}
				{#if selectedCommitment != 'choose commitment'}
					<span>will be</span>

					{#await getCurrentCommitmentState() then data}
						<select bind:value={selectedState}>
							{#await getStates() then states}
								{#each states as state}
									{#if data[0].state_id != state.id}
										<option value={state.id}>
											{state.state}
										</option>
									{/if}
								{/each}
							{/await}
						</select>
					{/await}
				{/if}
			{/if} -->
		</div>
		<div class="flex-none w-10 h-8">
			<span on:click|preventDefault={insertActionProcedure} class="gray-400">
				<IoIosAdd />
			</span>
		</div>
	</div>
</form>
