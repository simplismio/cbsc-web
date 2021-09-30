<script>
	import EventForm from './EventForm.svelte';
	import CommitmentForm from './CommitmentForm.svelte';

	import { insertEventSubmit } from '$lib/store.js';

	let eventFormIsSubmitted;

	insertEventSubmit.subscribe((value) => {
		eventFormIsSubmitted = value;
	});

	$: console.log(eventFormIsSubmitted);
</script>

<div class="container max-w-screen-lg mx-auto p-10">
	<div class="font-bold text-2xl mt-10">Design a CBSC</div>

	{#if !eventFormIsSubmitted}
		<CommitmentForm />
	{/if}

	{#if eventFormIsSubmitted}
		<CommitmentForm />
	{/if}

	<EventForm />
</div>
