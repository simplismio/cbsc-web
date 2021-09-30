<script>
	import supabase from '$lib/db';
	import { insertCommitmentSubmit } from '$lib/store.js';

	let eventTitle;
	let commitmentTitle;

	async function getEvents() {
		let { data, error } = await supabase.from('events').select();
		if (error) throw new Error(error.message);
		return data;
	}

	async function insertCommitments() {
		const { data, error } = await supabase.from('events').insert([{ title: eventTitle }]);
		eventTitle = '';
		//insertCommitmentSubmit.set(false);

		if (error) throw new Error(error.message);
		return data;
	}
</script>

{#await getEvents() then eventData}
	{#each eventData as event, i}
		<div class="max-w-lg rounded overflow-hidden shadow-lg mt-5">
			<div class="px-6 py-4">
				<p>{event.title}</p>
				<p>{i}</p>

				<form
					class="w-full max-w-lg"
					on:submit|preventDefault={() => insertCommitmentSubmit.set(true)}
				>
					<div class="flex items-center">
						<input
							class="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
							type="text"
							bind:value={commitmentTitle}
							placeholder="Define a commitment in event {event.title}"
							aria-label="Event title"
						/>
						<input
							class="ml-3 bg-black hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white py-2 px-3 rounded"
							type="submit"
							value="+"
							on:click={insertCommitments}
						/>
					</div>
				</form>
			</div>
		</div>
	{/each}
{/await}
