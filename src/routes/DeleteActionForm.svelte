<script>
	import supabase from '$lib/db';
	import { dataHasChanged } from '$lib/store.js';
	import { tick } from 'svelte';

	export let actionID;

	async function deleteAction() {
		dataHasChanged.set(true);
		const { data, error } = await supabase.from('actions').delete().eq('id', actionID);
		await tick();
		dataHasChanged.set(false);
		return data;
	}
</script>

<span>
	<input
		class="ml-3 bg-red-500 hover:bg-gray-400 focus:shadow-outline focus:outline-none text-white py-0 px-2 rounded"
		type="submit"
		value="-"
		on:click|preventDefault={deleteAction}
	/>
</span>
