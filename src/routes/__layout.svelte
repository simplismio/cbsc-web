<script>
	import '../app.css';
	import '../tailwind.css';
	import '../app.postcss';
</script>

<div class="h-screen flex flex-col items-center dark:bg-black">
	<nav class="text-center font-bold mt-10">
		<a href="/" class="dark:text-white bg-gray-700 p-1 rounded">Home</a>
		<a href="./NewEventForm" class="dark:text-white bg-gray-700 p-1">Events</a>
		<a href="./NewCommitmentForm" class="dark:text-white bg-gray-700 p-1 rounded">Commitments</a>
	</nav>

	<slot />
</div>
