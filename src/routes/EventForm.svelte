<script>
	import supabase from '$lib/db';
	import { insertEventSubmit } from '$lib/store.js';
	import { tick } from 'svelte';

	let eventTitle;

	async function insertEvent() {
		const { data, error } = await supabase.from('events').insert([{ title: eventTitle }]);
		eventTitle = '';

		insertEventSubmit.set(true);
		await tick();
		insertEventSubmit.set(false);

		return data;
	}
</script>

<div class="max-w-lg rounded overflow-hidden shadow-lg mt-5">
	<div class="px-6 py-4">
		<form class="w-full max-w-lg">
			<div class="flex items-center">
				<input
					class="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
					type="text"
					bind:value={eventTitle}
					placeholder="Define an event"
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
	</div>
</div>
