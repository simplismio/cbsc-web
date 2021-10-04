<script>
	import supabase from '$lib/db';
	import { dataHasChanged } from '$lib/store.js';
	import { tick } from 'svelte';

	let commitmentTitleByBuyer;
	let commitmentTitleBySeller;
	let fluentByBuyerIsAtomic;
	let fluentBySellerIsAtomic;
	let fluentTitleByBuyer;
	let fluentTitleBySeller;
	let fluentValueByBuyer;
	let fluentValueBySeller;
	let fluentByBuyerIsActionOrAmount;
	let fluentBySellerIsActionOrAmount;
	let isConditional;

	async function insertCommitment(_title) {
		const { data, error } = await supabase
			.from('commitments')
			.insert([{ title: _title, state_id: 1 }]);
		return data;
	}

	async function insertBalance(_fluent, _actionOrAmount, _value) {
		let balance;
		let _valueData;

		if (_actionOrAmount == 'action') {
			balance = 'non_numerical_balances';
			_valueData = _fluent[0].title;
		}

		if (_actionOrAmount == 'amount') {
			balance = 'numerical_balances';
			_valueData = _value;
		}

		const { data, error } = await supabase
			.from(balance)
			.insert([{ fluent_id: _fluent[0].id, balance: _valueData }]);
		return data;
	}

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

		_commitment = await insertCommitment(commitmentTitleByBuyer);
		_fluent = await insertFluent(_commitment, fluentTitleByBuyer, fluentByBuyerIsAtomic);
		await insertBalance(_fluent, fluentByBuyerIsActionOrAmount, fluentValueByBuyer);

		if (commitmentTitleBySeller) {
			_commitment = await insertCommitment(commitmentTitleBySeller);
			_fluent = await insertFluent(_commitment, fluentTitleBySeller, fluentBySellerIsAtomic);
			await insertBalance(_fluent, fluentBySellerIsActionOrAmount, fluentValueBySeller);
		}
		commitmentTitleByBuyer = '';
		commitmentTitleBySeller = '';
		fluentByBuyerIsAtomic = '';
		fluentBySellerIsAtomic = '';
		fluentTitleByBuyer = '';
		fluentTitleBySeller = '';
		fluentValueByBuyer = '';
		fluentValueBySeller = '';
		fluentByBuyerIsActionOrAmount = '';
		fluentBySellerIsActionOrAmount = '';
		await tick();
		dataHasChanged.set(false);
		history.back();
	}

	function checkIfFluentByBuyerIsActionOrAmount() {
		if (fluentByBuyerIsActionOrAmount == 'action') {
			fluentByBuyerIsAtomic = 'no';
		}
	}

	function checkIfFluentBySellerIsActionOrAmount() {
		if (fluentBySellerIsActionOrAmount == 'action') {
			fluentBySellerIsAtomic = 'no';
		}
	}
</script>

{commitmentTitleBySeller != undefined}

