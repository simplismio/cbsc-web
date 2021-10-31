<script>
	// @ts-nocheck

	import supabase from '$lib/db.js';
	import { dataHasChanged } from '$lib/store.js';

	export let eventData;
	export let eventI;

	let message;
	let fulfillmentValue;
	let newCommitmentID;

	async function getCommitments() {
		let { data, error } = await supabase
			.from('commitments')
			.select(
				'id, title, state, debtor, creditor, fluents (id, title, atomic, balance, terms_left), actions(id, message)'
			);
		if (error) throw new Error(error.message);
		return data;
	}

	async function insertAction(_commitment_id, _newState) {
		const { data, error } = await supabase.from('actions').insert([
			{
				commitment_id: _commitment_id,
				event_id: eventData.id,
				state: _newState,
				message: message,
				fulfillment_value: fulfillmentValue
			}
		]);
		if (error) throw new Error(error.message);

		return data;
	}

	async function updateCommitmentState(_commitment_id, _newState) {
		const { data, error } = await supabase
			.from('commitments')
			.update({ state: _newState })
			.eq('id', _commitment_id);
	}

	async function insertCommitment(_commitment, _debtor, _creditor) {
		const { data, error } = await supabase.from('commitments').insert([
			{
				title: _commitment.title,
				state: _commitment.state,
				debtor: _debtor,
				creditor: _creditor
			}
		]);
		return data;
	}

	async function updateFluent(_fluent_id, _commitment_id, _commitment) {
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
	}

	async function insertCommitmentProcedure(_context, _commitment) {
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
	}

	async function insertActionProcedure(_delegate, _assign, _commitment) {
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
	}

	function nextState(_state) {
		let _nextState;
		switch (_state) {
			case 'defined':
				_nextState = 'commited';
				break;
			case 'commited':
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
							<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">commited</span>
							by
							<span class="italic">{commitment.debtor}</span>
						</p>

						<input
							type="text"
							bind:value={message}
							class="pt-1 pl-1 bg-black w-full"
							placeholder="Message: e.g. commited {commitment.title}"
						/>
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
							<span class="italic">{commitment.debtor}</span>
						</p>

						<input
							type="text"
							bind:value={message}
							class="pt-1 pl-1 bg-black w-full"
							placeholder="Message: e.g. activated {commitment.title}"
						/>
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

			{#if commitment.state == 'commited'}
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
							<span class="italic">{commitment.debtor}</span>
						</p>

						<input
							type="text"
							bind:value={message}
							class="pt-1 pl-1 bg-black w-full"
							placeholder="Message: e.g. activated {commitment.title}"
						/>
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
							<span class="italic">{commitment.debtor}</span>
						</p>

						{#if commitment.fluents[0].title != undefined}
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
							<input
								type="text"
								bind:value={message}
								class="pt-1 pl-1 bg-black w-full"
								placeholder="Message: e.g. satisfied {commitment.title}"
							/>
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
							<span class="italic">xz</span>
						</p>
						<p class="pl-1">
							<input
								type="text"
								bind:value={message}
								class="pt-1 bg-black w-full"
								placeholder="Message: e.g. delegated {commitment.title} to xz"
							/>
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
							<span class="italic">yz</span>
						</p>
						<p class="pl-1">
							<input
								type="text"
								bind:value={message}
								class="pt-1 bg-black w-full"
								placeholder="Message: e.g. assigned {commitment.title} to yz"
							/>
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
