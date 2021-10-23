<script>
	import supabase from '$lib/db.js';

	let simulation = [];

	async function getCommitments() {
		let { data: commitments, error } = await supabase
			.from('commitments')
			.select('id, title, state_id');

		commitments != undefined ? countScenarios(commitments) : console.log('No commitments');
	}

	async function clearSimulations() {
		var start;
		var counter;

		let {
			data: simulations,
			error,
			count
		} = await supabase.from('simulations').select('id', { count: 'exact' });
		if (
			// @ts-ignore
			simulations == ''
		) {
			start = 0;
			counter = 0;
		} else {
			start = simulations[0].id;
			counter = simulations[0].id + simulations.length;
		}

		for (var i = start ?? 0; i < counter; i++) {
			await supabase.from('simulations').delete().match({
				id: i
			});
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

	async function getSimulations() {
		let { data: simulations, error } = await supabase.from('simulations').select();
		return simulations;
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

	async function copySimulationToNewScenario(_scenario, _scenarios) {
		//console.log(_scenario);
		let { data: simulations, error } = await supabase
			.from('simulations')
			.select('id, title, commitment_id, state, scenario')
			.eq('scenario', _scenario);

		let _newScenario = _scenarios + 1;

		for (let i = 0; i < simulations.length; i++) {
			await insertSimulation(
				_newScenario,
				simulations[i].commitment_id,
				simulations[i].title,
				simulations[i].state,
				simulations[i].debtor,
				simulations[i].creditor
			);
		}
		return _newScenario;
	}

	async function countScenarios(_commitments) {
		let _continue = true;
		let _counter = 0;

		await clearSimulations();

		let _simulation;
		let _newScenario;

		for (let i = 0; i < _commitments.length; i++) {
			await insertSimulation(1, _commitments[i].id, _commitments[i].title, 'defined', 'x', 'y');
		}

		while (_continue == true) {
			let _scenarios = await countUniqueScenarios();
			console.log(_scenarios);

			for (let a = 0; a < _scenarios; a++) {
				for (let b = 0; b < _commitments.length; b++) {
					_simulation = await getSimulation(_commitments[b].id, a + 1);

					//console.log(_simulation);
					if (_simulation != undefined) {
						switch (_simulation[_simulation.length - 1].state) {
							case 'defined':
								await insertSimulation(
									a + 1,
									_commitments[b].id,
									_commitments[b].title,
									'committed',
									'x',
									'y'
								);

								_newScenario = await copySimulationToNewScenario(
									_simulation[_simulation.length - 1].scenario,
									_scenarios
								);

								await insertSimulation(
									a + 2,
									_commitments[b].id,
									_commitments[b].title,
									'activated',
									'x',
									'y'
								);

								break;
							case 'committed':
								// _newScenario = await copySimulationToNewScenario(
								// 	_simulation[_simulation.length - 1].scenario,
								// 	_scenarios
								// );

								// //delegate
								// await insertSimulation(
								// 	_newScenario,
								// 	_commitments[b].id,
								// 	_commitments[b].title,
								// 	'canceled'
								// );

								// await insertSimulation(
								// 	_newScenario,
								// 	_commitments[b].id,
								// 	_commitments[b].title,
								// 	'committed'
								// );

								// _newScenario = await copySimulationToNewScenario(
								// 	_simulation[_simulation.length - 1].scenario,
								// 	_scenarios
								// );
								// //assign
								// await insertSimulation(
								// 	_newScenario,
								// 	_commitments[b].id,
								// 	_commitments[b].title,
								// 	'released'
								// );
								// await insertSimulation(
								// 	_newScenario,
								// 	_commitments[b].id,
								// 	_commitments[b].title,
								// 	'committed'
								// );

								// _newScenario = await copySimulationToNewScenario(
								// 	_simulation[_simulation.length - 1].scenario,
								// 	_scenarios
								// );
								// //delegate
								// await insertSimulation(
								// 	_newScenario,
								// 	_commitments[b].id,
								// 	_commitments[b].title,
								// 	'canceled'
								// );
								// await insertSimulation(
								// 	_newScenario,
								// 	_commitments[b].id,
								// 	_commitments[b].title,
								// 	'committed'
								// );
								// //assign
								// await insertSimulation(
								// 	_newScenario,
								// 	_commitments[b].id,
								// 	_commitments[b].title,
								// 	'released'
								// );
								// await insertSimulation(
								// 	_newScenario,
								// 	_commitments[b].id,
								// 	_commitments[b].title,
								// 	'committed'
								// );

								//activate
								await insertSimulation(
									_simulation[_simulation.length - 1].scenario,
									_commitments[b].id,
									_commitments[b].title,
									'activated'
								);

								break;

							case 'activated':
								// _newScenario = await copySimulationToNewScenario(
								// 	_simulation[_simulation.length - 1].scenario,
								// 	_scenarios
								// );

								// //delegate
								// await insertSimulation(
								// 	_newScenario,
								// 	_commitments[b].id,
								// 	_commitments[b].title,
								// 	'canceled'
								// );
								// await insertSimulation(
								// 	_newScenario,
								// 	_commitments[b].id,
								// 	_commitments[b].title,
								// 	_simulation[_simulation.length - 1].state
								// );

								// //assign
								// await insertSimulation(
								// 	_newScenario,
								// 	_commitments[b].id,
								// 	_commitments[b].title,
								// 	'released'
								// );

								// await insertSimulation(
								// 	_newScenario,
								// 	_commitments[b].id,
								// 	_commitments[b].title,
								// 	_simulation[_simulation.length - 1].state
								// );

								// //full satisfy
								// await insertSimulation(
								// 	_simulation[_simulation.length - 1].scenario,
								// 	_commitments[b].id,
								// 	_commitments[b].title,
								// 	'satisfied'
								// );

								//partial

								break;

							default:
						}
					}
				}
			}
			_counter++;

			if (_counter == 3) {
				console.log('Enough');
				_continue = false;
			}
			//console.log('another round');
		}
	}
</script>

{#await getCommitments()}
	{#if simulation != undefined}
		<div class="mt-10">
			<span class="dark:text-white"
				>There are <span class="font-bold">{simulation.length}</span> scenarios for this contract</span
			>
		</div>
	{/if}
{/await}