<div class="max-w-lg rounded overflow-hidden shadow-xl w-11/12 mt-5">
	<div class="px-6 py-4">
		<form class="w-full max-w-lg mt-5">
			<h2 class="font-bold text-2xl">Create a new commitment</h2>
			<p class="mt-2">
				An <span class="font-bold">commitment</span> represents promises between buyers and sellers.
				A <span class="font-bold">fluent</span> is the variable that fulfills a commitment. For example,
				a commitment to buy a property, is satisfied through a payment from the buyer.
			</p>
			<p class="mt-3">
				A commitment is <span class="font-bold">conditional</span>, if the buyer only fulfils its
				commitment, based on a promise by the seller to fulfill another commitment
			</p>
			<div class="items-center mt-3">
				<div class="grid grid-cols-6 gap-6">
					<div class="col-span-6 sm:col-span-6 mt-10">
						<label class="block text-sm font-bold"
							>Commitment by buyer
							<input
								class="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-1"
								type="text"
								bind:value={commitmentTitleByBuyer}
								placeholder="e.g. Buy, Sell"
								aria-label="Commitment title"
							/>
						</label>
					</div>

					<div class="col-span-6 sm:col-span-3">
						<label class="block text-sm font-bold"
							>Fluent title by buyer
							<input
								type="text"
								bind:value={fluentTitleByBuyer}
								class="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-1"
								placeholder="e.g. Signing a contract"
							/>
						</label>
					</div>
					<div class="col-span-6 sm:col-span-3">
						<label for="last-name" class="block text-sm font-bold">Action or amount</label>
						<select
							bind:value={fluentByBuyerIsActionOrAmount}
							on:change|preventDefault={checkIfFluentByBuyerIsActionOrAmount}
							class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						>
							<option>Action or amount</option>
							<option value="action">Action (e.g. Pay)</option>
							<option value="amount">Amount (e.g. Amount)</option>
						</select>
					</div>

					{#if fluentByBuyerIsActionOrAmount == 'amount'}
						<div class="col-span-6 sm:col-span-3">
							<label for="last-name" class="block text-sm font-bold"
								>Multiple fulfillments allowed?</label
							>
							<select
								bind:value={fluentByBuyerIsAtomic}
								class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							>
								<option>Yes or no</option>
								<option value="yes">Yes</option>
								<option value="no">No</option>
							</select>
						</div>

						<div class="col-span-6 sm:col-span-3">
							<label class="block text-sm font-bold"
								>Amount to fulfill
								<input
									type="text"
									bind:value={fluentValueByBuyer}
									class="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-1"
									placeholder="e.g. $50"
								/>
							</label>
						</div>
					{/if}

					<div class="col-span-6 sm:col-span-6 mt-0">
						<input type="checkbox" bind:checked={isConditional} />
						<span class="text-xs">The buyer's commitment is conditional</span>
					</div>

					{#if isConditional}
						<div class="col-span-6 sm:col-span-6 mt-3">
							<label class="block text-sm font-bold"
								>Commitment by seller
								<input
									class="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-1"
									type="text"
									bind:value={commitmentTitleBySeller}
									placeholder="e.g. Buy, Sell"
									aria-label="Commitment title"
								/>
							</label>
						</div>

						<div class="col-span-6 sm:col-span-3">
							<label class="block text-sm font-bold"
								>Fluent title by seller
								<input
									type="text"
									bind:value={fluentTitleBySeller}
									class="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-1"
									placeholder="e.g. Signing a contract"
								/>
							</label>
						</div>
						<div class="col-span-6 sm:col-span-3">
							<label for="last-name" class="block text-sm font-bold">Action or amount</label>
							<select
								bind:value={fluentBySellerIsActionOrAmount}
								on:change|preventDefault={checkIfFluentBySellerIsActionOrAmount}
								class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							>
								<option>Action or amount</option>
								<option value="action">Action (e.g. Pay)</option>
								<option value="amount">Amount (e.g. Amount)</option>
							</select>
						</div>

						{#if fluentBySellerIsActionOrAmount == 'amount'}
							<div class="col-span-6 sm:col-span-3">
								<label for="last-name" class="block text-sm font-bold"
									>Multiple fulfillments allowed?</label
								>
								<select
									bind:value={fluentBySellerIsAtomic}
									class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								>
									<option>Yes or no</option>
									<option value="yes">Yes</option>
									<option value="no">No</option>
								</select>
							</div>

							<div class="col-span-6 sm:col-span-3">
								<label class="block text-sm font-bold"
									>Amount to fulfill
									<input
										type="text"
										bind:value={fluentValueBySeller}
										class="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-1"
										placeholder="e.g. $50"
									/>
								</label>
							</div>
						{/if}
					{/if}
				</div>

				{#if commitmentTitleByBuyer && fluentTitleByBuyer}
					<div class="bg-gray-100 pt-1 pb-6 rounded mt-3">
						<div class="mt-5 text-center">
							A buyer commits to the seller to <span class="font-bold"
								>{commitmentTitleByBuyer}</span
							>
							through
							<span class="font-bold">{fluentTitleByBuyer}</span
							>{#if commitmentTitleBySeller && fluentTitleBySeller}, {/if}

							{#if commitmentTitleBySeller && fluentTitleBySeller}
								if the seller commits to the buyer to <span class="font-bold"
									>{commitmentTitleBySeller}</span
								>
								through <span class="font-bold">{fluentTitleBySeller}</span> (fluentTitleBySeller)
							{/if}
						</div>
					</div>
				{/if}

				<div class="flex justify-center items-center mb-5 mt-5">
					<button
						on:click|preventDefault={insertCommitmentProcedure}
						class="bg-yellow-100 font-bold py-2 px-4 rounded mt-4 "
					>
						Save commitment(s)
					</button>
				</div>
			</div>
		</form>
	</div>
</div>
