<script>
	import '../app.css';
	import '../tailwind.css';
	import '../app.postcss';
</script>

<div class="font-bold text-5xl mt-10 mb-8 text-center">CBSC Designer</div>

<nav class="text-center font-bold">
	<a href="/" class="bg-gray-100 p-2 rounded">Home</a>
	<a href="/NewEventForm" class="ml-3 bg-yellow-100 p-2 rounded">Create Event</a>
	<a href="/NewCommitmentForm" class="ml-3 bg-yellow-100 p-2 rounded">Create Commitment</a>
</nav>

<slot />
