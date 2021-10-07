<script language="typescript">
	import supabase from '$lib/db';
	import { tick } from 'svelte';
	import { dataHasChanged } from '$lib/store.js';

	let showFutureActions = false;
	let fulfillmentValue;
	let balance;

	export let eventID;
	export let eventI;

	async function insertAction(_commitment_id, _state_id) {
		const { data, error } = await supabase
			.from('actions')
			.insert([{ commitment_id: _commitment_id, event_id: eventID, state_id: _state_id + 1 }]);
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
			.select('id, title, states(id, state), fluents (id, title, atomic)');
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

<button
	on:click|preventDefault={() =>
		showFutureActions == true ? (showFutureActions = false) : (showFutureActions = true)}
	class=""
>
	Show future actions
</button>

{#if showFutureActions}
	<div class="capitalize">
		{#await getCommitments() then commitments}
			{#each commitments as commitment}
				<form>
					{#if commitment.states.id < 4}
						{eventI + 1}.{1}

						{commitment.states.state}

						{#await getStates() then states}
							{#each states as state, i}
								{#if state.id == commitment.states.id}
									{states[i + 1].state}
									{#if states[i + 1].id == 4}
										<span>(partially)</span>
									{/if}
									{#if commitment.states.id == 3}{commitment.fluents[0].title}
										{#await getNumericalBalance(commitment.fluents[0].id) then numerical_balances}
											{#if numerical_balances.length > 0}
												{#each numerical_balances as numerical_balance, i}
													{numerical_balance.balance}
													{#if commitment.fluents[0].atomic == true}
														<input
															bind:value={fulfillmentValue}
															class="border"
															placeholder="Fulfillment amount"
															on:keypress={() => (balance = numerical_balance.balance)}
														/>
													{/if}
												{/each}
											{/if}
										{/await}

										{#await getNonNumericalBalance(commitment.fluents[0].id) then non_numerical_balances}
											{#if non_numerical_balances.length > 0}
												{#each non_numerical_balances as non_numerical_balance, i}
													{non_numerical_balance.balance}
												{/each}
											{/if}
										{/await}
									{/if}
								{/if}
							{/each}
						{/await}
						<button
							on:click|preventDefault={() => insertActionProcedure(commitment)}
							class="font-bold text-2xl"
						>
							+
						</button>
					{/if}
				</form>
			{:else}
				<span>Create a commitment first</span>
			{/each}
		{:catch error}
			<span class="text-sm">{error}</span>
		{/await}
	</div>
{/if}
