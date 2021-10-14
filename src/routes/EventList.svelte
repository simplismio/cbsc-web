<script>
	import supabase from '$lib/db.js';
	import { onMount } from 'svelte';
	import EventItem from './EventItem.svelte';
	import Scenarios from './Scenarios.svelte';
	import Loader from './Loader.svelte';

	let events = [];

	async function getEvents() {
		let { data: events, error } = await supabase.from('events').select(`
				id,
				title,
				description,
				actions (id, commitments(id, title, debtor_id, creditor_id))
			`);
		return events;
	}

	onMount(async () => {
		events = await getEvents();
		if (events != null) {
			return {
				headers: { Location: '/NewEventForm' },
				status: 302
			};
		}
	});
</script>

<Scenarios />

{#each events as event, i}
	<EventItem eventData={event} eventI={i} />
{:else}
	<Loader />
{/each}
