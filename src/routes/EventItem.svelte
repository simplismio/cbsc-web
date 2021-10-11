<script>
	import supabase from '$lib/db.js';
	import ActionList from './ActionList.svelte';
	import NewActionList from './NewActionList.svelte';

	import { dataHasChanged } from '$lib/store.js';
	import { tick } from 'svelte';

	export let eventData;
	export let eventI;

	async function deleteEvent() {
		const { data, error } = await supabase.from('events').delete().eq('id', eventData.id);
	}

	async function deleteEventProcedure() {
		dataHasChanged.set(true);
		await deleteEvent();
		//await updateCommitmentState();
		await tick();
		dataHasChanged.set(false);
	}
</script>

<div class="max-w-lg rounded w-11/12 mt-10 items-center bg-gray-700">
	<div class="px-1 py-1">
		<div class="flex flex-wrap text-sm bg-white p-3 rounded dark:bg-black dark:text-white">
			<div class="w-3/12 m-auto">
				<span
					><span class="font-bold pl-2">Event</span>
					<span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">{eventI + 1}</span></span
				>
			</div>
			<div class="w-8/12">
				<p class="font-bold pl-1">{eventData.title}</p>
				<p class="pl-1">{eventData.description}</p>
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
			<ActionList eventID={eventData.id} {eventI} />
		</div>
		<div class="mt-1">
			<NewActionList {eventData} {eventI} />
		</div>
	</div>
</div>
