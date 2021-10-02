<script>
	import supabase from '$lib/db';
	import { dataHasChanged } from '$lib/store.js';
	import { tick } from 'svelte';
	import IoIosAdd from 'svelte-icons/io/IoIosAdd.svelte';

	let commitmentTitle;

	async function insertCommitment() {
		dataHasChanged.set(true);
		const { data, error } = await supabase.from('commitments').insert([{ title: commitmentTitle }]);
		commitmentTitle = '';
		await tick();
		dataHasChanged.set(false);
		history.back();
	}
</script>

<div class="h-auto flex flex-col items-center">
	<div class="max-w-lg rounded overflow-hidden shadow-xl w-11/12 mt-5">
		<div class="px-6 py-4">
			<form class="w-full max-w-lg mt-10">
				<p>An commitment is a</p>
				<div class="flex items-center mt-3">
					<input
						class="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
						type="text"
						bind:value={commitmentTitle}
						placeholder="Define a commitment"
						aria-label="Event title"
					/>
					<span on:click|preventDefault={insertCommitment} class="w-20 h-20 mt-2">
						<IoIosAdd />
					</span>
				</div>
			</form>
		</div>
	</div>
</div>
