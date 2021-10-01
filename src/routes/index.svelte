<script>
	import NewEventForm from './NewEventForm.svelte';
	import ProtocolRun from './ProtocolRun.svelte';
	import NewCommitmentForm from './NewCommitmentForm.svelte';

	import { dataHasChanged } from '$lib/store.js';

	let dataHasChangedIndeed;

	dataHasChanged.subscribe((value) => {
		dataHasChangedIndeed = value;
	});
</script>

<div
	class="h-screen flex flex-col 
items-center"
>
	<div class="font-bold text-5xl mt-10 mb-10">Design a CBSC</div>

	{#if !dataHasChangedIndeed}
		<ProtocolRun />
	{/if}

	{#if dataHasChangedIndeed}
		<ProtocolRun />
	{/if}
	<NewEventForm />
	<NewCommitmentForm />
</div>
