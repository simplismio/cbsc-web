<script>
	import supabase from '$lib/db';
	import { dataHasChanged } from '$lib/store.js';
	import { tick } from 'svelte';
	import IoIosAdd from 'svelte-icons/io/IoIosAdd.svelte';

	let eventTitle;

	async function insertEvent() {
		dataHasChanged.set(true);
		const { data, error } = await supabase.from('events').insert([{ title: eventTitle }]);
		eventTitle = '';
		await tick();
		dataHasChanged.set(false);
		history.back();
	}
</script>

<div class="max-w-lg rounded overflow-hidden shadow-xl w-11/12 mt-5">
	<div class="px-6 py-4">
		<form class="w-full max-w-lg mt-10">
			<h2 class="font-bold text-2xl">Create a new event</h2>
			<p class="mt-2">
				A <span class="font-bold">event</span> represents promises between debtors and creditors. A
				<span class="font-bold">fluent</span> is the variable that fulfills a commitment. For example,
				a commitment to buy a property, is satisfied through a payment from the debtor.
			</p>
			<p>An event is a</p>
			<div class="flex items-center mt-3">
				<input
					class="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
					type="text"
					bind:value={eventTitle}
					placeholder="Define a new event"
					aria-label="Event title"
				/>
				<span on:click|preventDefault={insertEvent} class="w-20 h-20 mt-2">
					<IoIosAdd />
				</span>
			</div>
		</form>
	</div>
</div>
