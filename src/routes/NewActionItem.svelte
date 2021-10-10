<script>
	import InsertActionButton from './InsertActionButton.svelte';
	import { futureActionCounter } from '$lib/store.js';
	import { onMount } from 'svelte';

	export let eventData;
	export let eventI;
	export let commitmentData;
	export let fluentData;
	export let delegate;
	export let assign;
	export let numericalBalance;
	export let nonNumericalBalance;

	onMount(async () => {
		futureActionCounter.update((n) => n + 1);
		if (delegate == '1' && assign == '1') {
			futureActionCounter.update((n) => n + 1);
		}
	});
</script>

{#if delegate == '0' && assign == '0'}
	<div class="flex flex-wrap text-sm bg-white p-5 mt-3 rounded">
		<div class="w-3/12 m-auto">
			<span class=""
				>Action <span class="font-bold">{eventI + 1}.{eventData.actions.length + 1}</span></span
			>
		</div>
		<div class="w-8/12">
			<span class="">Commitment</span>
			<span class="font-bold">{commitmentData.title}</span>
			<span class="">set to</span>
		</div>
		<div class="w-1/12 m-auto">
			<InsertActionButton />
		</div>
	</div>
{/if}

{#if delegate == '1'}
	<div class="flex flex-wrap text-sm bg-white p-5 mt-3 rounded">
		<div class="w-3/12 m-auto">
			<span class=""
				>Action <span class="font-bold">{eventI + 1}.{eventData.actions.length + 1}</span></span
			>
		</div>
		<div class="w-8/12">
			<span class="">Commitment</span>
			<span class="font-bold">{commitmentData.title}</span>
			<span class="">Delegate</span>
		</div>
		<div class="w-1/12 m-auto">
			<InsertActionButton />
		</div>
	</div>
{/if}

{#if assign == '1'}
	<div class="flex flex-wrap text-sm bg-white p-5 mt-3 rounded">
		<div class="w-3/12 m-auto">
			<span class=""
				>Action <span class="font-bold">{eventI + 1}.{eventData.actions.length + 1}</span></span
			>
		</div>
		<div class="w-8/12">
			<span class="">Commitment</span>
			<span class="font-bold">{commitmentData.title}</span>
			<span class="">Assign</span>
		</div>
		<div class="w-1/12 m-auto">
			<InsertActionButton />
		</div>
	</div>
{/if}
