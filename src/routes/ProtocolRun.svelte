<script>
	import supabase from '$lib/db';
	import { onMount, tick } from 'svelte';
	import NewActionForm from './NewActionForm.svelte';
	import DeleteActionForm from './DeleteActionForm.svelte';

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
	<div class="h-auto max-w-lg rounded overflow-hidden shadow-xl w-11/12 mt-5">
		<div class="px-6 py-4">
			<div class="flex">
				<div class="flex-none w-30 h-15">
					<span class="bg-blue-50 p-2 rounded">Event <span class="font-bold">{event.id}</span></span
					>
				</div>
				<div class="flex-grow h-15">
					<span class="font-bold ml-2">{event.title}</span>
				</div>
			</div>
			<hr class="mt-4 bg-gray-50" />
			<div class="mt-5">
				{#await getActions(event.id) then actions}
					{#each actions as action, i}
						<div class="flex mt-2">
							<div class="flex-none w-30 h-8">
								<span class="bg-green-50 p-2 rounded"
									>Action <span class="font-bold">{action.id}</span></span
								>
							</div>
							<div class="flex-none w-30 h-8">
								<span class="ml-2 mr-2">commitment</span>
							</div>
							<div class="flex-grow h-8">
								<span class="font-bold">{action.commitments.title}</span>
							</div>
							<div class="flex-none w-10 h-8">
								<DeleteActionForm actionID={action.id} />
							</div>
						</div>
					{:else}
						<p>No actions yet</p>
					{/each}

					<hr class="mt-3 bg-gray-50" />

					<div class="mt-5">
						<NewActionForm eventID={event.id} />
					</div>
				{/await}
			</div>
		</div>
	</div>
{:else}
	<div class="flex items-center space-x-2 space-x-2 animate-pulse mt-10">
		<div class="w-6 h-6 bg-gray-200 rounded-full" />
		<div class="w-6 h-6 bg-gray-400 rounded-full" />
		<div class="w-6 h-6 bg-gray-600 rounded-full" />
	</div>
{/each}
