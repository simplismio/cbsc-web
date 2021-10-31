<script>
	import supabase from '$lib/db.js';
	import { onMount } from 'svelte';
	import { dataHasChanged } from '$lib/store.js';
	import Action from './Action.svelte';
	import NewAction from './NewAction.svelte';
	import Loader from './Loader.svelte';

	let events = [];

	async function getEvents() {
		let { data: events, error } = await supabase.from('events').select(`
				id,
				title,
				description,
				actions (id, commitments(id, title, debtor, creditor))
			`);
		return events;
	}

	async function deleteEvent(_event) {
		const { data, error } = await supabase.from('events').delete().eq('id', _event.id);
	}

	async function deleteEventProcedure() {
		dataHasChanged.set(true);
		await deleteEvent();
		//await tick();
		dataHasChanged.set(false);
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

{#each events as event, i}
	<div class="max-w-lg rounded w-11/12 mt-10 items-center bg-gray-700">
		<div class="px-1 py-1">
			<div class="flex flex-wrap text-sm bg-white p-3 rounded dark:bg-black dark:text-white">
				<div class="w-3/12 m-auto">
					<span
						><span class="font-bold pl-2">Event</span>
						<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">{i + 1}</span></span
					>
				</div>
				<div class="w-8/12">
					<p class="font-bold pl-1">{event.title}</p>
					<p class="pl-1">
						{event.description}
						<span class="font-bold font-bold dark:bg-blue-800 rounded pl-1 pr-1">Fact</span>
					</p>
				</div>
				<div class="w-1/12 m-auto">
					<button
						on:click|preventDefault={deleteEventProcedure}
						class="text-red-600 text-2xl font-bold rounded pr-2 float-right"
					>
						-
					</button>
				</div>
			</div>
			<div class="mt-1">
				<Action eventID={event.id} eventI={i} />
			</div>
			<div>
				<NewAction eventData={event} eventI={i} />
			</div>
		</div>
	</div>
{:else}
	<Loader />
{/each}
