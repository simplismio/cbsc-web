<script>
	// @ts-nocheck
	import supabase from '$lib/db.js';
	import { dataHasChanged } from '$lib/store.js';
	import { message } from './Message.svelte';
	import Message from './Message.svelte';

	export let eventData;
	export let eventI;

	let fulfillmentValue;
	let newCommitmentID;

	async function getCommitments() {
		try {
			let { data, error } = await supabase
				.from('commitments')
				.select(
					'id, title, state, debtor, creditor, fluents (id, title, atomic, balance, terms_left), actions(id, message)'
				);
			if (error) throw new Error(error.message);
			return data;
		} catch (err) {
			console.log(err.message);
		}
	}

	async function insertAction(_commitment_id, _newState) {
		try {
			const { data, error } = await supabase.from('actions').insert([
				{
					commitment_id: _commitment_id,
					event_id: eventData.id,
					state: _newState,
					message: message,
					fulfillment_value: fulfillmentValue
				}
			]);
			return data;
		} catch (err) {
			console.log(err.message);
		}
	}

	async function updateCommitmentState(_commitment_id, _newState) {
		try {
			const { data, error } = await supabase
				.from('commitments')
				.update({ state: _newState })
				.eq('id', _commitment_id);
		} catch (err) {
			console.log(err.message);
		}
	}

	async function insertCommitment(_commitment, _debtor, _creditor) {
		try {
			const { data, error } = await supabase.from('commitments').insert([
				{
					title: _commitment.title,
					state: _commitment.state,
					debtor: _debtor,
					creditor: _creditor
				}
			]);
			return data;
		} catch (err) {
			console.log(err.message);
		}
	}

	async function updateFluent(_fluent_id, _commitment_id, _commitment) {
		try {
			const { data, error } = await supabase
				.from('fluents')
				.update([
					{
						commitment_id: _commitment_id,
						balance:
							fulfillmentValue == undefined
								? null
								: _commitment.fluents[0].balance - fulfillmentValue,
						terms_left: fulfillmentValue == undefined ? null : _commitment.fluents[0].terms_left - 1
					}
				])
				.eq('id', _fluent_id);
			return;
		} catch (err) {
			console.log(err.message);
		}
	}

	async function insertCommitmentProcedure(_context, _commitment) {
		try {
			let commitment;
			if (_context === 'delegate') {
				commitment = await insertCommitment(_commitment, 'xz', _commitment.creditor);
				await updateFluent(_commitment.fluents[0].id, commitment[0].id, _commitment);
				return commitment[0].id;
			} else {
				commitment = await insertCommitment(_commitment, _commitment.debtor, 'yz');
				await updateFluent(_commitment.fluents[0].id, commitment[0].id, _commitment);
				return commitment[0].id;
			}
		} catch (err) {
			console.log(err.message);
		}
	}

	async function insertActionProcedure(_delegate, _assign, _commitment) {
		try {
			dataHasChanged.set(true);
			if (_delegate === 0 && _assign === 0) {
				await insertAction(_commitment.id, nextState(_commitment.state));
				if (fulfillmentValue == undefined) {
					await updateCommitmentState(_commitment.id, nextState(_commitment.state));
				}
				if (fulfillmentValue != undefined && fulfillmentValue < _commitment.fluents[0].balance) {
					await updateFluent(_commitment.fluents[0].id, _commitment.id, _commitment);
				}
				if (fulfillmentValue != undefined && fulfillmentValue == _commitment.fluents[0].balance) {
					await updateCommitmentState(_commitment.id, nextState(_commitment.state));
					await updateFluent(_commitment.fluents[0].id, _commitment.id, _commitment);
				}
			} else if (_delegate === 1) {
				await updateCommitmentState(_commitment.id, 'canceled');
				await insertAction(_commitment.id, 'canceled');
				newCommitmentID = await insertCommitmentProcedure('delegate', _commitment);
				await insertAction(newCommitmentID, _commitment.state);
			} else {
				await updateCommitmentState(_commitment.id, 'released');
				await insertAction(_commitment.id, 'released');
				newCommitmentID = await insertCommitmentProcedure('assign', _commitment);
				await insertAction(newCommitmentID, _commitment.state);
			}
			dataHasChanged.set(false);
		} catch (err) {
			console.log(err.message);
		}
	}

	function nextState(_state) {
		let _nextState;
		switch (_state) {
			case 'defined':
				_nextState = 'committed';
				break;
			case 'committed':
				_nextState = 'activated';
				break;
			case 'activated':
				_nextState = 'satisfied';
				break;
		}
		return _nextState;
	}
