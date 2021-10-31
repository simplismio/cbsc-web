<script>
	import supabase from '$lib/db.js';
	import { dataHasChanged } from '$lib/store.js';

	async function deleteAction(_action) {
		const { data, error } = await supabase.from('actions').delete().eq('id', _action.id);
		return;
	}

	async function updateCommitmentState(_action) {
		let _newState;

		switch (_action.state) {
			case 'committed':
				_newState = 'defined';
				break;
			case 'activated':
				_newState = 'commited';
				break;
			case 'satisfied':
				_newState = 'activated';
				break;
		}

		const { data, error } = await supabase
			.from('commitments')
			.update({ state: _newState })
			.eq('id', _action.commitments.id);
		return;
	}

	async function updateFluent(_fluent, _fulfillment_value) {
		const { data, error } = await supabase
			.from('fluents')
			.update({ balance: _fluent.balance + _fulfillment_value, terms_left: _fluent.terms_left + 1 })
			.eq('id', _fluent.id);
		return;
	}

	async function deleteActionProcedure(_action) {
		dataHasChanged.set(true);
		await deleteAction(_action);

		if (
			_action.state === 'satisfied' &&
			_action.commitments.fluents[0].atomic === false &&
			_action.fulfillment_value != null
		) {
			await updateFluent(_action.commitments.fluents[0], _action.fulfillment_value);
		}
		await updateCommitmentState(_action);
		dataHasChanged.set(false);
	}

	export let eventI;
	export let eventID;

	async function getActions(_eventID) {
		let { data: actions, error } = await supabase
			.from('actions')
			.select(
				'id, state, message, fulfillment_value, commitments (id, title, state, debtor, creditor, fluents(id, atomic, original_balance, balance, max_terms, terms_left))))'
			)
			.eq('event_id', _eventID);
		if (error) throw new Error(error.message);
		return actions;
	}
</script>

{#await getActions(eventID) then actions}
	{#each actions as action, i}
		<div class="flex flex-wrap text-sm bg-white p-3 mt-1 rounded dark:bg-black dark:text-white">
			<div class="w-3/12 m-auto">
				<span
					><span class="font-bold pl-2">Action</span>
					<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">{eventI + 1}.{i + 1}</span
					></span
				>
			</div>
			<div class="w-8/12 m-auto">
				<p class="pl-1">
					Commitment <span class="font-bold">{action.commitments.title}</span>
					<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">{action.state}</span>
					{#if action.state === 'satisfied' && action.fulfillment_value != null}
						({action.fulfillment_value}/{action.commitments.fluents[0].original_balance})
					{/if}
					by
					<span class="font-bold">
						{#if action.state === 'commited' || action.state === 'activated' || action.state === 'satisfied' || action.state === 'canceled'}
							{action.commitments.debtor}
						{/if}
						{#if action.state === 'released'}
							{action.commitments.creditor}
						{/if}
					</span>
				</p>
				{#if action.message != null}
					<p class="pl-1">{action.message}</p>
				{/if}
			</div>
			<div class="w-1/12 m-auto">
				<button
					on:click|preventDefault={() => deleteActionProcedure(action)}
					class="text-red-600 text-2xl font-bold rounded pr-2 float-right"
				>
					-
				</button>
			</div>
		</div>
	{/each}
{:catch error}
	<span class="text-sm">{error}</span>
{/await}
