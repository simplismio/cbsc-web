<script>
	import '../app.css';
	import '../tailwind.css';
	import '../app.postcss';
</script>

<div class="h-screen flex flex-col items-center dark:bg-black">
	<nav class=" font-bold mt-10">
		<span>
			<a href="/" class="dark:text-white bg-gray-700 p-2 rounded">CBSC</a>

			<a href="/" class="dark:text-white bg-gray-700 p-2 rounded">Contracts</a>
			<a href="./NewEventForm" class="dark:text-white bg-gray-700 p-2">Events</a>
			<a href="./NewCommitmentForm" class="dark:text-white bg-gray-700 p-2 rounded">Commitments</a>
		</span>
	</nav>

	<slot />
</div>
