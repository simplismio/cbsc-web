<script>
	import supabase from '$lib/db.js';
	import { dataHasChanged } from '$lib/store.js';

	async function deleteAction(_action_id) {
		try {
			const { data, error } = await supabase.from('actions').delete().eq('id', _action_id);
			return;
		} catch (err) {
			console.log(err.message);
		}
	}

	async function deleteCommitment(_commitment_id) {
		try {
			const { data, error } = await supabase.from('commitments').delete().eq('id', _commitment_id);
			return;
		} catch (err) {
			console.log(err.message);
		}
	}

	async function updatePreviousFluentState(_fluent_id, _previous_commitment_id) {
		try {
			const { data, error } = await supabase
				.from('fluents')
				.update({ commitment_id: _previous_commitment_id })
				.eq('id', _fluent_id);
			return;
		} catch (err) {
			console.log(err.message);
		}
	}

	async function updatePreviousCommitmentState(_previous_commitment_id, _previous_state) {
		try {
			const { data, error } = await supabase
				.from('commitments')
				.update({ state: _previous_state })
				.eq('id', _previous_commitment_id);
			return;
		} catch (err) {
			console.log(err.message);
		}
	}

	function newState(_state) {
		let _newState;

		switch (_state) {
			case 'committed':
				_newState = 'defined';
				break;
			case 'activated':
				_newState = 'committed';
				break;
			case 'satisfied':
				_newState = 'activated';
				break;
		}
		return _newState;
	}

	async function updateCommitmentState(_action) {
		try {
			let _newState = newState(_action.state);
			const { data, error } = await supabase
				.from('commitments')
				.update({ state: _newState })
				.eq('id', _action.commitments.id);
			return;
		} catch (err) {
			console.log(err.message);
		}
	}

	async function updateFluent(_fluent, _fulfillment_value) {
		try {
			const { data, error } = await supabase
				.from('fluents')
				.update({
					balance: _fluent.balance + _fulfillment_value,
					terms_left: _fluent.terms_left + 1
				})
				.eq('id', _fluent.id);
			return;
		} catch (err) {
			console.log(err.message);
		}
	}

	async function deleteActionProcedure(_action, _actions, _i) {
		dataHasChanged.set(true);

		if (
			_action.state === 'satisfied' &&
			_action.commitments.fluents[0].atomic === false &&
			_action.fulfillment_value != null
		) {
			await deleteAction(_action.id);
			await updateFluent(_action.commitments.fluents[0], _action.fulfillment_value);
		}

		if (_action.state === 'canceled' || _action.state === 'released') {
			await updatePreviousCommitmentState(_action.commitments.id, _actions[_i + 1].state);
			await updatePreviousFluentState(
				_actions[_i + 1].commitments.fluents[0].id,
				_action.commitments.id
			);

			await deleteAction(_action.id);
			await deleteAction(_actions[_i + 1].id);
			await deleteCommitment(_actions[_i + 1].commitments.id);
		}

		if (
			_action.state === 'committed' ||
			(_action.state === 'activated' &&
				(_actions[_i - 1].state === 'canceled' || _actions[_i - 1].state === 'released'))
		) {
			try {
				await updatePreviousCommitmentState(_actions[_i - 1].commitments.id, _action.state);
				await updatePreviousFluentState(
					_action.commitments.fluents[0].id,
					_actions[_i - 1].commitments.id
				);
				await deleteAction(_action.id);
				await deleteAction(_actions[_i - 1].id);
				await deleteCommitment(_action.commitments.id);
			} catch (err) {
				console.log(err.message);
			}
		}

		if (_actions[_i - 1] !== undefined) {
			if (_action.state === 'committed' || _action.state === 'activated') {
				if (
					_actions[_i - 1].state === 'defined' ||
					_actions[_i - 1].state === 'committed' ||
					_actions[_i - 1].state === 'activated' ||
					_actions[_i - 1].state === 'satisfied'
				) {
					try {
						await updateCommitmentState(_action);
						await deleteAction(_action.id);
					} catch (err) {
						console.log(err.message);
					}
				}
			}
		}

		if (_actions[_i - 1] === undefined) {
			if (_action.state === 'committed' || _action.state === 'activated') {
				try {
					await updateCommitmentState(_action);
					await deleteAction(_action.id);
				} catch (err) {
					console.log(err.message);
				}
			}
		}

		dataHasChanged.set(false);
	}

	export let eventI;
	export let eventID;

	async function getActions(_eventID) {
		try {
			let { data: actions, error } = await supabase
				.from('actions')
				.select(
					'id, state, message, fulfillment_value, commitments (id, title, state, debtor, creditor, fluents(id, commitment_id, atomic, original_balance, balance, max_terms, terms_left))))'
				)
				.eq('event_id', _eventID);
			if (error) throw new Error(error.message);
			return actions;
		} catch (err) {
			console.log(err.message);
		}
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
						{#if action.state === 'committed' || action.state === 'activated' || action.state === 'satisfied' || action.state === 'canceled'}
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
					on:click|preventDefault={() => deleteActionProcedure(action, actions, i)}
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
