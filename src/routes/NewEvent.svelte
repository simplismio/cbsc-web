<script>
	import supabase from '$lib/db.js';
	import { dataHasChanged } from '$lib/store.js';

	let eventTitle;
	let eventDescription;

	async function insertEvent() {
		try {
			dataHasChanged.set(true);
			const { data, error } = await supabase
				.from('events')
				.insert([{ title: eventTitle, description: eventDescription }]);
			eventTitle = '';
			dataHasChanged.set(false);
			history.back();
		} catch (err) {
			console.log(err.message);
		}
	}
</script>

<div class="max-w-lg rounded w-11/12 mt-10 border-4 border-gray-700">
	<div class="px-6 py-4">
		<form class="w-full max-w-lg mt-5">
			<h2 class="font-bold text-2xl dark:text-white">Create a new event</h2>
			<p class="mt-2 dark:text-white">
				A <span class="font-bold">event</span> represents the fact that is created and added to the knowledge
				base.
			</p>

			<div class="grid grid-cols-6 gap-6">
				<div class="col-span-6 sm:col-span-6 mt-10">
					<label class="block text-sm font-bold dark:text-white"
						>Event title
						<input
							class="appearance-none border rounded w-full py-2 px-2 border border-gray-300 bg-gray-800 text-white leading-tight focus:outline-none focus:shadow-outline mt-1"
							type="text"
							bind:value={eventTitle}
							placeholder="e.g. Sell the house"
							aria-label="Event title"
						/>
					</label>
				</div>

				<div class="col-span-6 sm:col-span-6">
					<label class="block text-sm font-bold dark:text-white"
						>Event description
						<textarea
							class="appearance-none border rounded w-full py-2 px-2 border border-gray-300 bg-gray-800 text-white leading-tight focus:outline-none focus:shadow-outline mt-1"
							type="text"
							bind:value={eventDescription}
							placeholder="Describe the exact fact that is created by the actions in this event, example: Mary sells her house in 2021"
							aria-label="Commitment title"
						/>
					</label>
				</div>
			</div>
			<div class="flex justify-center items-center mb-5 mt-5">
				<button
					on:click|preventDefault={insertEvent}
					class="bg-gray-700 font-bold py-2 px-4 rounded dark:text-white"
				>
					Save
				</button>
			</div>
		</form>
	</div>
</div>
