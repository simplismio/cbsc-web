<script>
	import Event from './Event.svelte';
	import { dataHasChanged } from '$lib/store.js';
	import Loader from './utilities/Loader.svelte';
	import supabase from '$lib/db.js';
	import { onMount } from 'svelte';

	let dataHasChangedIndeed;

	dataHasChanged.subscribe((value) => {
		dataHasChangedIndeed = value;
	});

	let commitmentCount;
	let actionCount;

	onMount(async () => {
		commitmentCount = await getCommitments();
	});

	async function getCommitments() {
		let { data: commitments, error } = await supabase
			.from('commitments')
			.select('id, title, state, fluents(title, atomic,  balance, max_terms)');
		actionCount = Math.pow(8, commitments.length) * 36;
		return Math.pow(8, commitments.length);
	}
</script>

{#if !dataHasChangedIndeed}
	<Event />
{/if}

{#if dataHasChangedIndeed}
	<Loader />
{/if}
{#if commitmentCount !== undefined}
	<div class="dark:text-white mt-5">
		<span class="font-bold">Entropy</span>
		<span class="ml-5"
			><span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">{commitmentCount}</span> safe paths</span
		>
		<span class="ml-5"
			><span class="font-bold dark:bg-gray-700 rounded pl-1 pr-1">{actionCount}</span> actions
		</span>
	</div>
{/if}
