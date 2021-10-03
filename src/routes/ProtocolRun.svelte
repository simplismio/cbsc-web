<script>
	import supabase from '$lib/db';
	import { onMount, tick } from 'svelte';
	import EventCard from './EventCard.svelte';

	let events = [];

	async function getEvents() {
		let { data: events, error } = await supabase.from('events').select(`
				id,
				title,
				actions (
				id
				)
			`);

		return events;
	}

	onMount(async () => {
		events = await getEvents();
	});
</script>

{#each events as event, i}
	<EventCard eventData={event} />
{:else}
	<div class="flex items-center space-x-2 space-x-2 animate-pulse mt-10">
		<div class="w-6 h-6 bg-gray-200 rounded-full" />
		<div class="w-6 h-6 bg-gray-400 rounded-full" />
		<div class="w-6 h-6 bg-gray-600 rounded-full" />
	</div>
{/each}
