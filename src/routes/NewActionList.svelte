<script>
	import supabase from '$lib/db.js';
	import { tick } from 'svelte';
	import { dataHasChanged } from '$lib/store.js';

	import NewActionItem from './NewActionItem.svelte';
	import Loader from './Loader.svelte';
	import { futureActionCounter } from '$lib/store.js';

	let showFutureActions = false;
	let fulfillmentValue;
	let balance;

	export let eventData;
	export let eventI;

	let counter;

	futureActionCounter.subscribe((value) => {
		counter = value;
	});

	async function insertAction(_commitment_id, _state_id) {
		const { data, error } = await supabase
			.from('actions')
			.insert([{ commitment_id: _commitment_id, event_id: eventData.id, state_id: _state_id + 1 }]);
	}

	async function updateCommitmentState(_commitment) {
		const { data, error } = await supabase
			.from('commitments')
			.update({ state_id: _commitment.states.id + 1 })
			.eq('id', _commitment.id);
	}

	async function updateBalance(_fulfillmentValue, _balance, _fluent_id) {
		let { data, error } = await supabase
			.from('numerical_balances')
			.update({ balance: _balance - _fulfillmentValue })
			.eq('fluent_id', _fluent_id);
		return data;
	}

	async function insertActionProcedure(_commitment) {
		dataHasChanged.set(true);
		await insertAction(_commitment.id, _commitment.states.id);
		balance && fulfillmentValue < balance
			? await updateBalance(fulfillmentValue, balance, _commitment.fluents[0].id)
			: await updateCommitmentState(_commitment);
		await tick();
		dataHasChanged.set(false);
	}

	async function getCommitments() {
		let { data, error } = await supabase
			.from('commitments')
			.select('id, title, debtor_id, creditor_id, states(id, state), fluents (id, title, atomic)');
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
</script>

<div class="flex justify-center items-center mt-3 bg-yellow-50 p-2 rounded">
	There are <span class="font-bold ml-1 mr-1"> {counter} </span> actions available for Event {eventI +
		1}
</div>
<div class="rounded text-sm">
	<div class="capitalize">
		{#await getCommitments()}
			<Loader />
		{:then commitments}
			{#each commitments as commitment}
				<form>
					{#if commitment.states.id < 4}
						{#await getStates() then states}
							{#each states as state, i}
								{#if state.id == commitment.states.id}
									<NewActionItem
										{eventData}
										{eventI}
										commitmentData={commitment}
										delegate="0"
										assign="0"
										fluentData={''}
										numericalBalance={''}
										nonNumericalBalance={''}
									/>
									{#if commitment.states.id == 2}
										<NewActionItem
											{eventData}
											{eventI}
											commitmentData={commitment}
											delegate="1"
											assign="1"
											fluentData={''}
											numericalBalance={''}
											nonNumericalBalance={''}
										/>
									{/if}

									{#if commitment.states.id == 3}
										<NewActionItem
											{eventData}
											{eventI}
											commitmentData={commitment}
											delegate="1"
											assign="1"
											fluentData={''}
											numericalBalance={''}
											nonNumericalBalance={''}
										/>
									{/if}

									{#if commitment.states.id == 3}
										{#await getNumericalBalance(commitment.fluents[0].id) then numerical_balances}
											{#if numerical_balances.length > 0}
												{#each numerical_balances as numerical_balance, i}
													<NewActionItem
														{eventData}
														{eventI}
														commitmentData={commitment}
														delegate="0"
														assign="0"
														fluentData={commitment.fluents[0]}
														numericalBalance={numerical_balance.balance}
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
								{/if}
							{/each}
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
</div>
