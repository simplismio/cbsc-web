<script>
	import supabase from '$lib/db.js';
	import Loader from './utilities/Loader.svelte';

	let totalScenarios;
	let calculating;

	async function getCommitments() {
		let { data: commitments, error } = await supabase
			.from('commitments')
			.select('id, title, state, fluents(title, atomic,  balance, max_terms)');
		return commitments;
	}

	async function getSimulations() {
		let { data: simulations, error } = await supabase.from('simulations').select();
		return simulations;
	}

	async function getSimulationsByScenario(_i) {
		let { data: simulations, error } = await supabase
			.from('simulations')
			.select()
			.eq('scenario', _i);
		return simulations;
	}

	async function clearSimulations() {
		let _start;
		let _counter;

		try {
			let {
				data: simulations,
				error,
				count
			} = await supabase.from('simulations').select('id', { count: 'exact' });
			if (
				// @ts-ignore
				simulations == ''
			) {
				_start = 0;
				_counter = 0;
			} else {
				_start = simulations[0].id;
				_counter = simulations[0].id + simulations.length;
			}

			for (var i = _start ?? 0; i < _counter; i++) {
				await supabase.from('simulations').delete().match({
					id: i
				});
			}
		} catch (err) {
			console.log(err.message);
		}
	}

	async function insertSimulation(_scenario, _commitment_id, _title, _state, _debtor, _creditor) {
		const { data, error } = await supabase.from('simulations').insert([
			{
				scenario: _scenario,
				title: _title,
				commitment_id: _commitment_id,
				state: _state,
				debtor: _debtor,
				creditor: _creditor
			}
		]);
		return data;
	}

	async function getSimulation(_commitment_id, _scenario) {
		let { data: simulation, error } = await supabase
			.from('simulations')
			.select('id, title, commitment_id, state, scenario, debtor, creditor')
			.eq('commitment_id', _commitment_id)
			.eq('scenario', _scenario);

		return simulation;
	}

	async function countUniqueScenarios() {
		let _uniqueScenarios = [];
		let _uniqueScenarioCount;

		let { data: simulations, error } = await supabase.from('simulations').select('scenario');

		for (var i = 0; i < simulations.length; i++) {
			_uniqueScenarios.push(simulations[i].scenario);
		}
		_uniqueScenarioCount = Math.max.apply(null, _uniqueScenarios);

		return _uniqueScenarioCount;
	}

	async function copySimulationToNewScenario(_currentScenario) {
		let { data: simulations, error } = await supabase
			.from('simulations')
			.select('id, title, commitment_id, state, scenario, debtor, creditor')
			.eq('scenario', _currentScenario);

		let _scenarios = await countUniqueScenarios();

		for (let i = 0; i < simulations.length; i++) {
			await insertSimulation(
				_scenarios + 1,
				simulations[i].commitment_id,
				simulations[i].title,
				simulations[i].state,
				simulations[i].debtor,
				simulations[i].creditor
			);
		}
		return _scenarios + 1;
	}

	async function simulationBuilder(_simulation, _commitment, _currentScenario) {
		let _return = false;
		let _newScenario;

		switch (_simulation[_simulation.length - 1].state) {
			case 'defined':
				await insertSimulation(
					_simulation[_simulation.length - 1].scenario,
					_commitment.id,
					_commitment.title,
					'committed',
					_simulation[_simulation.length - 1].debtor,
					_simulation[_simulation.length - 1].creditor
				);

				await insertSimulation(
					_simulation[_simulation.length - 1].scenario + 1,
					_commitment.id,
					_commitment.title,
					'defined',
					'x',
					'y'
				);

				await insertSimulation(
					_simulation[_simulation.length - 1].scenario + 1,
					_commitment.id,
					_commitment.title,
					'activated',
					'x',
					'y'
				);

				break;
			case 'committed':
				//delegate
				if (_simulation[_simulation.length - 1].debtor == 'x') {
					_newScenario = await copySimulationToNewScenario(
						_simulation[_simulation.length - 1].scenario
					);
					await insertSimulation(
						_newScenario,
						_commitment.id,
						_commitment.title,
						'canceled',
						'xz',
						_simulation[_simulation.length - 1].creditor
					);
					await insertSimulation(
						_newScenario,
						_commitment.id,
						_commitment.title,
						'committed',
						'xz',
						_simulation[_simulation.length - 1].creditor
					);
				}

				//assign
				if (_simulation[_simulation.length - 1].creditor == 'y') {
					_newScenario = await copySimulationToNewScenario(
						_simulation[_simulation.length - 1].scenario
					);

					await insertSimulation(
						_newScenario,
						_commitment.id,
						_commitment.title,
						'released',
						_simulation[_simulation.length - 1].debtor,
						'yz'
					);
					await insertSimulation(
						_newScenario,
						_commitment.id,
						_commitment.title,
						'committed',
						_simulation[_simulation.length - 1].debtor,
						'yz'
					);
				}

				//delegate
				if (_simulation[_simulation.length - 1].debtor == 'x') {
					_newScenario = await copySimulationToNewScenario(
						_simulation[_simulation.length - 1].scenario
					);
					await insertSimulation(
						_newScenario,
						_commitment.id,
						_commitment.title,
						'canceled',
						'xz',
						_simulation[_simulation.length - 1].creditor
					);
					await insertSimulation(
						_newScenario,
						_commitment.id,
						_commitment.title,
						'activated',
						'xz',
						_simulation[_simulation.length - 1].creditor
					);
				}

				//assign
				if (_simulation[_simulation.length - 1].creditor == 'y') {
					_newScenario = await copySimulationToNewScenario(
						_simulation[_simulation.length - 1].scenario
					);

					await insertSimulation(
						_newScenario,
						_commitment.id,
						_commitment.title,
						'released',
						_simulation[_simulation.length - 1].debtor,
						'yz'
					);
					await insertSimulation(
						_newScenario,
						_commitment.id,
						_commitment.title,
						'activated',
						_simulation[_simulation.length - 1].debtor,
						'yz'
					);
				}

				//activate
				await insertSimulation(
					_simulation[_simulation.length - 1].scenario,
					_commitment.id,
					_commitment.title,
					'activated',
					_simulation[_simulation.length - 1].debtor,
					_simulation[_simulation.length - 1].creditor
				);

				break;

			case 'activated':
				//partially satisfy
				if (_commitment.fluents[0].atomic === false) {
					let _counter = 1;
					while (_counter <= _commitment.fluents[0].max_terms - 1) {
						await insertSimulation(
							_simulation[_simulation.length - 1].scenario,
							_commitment.id,
							_commitment.title,
							'satisfied (p)',
							_simulation[_simulation.length - 1].debtor,
							_simulation[_simulation.length - 1].creditor
						);
						_counter++;
					}

					await insertSimulation(
						_simulation[_simulation.length - 1].scenario,
						_commitment.id,
						_commitment.title,
						'satisfied',
						_simulation[_simulation.length - 1].debtor,
						_simulation[_simulation.length - 1].creditor
					);
				}

				//full satisfy
				if (_commitment.fluents[0].atomic === true) {
					console.log('Test');
					await insertSimulation(
						_simulation[_simulation.length - 1].scenario,
						_commitment.id,
						_commitment.title,
						'satisfied',
						_simulation[_simulation.length - 1].debtor,
						_simulation[_simulation.length - 1].creditor
					);
				}
				_return = true;
				break;
			default:
		}
		return _return;
	}

	async function countScenarios() {
		calculating = true;
		try {
			await clearSimulations();
			let _scenarioCounter = 0;
			let _scenarios = 0;
			let _commitments = await getCommitments();
			for (let i = 0; i < 1; i++) {
				//for (let i = 0; i < _commitments.length; i++) {

				await insertSimulation(1, _commitments[i].id, _commitments[i].title, 'defined', 'x', 'y');
			}
			_scenarios = await countUniqueScenarios();
			for (let i = 0; i < _commitments.length; i++) {
				let _done = false;
				while (_scenarioCounter < _scenarios) {
					do {
						let _simulation = await getSimulation(_commitments[i].id, _scenarioCounter + 1);
						_scenarios = await countUniqueScenarios();
						_done = await simulationBuilder(_simulation, _commitments[i], _scenarioCounter + 1);
					} while (_done == false);
					_scenarioCounter++;
					_scenarios = await countUniqueScenarios();
				}
			}
			totalScenarios = Math.pow(_scenarios, _commitments.length);
			calculating = false;
		} catch (err) {
			console.log(err.message);
		}
	}
