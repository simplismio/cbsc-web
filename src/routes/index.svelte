<script>
	import EventList from './EventList.svelte';
	import { dataHasChanged } from '$lib/store.js';

	let dataHasChangedIndeed;

	dataHasChanged.subscribe((value) => {
		dataHasChangedIndeed = value;
	});
</script>

{#if !dataHasChangedIndeed}
	<EventList />
{/if}

{#if dataHasChangedIndeed}
	<EventList />
{/if}
