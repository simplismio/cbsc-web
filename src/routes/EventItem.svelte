<script>
	import ActionList from './ActionList.svelte';
	import NewActionList from './NewActionList.svelte';
	import DeleteEventButton from './DeleteEventButton.svelte';

	export let eventData;
	export let eventI;
</script>

<div class="max-w-lg rounded w-11/12 mt-10 items-center bg-gray-700">
	<div class="px-1 py-1">
		<div class="flex flex-wrap text-sm bg-white p-3 rounded dark:bg-black dark:text-white">
			<div class="w-3/12 m-auto">
				<span
					><span class="font-bold">Event</span>
					<span class="font-bold dark:bg-gray-500 rounded pl-1 pr-1">{eventI + 1}</span></span
				>
			</div>
			<div class="w-8/12">
				<p class="font-bold">{eventData.title}</p>
				<p>{eventData.description}</p>
			</div>
			<div class="w-1/12 m-auto">
				<DeleteEventButton eventID={eventData.id} />
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