</script>

<div class="mt-20">
	<p class="text-white">
		{#if calculating != true}
			<button
				on:click|preventDefault={countScenarios}
				class="font-bold dark:text-white border-4 border-gray-700 py-2 px-2 rounded"
			>
				{#if totalScenarios != undefined}
					{totalScenarios} Unique Scenarios
				{/if}
				{#if totalScenarios == undefined}
					Count Unique Scenarios
				{/if}
			</button>
		{/if}

		{#if calculating == true}
			<Loader />
		{/if}
	</p>
</div>

{#if totalScenarios != undefined && calculating == false}
	{#await getSimulations() then simulations}
		{#each simulations as simulation, i}
			{#if i + 1 <= totalScenarios}
				{#await getSimulationsByScenario(i + 1) then simulationsByScenario}
					<div class="max-w-lg rounded w-11/12 mt-5 items-center bg-gray-700">
						<div class="px-1 py-1 -mt-1">
							{#each simulationsByScenario as simulationByScenario, i}
								<div
									class="flex flex-wrap text-sm bg-white p-3 mt-1 rounded dark:bg-black dark:text-white"
								>
									<div class="w-3/12 m-auto">
										<span
											><span class="font-bold pl-2">Action</span>
											<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1"
												>{simulationByScenario.scenario}.{i + 1}</span
											></span
										>
									</div>
									<div class="w-9/12 m-auto">
										<p class="pl-1">
											Commitment <span class="font-bold">{simulationByScenario.title}</span>
											<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1"
												>{simulationByScenario.state}</span
											>
											by
											<span class="font-bold">
												{#if simulationByScenario.state === 'defined' || simulationByScenario.state === 'committed' || simulationByScenario.state === 'activated' || simulationByScenario.state === 'satisfied' || simulationByScenario.state === 'satisfied (p)' || simulationByScenario.state === 'canceled'}
													{simulationByScenario.debtor}
												{/if}
												{#if simulationByScenario.state === 'released'}
													{simulationByScenario.creditor}
												{/if}
											</span>
										</p>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/await}
			{/if}
		{/each}
	{:catch error}
		<span class="text-sm">{error}</span>
	{/await}
{/if}
