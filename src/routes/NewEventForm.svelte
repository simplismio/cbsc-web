<script>
	import supabase from '$lib/db';
	import { dataHasChanged } from '$lib/store.js';
	import { tick } from 'svelte';

	let eventTitle;

	async function insertEvent() {
		dataHasChanged.set(true);

		const { data, error } = await supabase.from('events').insert([{ title: eventTitle }]);
		eventTitle = '';
		await tick();
		dataHasChanged.set(false);
		return data;
	}
</script>

<form class="w-full max-w-lg mt-10">
	<div class="flex items-center">
		<input
			class="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
			type="text"
			bind:value={eventTitle}
			placeholder="Define a new event"
			aria-label="Event title"
		/>
		<input
			class="ml-3 bg-black hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white py-2 px-3 rounded"
			type="submit"
			value="+"
			on:click|preventDefault={insertEvent}
		/>
	</div>
</form>
