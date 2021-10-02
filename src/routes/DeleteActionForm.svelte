<script>
	import supabase from '$lib/db';
	import { dataHasChanged } from '$lib/store.js';
	import { tick } from 'svelte';
	import IoIosRemove from 'svelte-icons/io/IoIosRemove.svelte';

	export let actionID;

	async function deleteAction() {
		dataHasChanged.set(true);
		const { data, error } = await supabase.from('actions').delete().eq('id', actionID);
		await tick();
		dataHasChanged.set(false);
		return data;
	}
</script>

<span on:click|preventDefault={deleteAction}>
	<IoIosRemove />
</span>
