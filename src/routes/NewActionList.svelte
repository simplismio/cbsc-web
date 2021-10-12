<script>
	import supabase from '$lib/db.js';
	import NewActionItem from './NewActionItem.svelte';
	import { onMount } from 'svelte';

	export let eventData;
	export let eventI;

	let states;

	async function getCommitments() {
		let { data, error } = await supabase
			.from('commitments')
			.select(
				'id, title, debtor_id, creditor_id, states(id, state), fluents (id, title, atomic), actions(id, messages(id, message))'
			);
		if (error) throw new Error(error.message);
		return data;
	}

	async function getNumericalBalance(_fluent_id) {
		let { data, error } = await supabase
			.from('numerical_balances')
			.select()
			.eq('fluent_id', _fluent_id);
		return data;
	}

	async function getNonNumericalBalance(_fluent_id) {
		let { data, error } = await supabase
			.from('non_numerical_balances')
			.select()
			.eq('fluent_id', _fluent_id);
		return data;
	}

	async function getStates() {
		let { data, error } = await supabase.from('states').select();
		return data;
	}

	onMount(async () => {
		states = await getStates();
	});
</script>

<div class="rounded text-sm">
	{#await getCommitments() then commitments}
		{#each commitments as commitment}
			<form>
				{#if commitment.states.id < 3}
					<NewActionItem
						{eventData}
						{eventI}
						commitmentData={commitment}
						nextState={states[commitment.states.id + 1 - 1]}
						delegate="0"
						assign="0"
						fluentData={''}
						numericalBalance={''}
						nonNumericalBalance={''}
					/>

					{#if commitment.debtor_id != 3 || commitment.creditor_id != 4}
						<NewActionItem
							{eventData}
							{eventI}
							commitmentData={commitment}
							nextState=""
							delegate="1"
							assign="1"
							fluentData={commitment.fluents[0]}
							numericalBalance={''}
							nonNumericalBalance={''}
						/>
					{/if}
				{/if}

				{#if commitment.states.id == 3}
					{#if commitment.debtor_id != 3 || commitment.creditor_id != 4}
						<NewActionItem
							{eventData}
							{eventI}
							commitmentData={commitment}
							nextState=""
							delegate={commitment.debtor_id != 3 ? '1' : '0'}
							assign={commitment.creditor_id != 4 ? '1' : '0'}
							fluentData={commitment.fluents[0]}
							numericalBalance={''}
							nonNumericalBalance={''}
						/>
					{/if}
					{#await getNumericalBalance(commitment.fluents[0].id) then numerical_balances}
						{#if numerical_balances.length > 0}
							{#each numerical_balances as numerical_balance, i}
								<NewActionItem
									{eventData}
									{eventI}
									commitmentData={commitment}
									nextState={states[commitment.states.id + 1 - 1]}
									delegate="0"
									assign="0"
									fluentData={commitment.fluents[0]}
									numericalBalance={numerical_balance}
									nonNumericalBalance={''}
								/>
							{/each}
						{/if}
					{/await}

					{#await getNonNumericalBalance(commitment.fluents[0].id) then non_numerical_balances}
						{#if non_numerical_balances.length > 0}
							{#each non_numerical_balances as non_numerical_balance, i}
								<NewActionItem
									{eventData}
									{eventI}
									commitmentData={commitment}
									nextState={states[commitment.states.id + 1 - 1]}
									delegate="0"
									assign="0"
									fluentData={commitment.fluents[0]}
									numericalBalance={''}
									nonNumericalBalance={non_numerical_balance.balance}
								/>
							{/each}
						{/if}
					{/await}
				{/if}
			</form>
		{:else}
			<span>Create a commitment first</span>
		{/each}
	{:catch error}
		<span class="text-sm">{error}</span>
	{/await}
</div>
