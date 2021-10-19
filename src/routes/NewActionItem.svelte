<script>
	import supabase from '$lib/db.js';
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
	let commitment;
	let newCommitmentID;

	async function insertAction(_commitment_id, _newState) {
		const { data, error } = await supabase.from('actions').insert([
			{
				commitment_id: _commitment_id,
				event_id: eventData.id,
				state_id: _newState
			}
		]);
		return data;
	}

	async function insertMessage(_actionID) {
		const { data, error } = await supabase.from('messages').insert([
			{
				action_id: _actionID,
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

	async function insertCommitment(_debtor_id, _creditor_id) {
		const { data, error } = await supabase.from('commitments').insert([
			{
				title: commitmentData.title,
				state_id: commitmentData.states.id,
				debtor_id: _debtor_id,
				creditor_id: _creditor_id
			}
		]);
		return data;
	}

	async function updateFluent(_fluent_id, _commitment_id) {
		const { data, error } = await supabase
			.from('fluents')
			.update([{ commitment_id: _commitment_id }])
			.eq('id', _fluent_id);
		return;
	}

	async function insertCommitmentProcedure(_context) {
		if (_context == 'delegate') {
			commitment = await insertCommitment(3, 2);
			await updateFluent(fluentData.id, commitment[0].id);
		} else {
			commitment = await insertCommitment(1, 4);
			await updateFluent(fluentData.id, commitment[0].id);
		}
		return commitment[0].id;
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
			action = await insertAction(commitmentData.id, commitmentData.states.id + 1);
			if (message != undefined) {
				await insertMessage(action[0].id);
			}
			numericalBalance && fulfillmentValue < numericalBalance
				? await updateBalance()
				: await updateCommitmentState(commitmentData.states.id + 1);
		} else if (delegate == '1') {
			await updateCommitmentState('5');
			action = await insertAction(commitmentData.id, '5');
			if (message != undefined) {
				await insertMessage(action[0].id);
			}
			newCommitmentID = await insertCommitmentProcedure('delegate');
			action = await insertAction(newCommitmentID, commitmentData.states.id);
		} else {
			await updateCommitmentState('6');
			action = await insertAction(commitmentData.id, '6');
			if (message != undefined) {
				await insertMessage(action[0].id);
			}
			newCommitmentID = await insertCommitmentProcedure('assign');
			action = await insertAction(newCommitmentID, commitmentData.states.id);
		}
		dataHasChanged.set(false);
	}

	async function getAgents() {
		let { data: agents, error } = await supabase.from('agents').select();
		if (error) throw new Error(error.message);
		return agents;
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
			<p class="pl-1">
				Commitment <span class="font-bold">{commitmentData.title}</span>
				<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">{nextState.state}</span> by
				{#await getAgents() then agents}
					{#each agents as agent}
						{#if agent.id == commitmentData.debtor_id}
							<span class="italic">{agent.role_short}</span>
						{/if}
					{/each}
				{/await}
			</p>
			{#if fluentData.title != undefined}
				<p class="pl-1">
					{#if fluentData.atomic == '1'}
						Fulfillment of {fluentData.title}
					{/if}
					{#if fluentData.atomic == '0'}
						<input
							type="text"
							bind:value={fulfillmentValue}
							class="pt-1 bg-black w-full"
							placeholder="Fulfillment amount"
						/>
					{/if}
				</p>
			{:else}
				<input
					type="text"
					bind:value={message}
					class="pt-1 pl-1 bg-black w-full"
					placeholder="Message: e.g. Committed {commitmentData.title}"
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
			<p class="pl-1">
				Commitment <span class="font-bold">{commitmentData.title}</span>
				<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">delegated</span> to
				<span class="italic">XZ</span>
			</p>
			<p class="pl-1">
				<input
					type="text"
					bind:value={message}
					class="pt-1 bg-black w-full"
					placeholder="Message: e.g. Delegated {commitmentData.title} to XZ"
				/>
			</p>
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
			<p class="pl-1">
				Commitment <span class="font-bold">{commitmentData.title}</span>
				<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">assigned</span> to
				<span class="italic">YZ</span>
			</p>
			<p class="pl-1">
				<input
					type="text"
					bind:value={message}
					class="pt-1 bg-black w-full"
					placeholder="Message: e.g. Assigned {commitmentData.title} to YZ"
				/>
			</p>
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
