<script>
	import supabase from '$lib/db.js';
	import { onMount } from 'svelte';
	import EventItem from './EventItem.svelte';
	import Scenarios from './Scenarios.svelte';
	import { newCommitment } from '$lib/store.js';
	let newCommitmentIndeed;

	newCommitment.subscribe((value) => {
		newCommitmentIndeed = value;
	});

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

{#if newCommitmentIndeed}
	<Scenarios />
{/if}
{#if !newCommitmentIndeed}
	<Scenarios />
{/if}

<!-- {#each events as event, i}
	<EventItem eventData={event} eventI={i} />
{:else}
	<span class="dark:text-white mt-20">No events found</span>
{/each} -->
