<script>
	import supabase from '$lib/db.js';
	import { cloneDeep } from 'lodash';

	let scenarios = [];

	async function getCommitments() {
		let { data: commitments, error } = await supabase
			.from('commitments')
			.select('id, title, state_id');

		//console.log(commitments);
		commitments != undefined ? countScenarios(commitments) : console.log('Fuck');
	}

	function countScenarios(_commitments) {
		let _tempCommitments = [];
		let _scenarios = true;
		let _continue = true;

		//console.log(_commitments);

		//while (_continue == true) {
		for (let i = 0; i < _commitments.length; i++) {
			if (_commitments[i].state_id < 4) {
				if (_commitments[i].simulation_state_id == undefined) {
					_commitments[i].simulation_state_id = 1;
				}

				//console.log(_commitments[i]);

				switch (_commitments[i].simulation_state_id) {
					case 1:
						var dataClone = cloneDeep(_commitments[i]);
						dataClone.simulation_state_id = 14;

						console.log(dataClone); //create deep clone

						scenarios.push(dataClone);

						console.log(scenarios);

						var dataClone2 = cloneDeep(_commitments[i]);
						dataClone2.simulation_state_id = 15;

						console.log(dataClone2); //create deep clone

						scenarios.push(dataClone2);

						console.log(scenarios);

						break;
					case 2:
						//activate
						//delegate
						//assign

						break;

					case 3:
						//satisfy
						//full
						//partial
						//delegate
						//assigm

						break;

					default:
				}
			} else {
				_commitments.forEach((item, index) => {
					if (item.simulation_state_id != 4) {
						_continue = true;
					}
				});
			}
		}
		return _scenarios;
	}
</script>

{#await getCommitments()}
	{#if scenarios != undefined}
		<div class="mt-10">
			<span class="dark:text-white"
				>There are <span class="font-bold">{scenarios.length}</span> scenarios for this contract</span
			>
		</div>
	{/if}
{/await}
