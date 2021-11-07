<script>
	import Event from './Event.svelte';
	import { dataHasChanged } from '$lib/store.js';
	import Loader from './utilities/Loader.svelte';

	let dataHasChangedIndeed;

	dataHasChanged.subscribe((value) => {
		dataHasChangedIndeed = value;
	});
</script>

{#if !dataHasChangedIndeed}
	<Event />
{/if}

{#if dataHasChangedIndeed}
	<Loader />
{/if}
