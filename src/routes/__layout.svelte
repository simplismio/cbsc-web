<script>
	import '../app.css';
	import '../tailwind.css';
	import '../app.postcss';
</script>

<div class="h-screen flex flex-col items-center">
	<nav class="text-center font-bold mt-10">
		<a href="/" class="">Contracts</a>
		<a href="/NewEventForm" class="ml-3">+ Events</a>
		<a href="/NewCommitmentForm" class="ml-3">+ Commitments</a>
	</nav>

	<slot />
</div>
