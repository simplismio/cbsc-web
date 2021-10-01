<script>
	import supabase from '$lib/db';
	import { tick } from 'svelte';
	import { dataHasChanged } from '$lib/store.js';

	let actions = [
		{ id: 1, value: 'Commit' },
		{ id: 2, value: 'Activated' },
		{ id: 3, value: 'Satisfied' }
	];

	let selectedCommitment;
	let selectedAction;
	export let eventID;

	let startOptionCommitments = 'Choose option';
	let startOptionActions = 'Create action for';

	async function insertAction() {
		const { data, error } = await supabase
			.from('actions')
			.insert([{ commitment_id: selectedCommitment, event_id: eventID }]);
		selectedCommitment = startOptionCommitments;
		dataHasChanged.set(true);
		await tick();
		dataHasChanged.set(false);
	}

	async function getCommitments() {
		let { data, error } = await supabase.from('commitments').select();
		return data;
	}
</script>

<form class="max-w-lg mt-3 w-full">
	<div class="flex items-center w-full">
		{#await getCommitments() then commitments}
			<span class="">
				<select bind:value={selectedAction}>
					<option>{startOptionActions}</option>

					{#each actions as action}
						<option value={action.value} class="p-5">
							{action.value}
						</option>
					{/each}
				</select>
			</span>
			<span class="ml-2 mr-2">commitment</span>
			<span class=" ">
				<select bind:value={selectedCommitment}>
					<option>{startOptionCommitments}</option>

					{#each commitments as commitment}
						<option value={commitment.id} class="p-5">
							{commitment.title}
						</option>
					{/each}
				</select>
			</span>
			<span class="ml-4">
				<input
					class="bg-black hover:bg-gray-400 focus:shadow-outline focus:outline-none text-white py-0 px-2 rounded"
					type="submit"
					value="+"
					on:click|preventDefault={insertAction}
				/>
			</span>
		{/await}
	</div>
</form>
