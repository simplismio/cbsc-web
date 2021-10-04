<script>
	import supabase from '$lib/db';
	import { onMount } from 'svelte';
	import EventCard from './EventCard.svelte';
	import Loader from './Loader.svelte';

	let events = [];

	async function getProtocolRun() {
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
		events = await getProtocolRun();
	});
</script>

{#each events as event, i}
	<EventCard eventData={event} eventI={i} />
{:else}
	<Loader />
{/each}
