<script>
	import supabase from '$lib/db';
	import { onMount, tick } from 'svelte';
	import NewActionForm from './NewActionForm.svelte';

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

	async function getActions(i) {
		let { data: events, error } = await supabase
			.from('actions')
			.select('id, commitments (id, title)')
			.eq('event_id', i);

		return events;
	}

	onMount(async () => {
		events = await getEvents();
	});
</script>

{#each events as event, i}
	<div class="max-w-lg rounded overflow-hidden shadow-lg bg-gray-50 w-11/12 mt-5">
		<div class="px-6 py-4">
			<span class="text-2xl">Event {i + 1} : </span><span class="font-bold text-2xl"
				>{event.title}</span
			>
			{#await getActions(event.id) then actions}
				{#each actions as action, i}
					<div class="mt-3">
						<span class="">Action <span class="font-bold">{action.id}</span></span>
						<span> - </span>
						<span class="">
							commitment <span class="font-bold">{action.commitments.title}</span></span
						>
					</div>
					<hr class="mt-2" />
				{/each}
				<NewActionForm eventID={event.id} />
			{/await}
		</div>
	</div>
{:else}
	<div class="flex items-center space-x-2 space-x-2 animate-pulse mt-10">
		<div class="w-6 h-6 bg-gray-200 rounded-full" />
		<div class="w-6 h-6 bg-gray-400 rounded-full" />
		<div class="w-6 h-6 bg-gray-600 rounded-full" />
	</div>
{/each}
