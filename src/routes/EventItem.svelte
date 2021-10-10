<script>
	import ActionList from './ActionList.svelte';
	import NewActionList from './NewActionList.svelte';
	import DeleteEventButton from './DeleteEventButton.svelte';

	export let eventData;
	export let eventI;
</script>

<div class="max-w-lg rounded overflow-hidden bg-gray-50 w-11/12 mt-10 items-center">
	<div class="px-3 py-3">
		<div class="flex flex-wrap text-sm bg-white p-5 rounded">
			<div class="w-3/12 m-auto">
				<span class="">Event <span class="font-bold">{eventI + 1}</span></span>
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
