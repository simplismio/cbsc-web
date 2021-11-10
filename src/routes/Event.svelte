<script>
	import supabase from '$lib/db.js';
	import { onMount } from 'svelte';
	import { dataHasChanged } from '$lib/store.js';
	import Action from './Action.svelte';
	import NewAction from './NewAction.svelte';
	import Loader from './utilities/Loader.svelte';
	import { goto } from '$app/navigation';

	let events = [];

	async function getEvents() {
		try {
			let { data: events, error } = await supabase.from('events').select(`
				id,
				title,
				description,
				actions (id, commitments(id, title, debtor, creditor))
			`);
			return events;
		} catch (err) {
			console.log(err.message);
		}
	}

	async function clearActions() {
		let _start;
		let _counter;

		try {
			let {
				data: actions,
				error,
				count
			} = await supabase.from('actions').select('id', { count: 'exact' });
			if (
				// @ts-ignore
				actions == ''
			) {
				_start = 0;
				_counter = 0;
			} else {
				_start = actions[0].id;
				_counter = actions[0].id + actions.length;
			}

			for (var i = _start ?? 0; i < _counter; i++) {
				await supabase.from('actions').delete().match({
					id: i
				});
			}
		} catch (err) {
			console.log(err.message);
		}
	}

	async function deleteEvent(_event) {
		try {
			const { data, error } = await supabase.from('events').delete().eq('id', _event.id);
		} catch (err) {
			console.log(err.message);
		}
	}

	async function deleteEventProcedure(_event) {
		dataHasChanged.set(true);
		try {
			await clearActions();
			await deleteEvent(_event);
		} catch (err) {
			console.log(err.message);
		}
		dataHasChanged.set(false);
	}

	onMount(async () => {
		events = await getEvents();
		if (events.length === 0) {
			goto('/NewEvent');
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
						on:click|preventDefault={() => deleteEventProcedure(event)}
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
