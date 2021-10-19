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

	async function insertSimulation(_scenario, _commitment_id, _title, _state_id) {
		const { data, error } = await supabase.from('simulations').insert([
			{
				scenario: _scenario,
				title: _title,
				commitment_id: _commitment_id,
				state_id: _state_id
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
			.select('id, title, commitment_id, state_id, scenario')
			.eq('commitment_id', _commitment_id)
			.eq('scenario', _scenario);

		return simulation;
	}

	async function countUniqueScenarios() {
		let { data: simulation, error } = await supabase.from('simulations').select('scenario');
		console.log(simulation);
		return simulation;
	}

	async function countScenarios(_commitments) {
		let _continue = true;
		let _counter = 0;

		await clearSimulations();

		let _simulation;

		for (let i = 0; i < _commitments.length; i++) {
			await insertSimulation(1, _commitments[i].id, _commitments[i].title, 1);
		}

		while (_continue == true) {
			let _uniqueScenarios = [];
			let test = await countUniqueScenarios();
			for (var i = 0; i < test.length; i++) {
				_uniqueScenarios.push(test[i].scenario);
			}
			let _scenarios = Math.max.apply(null, _uniqueScenarios);
			for (let a = 0; a < _scenarios; a++) {
				for (let b = 0; b < _commitments.length; b++) {
					console.log(a + 1);

					_simulation = await getSimulation(_commitments[b].id, a + 1);

					console.log(_simulation);
					if (_simulation != undefined) {
						switch (_simulation[_simulation.length - 1].state_id) {
							case 1:
								await insertSimulation(
									a + 1,
									_commitments[b].id,
									_commitments[b].title,
									_commitments[b].state_id + 1
								);

								await insertSimulation(
									a + 2,
									_commitments[b].id,
									_commitments[b].title,
									_commitments[b].state_id
								);

								await insertSimulation(
									a + 2,
									_commitments[b].id,
									_commitments[b].title,
									_commitments[b].state_id + 2
								);

								break;
							case 2:
								console.log('I can activate');

								//activate
								//delegate
								//assign

								break;

							case 3:
								console.log('I can satisfy');
								//satisfy
								//full
								//partial
								//delegate
								//assigm

								break;

							default:
						}
					}
				}
			}
			_counter++;

			if (_counter == 3) {
				console.log('Enough2');
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