</script>

<div class="rounded text-sm">
	{#await getCommitments() then commitments}
		{#each commitments as commitment}
			{#if commitment.state == 'defined'}
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
							Commitment <span class="font-bold">{commitment.title}</span>
							<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">committed</span>
							by
							<span class="font-bold">{commitment.debtor}</span>
						</p>
						<Message />
					</div>

					<div class="w-1/12 m-auto">
						<button
							on:click|preventDefault={() => insertActionProcedure(0, 0, commitment)}
							class="text-green-600 text-2xl font-bold rounded pr-2 float-right"
						>
							+
						</button>
					</div>
				</div>

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
							Commitment <span class="font-bold">{commitment.title}</span>
							<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">activated</span>
							by
							<span class="font-bold">{commitment.debtor}</span>
						</p>
						<Message />
					</div>
					<div class="w-1/12 m-auto">
						<button
							on:click|preventDefault={() => insertActionProcedure(0, 0, commitment)}
							class="text-green-600 text-2xl font-bold rounded pr-2 float-right"
						>
							+
						</button>
					</div>
				</div>
			{/if}

			{#if commitment.state == 'committed'}
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
							Commitment <span class="font-bold">{commitment.title}</span>
							<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">activated</span>
							by
							<span class="font-bold">{commitment.debtor}</span>
						</p>
						<Message />
					</div>
					<div class="w-1/12 m-auto">
						<button
							on:click|preventDefault={() => insertActionProcedure(0, 0, commitment)}
							class="text-green-600 text-2xl font-bold rounded pr-2 float-right"
						>
							+
						</button>
					</div>
				</div>
			{/if}

			{#if commitment.state == 'activated'}
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
							Commitment <span class="font-bold">{commitment.title}</span>

							<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">satisfied</span>
							by
							<span class="font-bold">{commitment.debtor}</span>
						</p>

						{#if commitment.fluents[0] != undefined}
							<p class="pl-1">
								{#if commitment.fluents[0].atomic == true}
									Fulfillment of {commitment.fluents[0].title} fulfills {commitment.title}
								{/if}
								{#if commitment.fluents[0].atomic == false}
									<input
										type="text"
										bind:value={fulfillmentValue}
										class="pt-1 bg-black w-full"
										placeholder="Balance is {commitment.fluents[0].balance} ({commitment.fluents[0]
											.terms_left} payment terms left)"
									/>
								{/if}
							</p>
						{:else}
							<Message />
						{/if}
					</div>
					<div class="w-1/12 m-auto">
						<button
							on:click|preventDefault={() => insertActionProcedure(0, 0, commitment)}
							class="text-green-600 text-2xl font-bold rounded pr-2 float-right"
						>
							+
						</button>
					</div>
				</div>
			{/if}

			{#if commitment.state != 'defined' && commitment.state != 'satisfied' && commitment.state != 'canceled' && commitment.state != 'released' && commitment.debtor != 'xz'}
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
							Commitment <span class="font-bold">{commitment.title}</span>
							<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">delegated</span> to
							<span class="font-bold">xz</span>
						</p>
						<p>
							<Message />
						</p>
					</div>
					<div class="w-1/12 m-auto">
						<button
							on:click|preventDefault={() => insertActionProcedure(1, 0, commitment)}
							class="text-green-600 text-2xl font-bold rounded pr-2 float-right"
						>
							+
						</button>
					</div>
				</div>
			{/if}

			{#if commitment.state != 'defined' && commitment.state != 'satisfied' && commitment.state != 'canceled' && commitment.state != 'released' && commitment.creditor != 'yz'}
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
							Commitment <span class="font-bold">{commitment.title}</span>
							<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">assigned</span> to
							<span class="font-bold">yz</span>
						</p>
						<p>
							<Message />
						</p>
					</div>
					<div class="w-1/12 m-auto">
						<button
							on:click|preventDefault={() => insertActionProcedure(0, 1, commitment)}
							class="text-green-600 text-2xl font-bold rounded pr-2 float-right"
						>
							+
						</button>
					</div>
				</div>
			{/if}
		{:else}
			<div class="dark:text-white p-5 font-bold bg-black text-center mt-1 rounded">
				Add a commitment to this event to continue
			</div>
		{/each}
	{:catch error}
		<span class="text-sm">{error}</span>
	{/await}
</div>
