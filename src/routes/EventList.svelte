<script>
	import supabase from '$lib/db.js';
	import { onMount } from 'svelte';
	import EventItem from './EventItem.svelte';
	import Loader from './Loader.svelte';

	let events = [];

	async function getProtocolRun() {
		let { data: events, error } = await supabase.from('events').select(`
				id,
				title,
				description,
				actions (id)
			`);
		return events;
	}

	onMount(async () => {
		events = await getProtocolRun();
		if (events != null) {
			return {
				headers: { Location: '/NewEventForm' },
				status: 302
			};
		}
	});
</script>

{#each events as event, i}
	<EventItem eventData={event} eventI={i} />
{:else}
	<Loader />
{/each}
