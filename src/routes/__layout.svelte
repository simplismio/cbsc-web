<script>
	import '../app.css';
	import '../tailwind.css';
	import '../app.postcss';
</script>

<div class="h-auto flex flex-col items-center mt-10">
	<nav class="text-center font-bold">
		<a href="/" class="bg-gray-100 p-2 rounded">Contracts</a>
		<a href="/NewEventForm" class="ml-3 bg-yellow-100 p-2 rounded">Create Events</a>
		<a href="/NewCommitmentForm" class="ml-3 bg-yellow-100 p-2 rounded">Create Commitments</a>
	</nav>

	<slot />
</div>
