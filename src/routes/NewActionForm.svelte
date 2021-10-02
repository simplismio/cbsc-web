<script>
	import supabase from '$lib/db';
	import { tick } from 'svelte';
	import { dataHasChanged } from '$lib/store.js';
	import IoIosAdd from 'svelte-icons/io/IoIosAdd.svelte';

	let actions = [
		{ id: 1, value: 'Commit' },
		{ id: 2, value: 'Activated' },
		{ id: 3, value: 'Satisfied' }
	];

	let selectedCommitment;
	let selectedAction;
	export let eventID;

	let startOptionCommitments = 'Choose option';
	let startOptionActions = 'Action for';

	async function insertAction() {
		dataHasChanged.set(true);
		const { data, error } = await supabase
			.from('actions')
			.insert([{ commitment_id: selectedCommitment, event_id: eventID }]);
		selectedCommitment = startOptionCommitments;
		await tick();
		dataHasChanged.set(false);
	}

	async function getCommitments() {
		let { data, error } = await supabase.from('commitments').select();
		return data;
	}
</script>

<form class="max-w-lg mt-3 w-full">
	<div class="flex mt-5">
		<div class="flex-none w-25 h-8 ...">
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
		</div>
		<div class="flex-none w-30 h-8 ..."><span class="ml-2 mr-2">commitment</span></div>
		<div class="flex-grow h-8 ...">
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
		</div>
		<div class="flex-none w-10 h-8 ...">
			<span on:click|preventDefault={insertAction} class="gray-400">
				<IoIosAdd />
			</span>
		</div>
	</div>
</form>
