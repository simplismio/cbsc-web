<script>
	import supabase from '$lib/db.js';

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
				if (_commitments[i].new_state_id == undefined) {
					_commitments[i].new_state_id = 1;
				}

				console.log(_commitments[i]);

				switch (_commitments[i]) {
					case 1:
						// //commit
						// _tempCommitments[_commitments[i].id].state_id = 2;

						// console.log(scenarios.length);

						// //let _commitCopy = [].concat(_tempCommitments[_commitments[i].id]);

						// //console.log(_tempCommitments);
						// scenarios[scenarios.length] = _tempCommitments[_commitments[i].id];

						// //commit + activate
						// _tempCommitments[_commitments[i].id].state_id = 3;

						// //let _commitAndActivateCopy = [].concat(_tempCommitments[_commitments[i].id]);

						// //console.log(_tempCommitments);

						// scenarios[scenarios.length] = _tempCommitments[_commitments[i].id];

						// console.log(scenarios);

						break;
					case 2:
						//activate
						//delegate
						//assign

						console.log(_tempCommitments);
						console.log(scenarios);

						break;

					case 3:
						//satisfy
						//full
						//partial
						//delegate
						//assigm

						console.log(_tempCommitments);
						console.log(scenarios);

						break;

					default:
				}
			} else {
				_tempCommitments.forEach((item, index) => {
					if (item != 4) {
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
