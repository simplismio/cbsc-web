<script>
	import EventForm from './EventForm.svelte';
	import CommitmentForm from './CommitmentForm.svelte';

	import { insertEventSubmit } from '$lib/store.js';

	let eventFormIsSubmitted;

	insertEventSubmit.subscribe((value) => {
		eventFormIsSubmitted = value;
	});
</script>

<div
	class="h-screen flex flex-col 
items-center p-10"
>
	<div class="font-bold text-5xl mt-10 mb-10">Design a CBSC</div>

	{#if !eventFormIsSubmitted}
		<CommitmentForm />
	{/if}

	{#if eventFormIsSubmitted}
		<CommitmentForm />
	{/if}

	<EventForm />
</div>
