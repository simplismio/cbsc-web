<script>
	import ProtocolRun from './ProtocolRun.svelte';
	import { dataHasChanged } from '$lib/store.js';

	let dataHasChangedIndeed;

	dataHasChanged.subscribe((value) => {
		dataHasChangedIndeed = value;
	});
</script>

<div
	class="h-auto flex flex-col 
items-center"
>
	{#if !dataHasChangedIndeed}
		<ProtocolRun />
	{/if}

	{#if dataHasChangedIndeed}
		<ProtocolRun />
	{/if}
</div>
