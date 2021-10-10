<script>
	import InsertActionButton from './InsertActionButton.svelte';

	export let eventData;
	export let eventI;
	export let commitmentData;
	export let fluentData;
	export let delegate;
	export let assign;
	export let numericalBalance;
	export let nonNumericalBalance;
</script>

{#if delegate == '0' && assign == '0'}
	<div class="flex flex-wrap text-sm bg-white p-3 mt-1 rounded dark:bg-black dark:text-white">
		<div class="w-3/12 m-auto">
			<span
				><span class="font-bold pl-2">Action</span><span
					class="font-bold dark:bg-gray-700 rounded ml-1 pl-1 pr-1"
					>{eventI + 1}.{eventData.actions.length + 1}</span
				></span
			>
		</div>
		<div class="w-8/12">
			<p class="font-bold pl-1">Something</p>
			<p class="pl-1">Message</p>
		</div>
		<div class="w-1/12 m-auto">
			<InsertActionButton />
		</div>
	</div>
{/if}

{#if delegate == '1'}
	<div class="flex flex-wrap text-sm bg-white p-3 mt-1 rounded dark:bg-black dark:text-white">
		<div class="w-3/12 m-auto">
			<span
				><span class="font-bold pl-2">Action</span><span
					class="font-bold dark:bg-gray-700 rounded ml-1 pl-1 pr-1"
					>{eventI + 1}.{eventData.actions.length + 1}</span
				></span
			>
		</div>
		<div class="w-8/12">
			<p class="font-bold pl-1">Something</p>
			<p class="pl-1">Message</p>
		</div>
		<div class="w-1/12 m-auto">
			<InsertActionButton />
		</div>
	</div>
{/if}

{#if assign == '1'}
	<div class="flex flex-wrap text-sm bg-white p-3 mt-1 rounded dark:bg-black dark:text-white">
		<div class="w-3/12 m-auto">
			<span
				><span class="font-bold pl-2">Action</span><span
					class="font-bold dark:bg-gray-700 rounded ml-1 pl-1 pr-1"
					>{eventI + 1}.{eventData.actions.length + 1}</span
				></span
			>
		</div>
		<div class="w-8/12">
			<p class="font-bold pl-1">Something</p>
			<p class="pl-1">Message</p>
		</div>
		<div class="w-1/12 m-auto">
			<InsertActionButton />
		</div>
	</div>
{/if}
