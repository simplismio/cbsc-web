<script>
	import Event from './Event.svelte';
	import { dataHasChanged } from '$lib/store.js';
	let dataHasChangedIndeed;

	dataHasChanged.subscribe((value) => {
		dataHasChangedIndeed = value;
	});
</script>

{#if !dataHasChangedIndeed}
	<Event />
{/if}
