<script>
	import supabase from '$lib/db.js';
	import { tick } from 'svelte';
	import { dataHasChanged } from '$lib/store.js';

	export let eventData;
	export let eventI;
	export let commitmentData;
	export let nextState;
	export let fluentData;
	export let delegate;
	export let assign;
	export let numericalBalance;
	export let nonNumericalBalance;

	let message;
	let fulfillmentValue;
	let action;

	async function insertAction() {
		const { data, error } = await supabase.from('actions').insert([
			{
				commitment_id: commitmentData.id,
				event_id: eventData.id,
				state_id: commitmentData.states.id + 1
			}
		]);
		return data;
	}

	async function insertMessage(_actionData) {
		const { data, error } = await supabase.from('actions').insert([
			{
				action_id: _actionData.id,
				message: message
			}
		]);
	}

	async function updateCommitmentState(_newState) {
		const { data, error } = await supabase
			.from('commitments')
			.update({ state_id: _newState })
			.eq('id', commitmentData.id);
	}

	async function insertCommitment() {
		const { data, error } = await supabase.from('commitments').insert([
			{
				state_id: 1
			}
		]);
		return data;
	}

	async function insertBalance(_fluent, _actionOrAmount, _value, _terms) {
		let _valueData;

		if (_actionOrAmount == '0') {
			_valueData = _fluent[0].title;
			const { data, error } = await supabase
				.from('non_numerical_balances')
				.insert([{ fluent_id: _fluent[0].id, balance: _valueData }]);
		}

		if (_actionOrAmount == '1') {
			const { data, error } = await supabase
				.from('numerical_balances')
				.insert([
					{ fluent_id: _fluent[0].id, balance: _value, max_terms: _terms, terms_left: _terms }
				]);
		}
	}

	async function insertFluent(_commitment, _title, _isAtomic) {
		const { data, error } = await supabase
			.from('fluents')
			.insert([{ title: _title, commitment_id: _commitment[0].id, atomic: _isAtomic }]);
		return data;
	}

	async function insertCommitmentProcedure() {
		await insertCommitment();
		await insertFluent();
		await insertBalance();
	}

	async function updateBalance(_fulfillmentValue, _balance, _fluent_id) {
		let { data, error } = await supabase
			.from('numerical_balances')
			.update({ balance: _balance - _fulfillmentValue })
			.eq('fluent_id', _fluent_id);
		return data;
	}

	async function insertActionProcedure() {
		dataHasChanged.set(true);
		if (delegate == '0' && assign == '0') {
			action = await insertAction();
			if (message != undefined) {
				await insertMessage(action);
			}
			numericalBalance && fulfillmentValue < numericalBalance
				? await updateBalance()
				: await updateCommitmentState(commitmentData.states.id + 1);
		} else if (delegate == '1') {
			//delegate
			await insertCommitmentProcedure();
			await updateCommitmentState('5');
			if (message != undefined) {
				await insertMessage(action);
			}
		} else {
			//assign
			await insertCommitmentProcedure();
			await updateCommitmentState('6');
			if (message != undefined) {
				await insertMessage(action);
			}
		}

		await tick();
		dataHasChanged.set(false);
	}
</script>

{#if delegate == '0' && assign == '0'}
	<div class="flex flex-wrap text-sm bg-white p-3 mt-1 rounded dark:bg-black dark:text-white">
		<div class="w-3/12 m-auto">
			<span
				><span class="font-bold pl-2">Action</span><span
					class="font-bold dark:bg-gray-700 rounded ml-1 pl-1 pr-1"
					>{eventI + 1}.{eventData.actions.length + 1}</span
				></span
			>
		</div>
		<div class="w-8/12">
			<p class="font-bold pl-1">
				Commitment {commitmentData.title} set to
				<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">{nextState.state}</span>
			</p>
			{#if fluentData.title != undefined}
				<p class="pl-1">
					Fulfillment of {fluentData.title}
					{#if fluentData.atomic == true}
						ok
					{/if}
				</p>
			{:else}
				<input
					type="text"
					bind:value={message}
					class="pt-1 pl-1 bg-black w-full"
					placeholder="Add a message"
				/>
			{/if}
		</div>
		<div class="w-1/12 m-auto">
			<button
				on:click|preventDefault={insertActionProcedure}
				class="text-green-600 text-2xl font-bold rounded pr-2 float-right"
			>
				+
			</button>
		</div>
	</div>
{/if}

{#if delegate == '1'}
	<div class="flex flex-wrap text-sm bg-white p-3 mt-1 rounded dark:bg-black dark:text-white">
		<div class="w-3/12 m-auto">
			<span
				><span class="font-bold pl-2">Action</span><span
					class="font-bold dark:bg-gray-700 rounded ml-1 pl-1 pr-1"
					>{eventI + 1}.{eventData.actions.length + 1}</span
				></span
			>
		</div>
		<div class="w-8/12">
			<p class="font-bold pl-1">
				Commitment {commitmentData.title}
				<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">delegated</span> to
				<span class="italic">XZ</span>
			</p>
			<p class="pl-1">Message</p>
		</div>
		<div class="w-1/12 m-auto">
			<button
				on:click|preventDefault={insertActionProcedure}
				class="text-green-600 text-2xl font-bold rounded pr-2 float-right"
			>
				+
			</button>
		</div>
	</div>
{/if}

{#if assign == '1'}
	<div class="flex flex-wrap text-sm bg-white p-3 mt-1 rounded dark:bg-black dark:text-white">
		<div class="w-3/12 m-auto">
			<span
				><span class="font-bold pl-2">Action</span><span
					class="font-bold dark:bg-gray-700 rounded ml-1 pl-1 pr-1"
					>{eventI + 1}.{eventData.actions.length + 1}</span
				></span
			>
		</div>
		<div class="w-8/12">
			<p class="font-bold pl-1">
				Commitment {commitmentData.title}
				<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">assigned</span> to
				<span class="italic">YZ</span>
			</p>
			<p class="pl-1">Message</p>
		</div>
		<div class="w-1/12 m-auto">
			<button
				on:click|preventDefault={insertActionProcedure}
				class="text-green-600 text-2xl font-bold rounded pr-2 float-right"
			>
				+
			</button>
		</div>
	</div>
{/if}
