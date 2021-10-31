<script>
	import supabase from '$lib/db.js';
	import { dataHasChanged } from '$lib/store.js';
	import { tick } from 'svelte';

	let commitmentTitleByDebtor;
	let commitmentTitleByCreditor;
	let fluentByDebtorIsAtomic;
	let fluentByCreditorIsAtomic;
	let fluentTitleByDebtor;
	let fluentTitleByCreditor;
	let fluentValueByDebtor;
	let fluentValueByCreditor;
	let fluentByDebtorIsActionOrAmount;
	let fluentByCreditorIsActionOrAmount;
	let fluentByDebtorPaymentTerms = 1;
	let fluentByCreditorPaymentTerms = 1;
	let isConditional;

	async function insertCommitment(_title, _state_id, _debtor_id, _creditor_id) {
		const { data, error } = await supabase
			.from('commitments')
			.insert([
				{ title: _title, state_id: _state_id, debtor_id: _debtor_id, creditor_id: _creditor_id }
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

	//ADD BALANCE AND ORIGINAL BALANCE/PAYMENT TERMS
	async function insertFluent(_commitment, _title, _isAtomic) {
		const { data, error } = await supabase
			.from('fluents')
			.insert([{ title: _title, commitment_id: _commitment[0].id, atomic: _isAtomic }]);
		return data;
	}

	async function insertCommitmentProcedure() {
		dataHasChanged.set(true);

		let _commitment;
		let _fluent;
		let _state_id = 1;
		let _x = 1;
		let _y = 2;

		_commitment = await insertCommitment(commitmentTitleByDebtor, _state_id, _x, _y);

		_fluent = await insertFluent(_commitment, fluentTitleByDebtor, fluentByDebtorIsAtomic);
		await insertBalance(
			_fluent,
			fluentByDebtorIsActionOrAmount,
			fluentValueByDebtor,
			fluentByDebtorPaymentTerms ?? ''
		);

		if (commitmentTitleByCreditor) {
			_commitment = await insertCommitment(commitmentTitleByCreditor, _state_id, _y, _x);
			_fluent = await insertFluent(_commitment, fluentTitleByCreditor, fluentByCreditorIsAtomic);
			await insertBalance(
				_fluent,
				fluentByCreditorIsActionOrAmount,
				fluentValueByCreditor,
				fluentByCreditorPaymentTerms ?? ''
			);
		}
		commitmentTitleByDebtor = '';
		commitmentTitleByCreditor = '';
		fluentByDebtorIsAtomic = '';
		fluentByCreditorIsAtomic = '';
		fluentTitleByDebtor = '';
		fluentTitleByCreditor = '';
		fluentValueByDebtor = '';
		fluentValueByCreditor = '';
		fluentByDebtorIsActionOrAmount = '';
		fluentByCreditorIsActionOrAmount = '';
		fluentByDebtorPaymentTerms = 1;
		fluentByCreditorPaymentTerms = 1;
		isConditional = '';
		await tick();
		dataHasChanged.set(false);
		history.back();
	}

	function checkIfFluentByDebtorIsActionOrAmount() {
		if (fluentByDebtorIsActionOrAmount == 'action') {
			fluentByDebtorIsAtomic = 'no';
		}
	}

	function checkIfFluentByCreditorIsActionOrAmount() {
		if (fluentByCreditorIsActionOrAmount == 'action') {
			fluentByCreditorIsAtomic = 'no';
		}
	}
</script>

<div class="max-w-lg rounded w-11/12 mt-10 border-4 border-gray-700">
	<div class="px-6 py-4">
		<form class="w-full max-w-lg mt-5">
			<h2 class="font-bold text-2xl dark:text-white">Create a new commitment</h2>
			<p
				class="mt-5
			 text-sm dark:text-white"
			>
				An <span class="font-bold">commitment</span> represents promises between debtors and
				creditors. A <span class="font-bold">fluent</span> is the variable that fulfills a commitment.
				For example, a commitment to buy a property, is satisfied through a payment from the debtor.
			</p>
			<p class="mt-3 text-sm dark:text-white">
				A commitment is <span class="font-bold">conditional</span>, if the debtor only fulfils its
				commitment, based on a promise by the creditor to fulfill another commitment
			</p>
			<div class="items-center">
				<div class="grid grid-cols-6 gap-6">
					<div class="col-span-6 sm:col-span-6 mt-10">
						<label class="block text-sm font-bold dark:text-white"
							>Commitment by debtor
							<input
								class="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-1"
								type="text"
								bind:value={commitmentTitleByDebtor}
								placeholder="e.g. Buy, Sell"
								aria-label="Commitment title"
							/>
						</label>
					</div>

					<div class="col-span-6 sm:col-span-3">
						<label class="block text-sm font-bold dark:text-white"
							>Fluent title by debtor
							<input
								type="text"
								bind:value={fluentTitleByDebtor}
								class="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-1"
								placeholder="e.g. Signing a contract"
							/>
						</label>
					</div>
					<div class="col-span-6 sm:col-span-3">
						<label for="last-name" class="block text-sm font-bold dark:text-white"
							>Action or amount</label
						>
						<select
							bind:value={fluentByDebtorIsActionOrAmount}
							on:change|preventDefault={checkIfFluentByDebtorIsActionOrAmount}
							class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						>
							<option>Action or amount</option>
							<option value="0">Action ({fluentTitleByDebtor})</option>
							<option value="1">Amount (e.g. $50)</option>
						</select>
					</div>

					{#if fluentByDebtorIsActionOrAmount == '1'}
						<div class="col-span-6 sm:col-span-3">
							<label for="last-name" class="block text-sm font-bold"
								>Multiple fulfillments allowed?</label
							>
							<select
								bind:value={fluentByDebtorIsAtomic}
								class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							>
								<option>Choose an option</option>
								<option value="0">No</option>
								<option value="1">Yes</option>
							</select>
						</div>

						<div class="col-span-6 sm:col-span-3">
							<label class="block text-sm font-bold"
								>Amount to fulfill
								<input
									type="number"
									bind:value={fluentValueByDebtor}
									class="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-1"
									placeholder="e.g. $50"
								/>
							</label>
						</div>

						{#if fluentByDebtorIsAtomic == '1'}
							<div class="col-span-6 sm:col-span-3">
								<label class="block text-sm font-bold"
									>Payment terms
									<input
										type="number"
										bind:value={fluentByDebtorPaymentTerms}
										class="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-1"
										placeholder="e.g. 3"
									/>
								</label>
							</div>
						{/if}
					{/if}

					<div class="col-span-6 sm:col-span-6 -mt-5">
						<input type="checkbox" bind:checked={isConditional} />
						<span class="text-xs dark:text-white">The debtor's commitment is conditional</span>
					</div>

					{#if isConditional}
						<div class="col-span-6 sm:col-span-6 mt-3">
							<label class="block text-sm font-bold dark:text-white"
								>Commitment by creditor
								<input
									class="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-1"
									type="text"
									bind:value={commitmentTitleByCreditor}
									placeholder="e.g. Buy, Sell"
									aria-label="Commitment title"
								/>
							</label>
						</div>

						<div class="col-span-6 sm:col-span-3">
							<label class="block text-sm font-bold dark:text-white"
								>Fluent title by creditor
								<input
									type="text"
									bind:value={fluentTitleByCreditor}
									class="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-1"
									placeholder="e.g. Signing a contract"
								/>
							</label>
						</div>
						<div class="col-span-6 sm:col-span-3">
							<label class="block text-sm font-bold dark:text-white">Action or amount</label>
							<select
								bind:value={fluentByCreditorIsActionOrAmount}
								on:change|preventDefault={checkIfFluentByCreditorIsActionOrAmount}
								class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							>
								<option>Action or amount</option>
								<option value="0">Action ({fluentTitleByCreditor})</option>
								<option value="1">Amount (e.g. $50)</option>
							</select>
						</div>

						{#if fluentByCreditorIsActionOrAmount == '1'}
							<div class="col-span-6 sm:col-span-3">
								<label for="last-name" class="block text-sm font-bold dark:text-white"
									>Multiple fulfillments allowed?</label
								>
								<select
									bind:value={fluentByCreditorIsAtomic}
									class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								>
									<option>Choose an option</option>
									<option value="0">No</option>
									<option value="1">Yes</option>
								</select>
							</div>

							<div class="col-span-6 sm:col-span-3">
								<label class="block text-sm font-bold dark:text-white"
									>Amount to fulfill
									<input
										type="number"
										bind:value={fluentValueByCreditor}
										class="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-1"
										placeholder="e.g. $50"
									/>
								</label>
							</div>

							{#if fluentByCreditorIsAtomic == '1'}
								<div class="col-span-6 sm:col-span-3">
									<label class="block text-sm font-bold dark:text-white"
										>Payment terms
										<input
											type="number"
											bind:value={fluentByCreditorPaymentTerms}
											class="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-1"
											placeholder="e.g. $50"
										/>
									</label>
								</div>
							{/if}
						{/if}
					{/if}
				</div>

				{#if commitmentTitleByDebtor && fluentTitleByDebtor}
					<div class="bg-gray-900 p-2 pb-6 rounded mt-5 dark:text-white">
						<div class="mt-5 text-center">
							Debtor (x) commits to creditor (y) to <span class="font-bold"
								>{commitmentTitleByDebtor.toLowerCase()}</span
							>
							through fluent
							<span class="font-bold">{fluentTitleByDebtor.toLowerCase()}</span>
							{#if fluentByDebtorIsActionOrAmount == '1' && fluentValueByDebtor != undefined}
								{#if fluentByDebtorIsAtomic == '0'}
									for a total of {fluentValueByDebtor} in one payment{#if commitmentTitleByCreditor && fluentTitleByCreditor},{/if}
								{:else}
									for a total of ${fluentValueByDebtor}, payable over maximum {fluentByDebtorPaymentTerms}
									payment terms{#if commitmentTitleByCreditor && fluentTitleByCreditor},{/if}
								{/if}
							{/if}

							{#if commitmentTitleByCreditor && fluentTitleByCreditor}
								but only if creditor (y) commits to debtor (x) to
								<span class="font-bold">{commitmentTitleByCreditor.toLowerCase()}</span>
								through fluent <span class="font-bold">{fluentTitleByCreditor.toLowerCase()}</span>
								{#if fluentByCreditorIsActionOrAmount == '1' && fluentValueByCreditor != undefined}
									{#if fluentByCreditorIsAtomic == '0'}
										for a total of {fluentValueByCreditor} in one payment
									{:else}
										for a total of ${fluentValueByCreditor}, payable over maximum {fluentByCreditorPaymentTerms}
										payment terms
									{/if}
								{/if}
							{/if}
						</div>
					</div>
				{/if}

				<div class="flex justify-center items-center mb-5 mt-5">
					<button
						on:click|preventDefault={insertCommitmentProcedure}
						class="bg-gray-700 font-bold py-2 px-4 rounded dark:text-white"
					>
						Save
					</button>
				</div>
			</div>
		</form>
	</div>
</div>
