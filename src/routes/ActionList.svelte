<script>
	import supabase from '$lib/db.js';
	import ActionItem from './ActionItem.svelte';

	export let eventI;
	export let eventID;

	async function getActions(_eventID) {
		let { data: actions, error } = await supabase
			.from('actions')
			.select('id, state_id, commitments (id, title)))')
			.eq('event_id', _eventID);
		if (error) throw new Error(error.message);
		return actions;
	}
</script>

{#await getActions(eventID) then actions}
	{#each actions as action, i}
		<ActionItem actionData={action} {eventID} {eventI} actionI={i} />
	{:else}
		<span class="">No actions yet</span>
	{/each}
{:catch error}
	<span class="text-sm">{error}</span>
{/await}
