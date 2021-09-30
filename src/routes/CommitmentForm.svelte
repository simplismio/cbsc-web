<script>
	import supabase from '$lib/db';
	import { insertCommitmentSubmit } from '$lib/store.js';
	import { onMount } from 'svelte';

	let eventTitle;
	let commitmentTitle;

	let events = [];

	onMount(async () => {
		let { data, error } = await supabase.from('events').select();
		events = data;
	});

	async function insertCommitments() {
		const { data, error } = await supabase.from('events').insert([{ title: eventTitle }]);
		eventTitle = '';
		//insertCommitmentSubmit.set(false);

		if (error) throw new Error(error.message);
		return data;
	}
</script>

<!-- {#await getEvents() then eventData} -->
{#each events as event, i}
	<div class="max-w-lg rounded overflow-hidden shadow-lg bg-gray-50 w-11/12 mt-5">
		<div class="px-6 py-4">
			<span class="text-2xl">Event {i} : </span><span class="font-bold text-2xl">{event.title}</span
			>
			<form
				class="w-full max-w-lg mt-4"
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
{:else}
	<div class="flex items-center space-x-2 space-x-2 animate-pulse mt-10">
		<div class="w-6 h-6 bg-gray-200 rounded-full" />
		<div class="w-6 h-6 bg-gray-400 rounded-full" />
		<div class="w-6 h-6 bg-gray-600 rounded-full" />
	</div>
{/each}
<!-- {/await} -->
