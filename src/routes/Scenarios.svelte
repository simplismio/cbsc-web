<script>
	import supabase from '$lib/db.js';

	async function getCommitments() {
		let { data: commitments, error } = await supabase
			.from('commitments')
			.select('id, title, state_id, fluents(title, atomic,  balance, max_terms)');
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

				// if (_commitment.fluents[0].atomic == false) {
				// 	for (let i = 0; i < _commitment.fluents[0].max_terms; i++) {
				// 		if (i < _commitment.fluents[0].max_terms - 1) {
				// 			await insertSimulation(
				// 				_simulation[_simulation.length - 1].scenario,
				// 				_commitment.id,
				// 				_commitment.title,
				// 				'partially satisfied',
				// 				_simulation[_simulation.length - 1].debtor,
				// 				_simulation[_simulation.length - 1].creditor
				// 			);
				// 		}
				// 		if (i == _commitment.fluents[0].max_terms - 1) {
				// 			await insertSimulation(
				// 				_simulation[_simulation.length - 1].scenario,
				// 				_commitment.id,
				// 				_commitment.title,
				// 				'satisfied',
				// 				_simulation[_simulation.length - 1].debtor,
				// 				_simulation[_simulation.length - 1].creditor
				// 			);
				// 		}
				// 	}
				// }

				//full satisfy
				if (_commitment.fluents[0].atomic == true) {
					await insertSimulation(
						_simulation[_simulation.length - 1].scenario,
						_commitment.id,
						_commitment.title,
						'satisfied',
						_simulation[_simulation.length - 1].debtor,
						_simulation[_simulation.length - 1].creditor
					);
				}

				await insertSimulation(
					_simulation[_simulation.length - 1].scenario,
					_commitment.id,
					_commitment.title,
					'satisfied',
					_simulation[_simulation.length - 1].debtor,
					_simulation[_simulation.length - 1].creditor
				);

				_return = true;
				break;
			default:
		}
		return _return;
	}

	async function countScenarios() {
		try {
			await clearSimulations();
			let _scenarioCounter = 0;
			let _scenarios = 0;

			let _commitments = await getCommitments();

			for (let i = 0; i < _commitments.length; i++) {
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
			return _scenarios;
		} catch (err) {
			console.log(err.message);
		}
	}
</script>

{#await countScenarios() then scenarioTotal}
	<div class="mt-10">
		<span class="dark:text-white"
			>There are <span class="font-bold">{scenarioTotal}</span> possible scenarios for this contract</span
		>
	</div>
	{#await getSimulations() then simulations}
		{#each simulations as simulation, i}
			{#if i + 1 < scenarioTotal}
				{#await getSimulationsByScenario(i + 1) then simulationsByScenario}
					{#each simulationsByScenario as simulationByScenario, i}
						<div
							class="flex flex-wrap text-sm bg-white p-2 mt-1 rounded dark:bg-black dark:text-white"
						>
							<div class="w-3/12 m-auto">
								{simulationByScenario.scenario}
							</div>
							<div class="w-3/12 m-auto">
								{simulationByScenario.title}
							</div>
							<div class="w-3/12 m-auto">
								{simulationByScenario.state}
							</div>
						</div>
					{/each}
				{/await}
			{/if}
		{/each}
	{/await}
{:catch error}
	<span class="text-sm">{error}</span>
{/await}
