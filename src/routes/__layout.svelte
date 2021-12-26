<script>
	import '../app.css';
	import '../tailwind.css';
	import '../app.postcss';
</script>

<div class="min-h-screen flex flex-col items-center bg-black dark:bg-black">
	<nav class=" font-bold mt-10">
		<span>
			<a href="/" class="dark:text-white border-4 border-gray-700 p-2 rounded">CBSC</a>
			<a href="./NewEvent" class="dark:text-white border-4 border-gray-700 p-2">Events</a>
			<a href="./NewCommitment" class="dark:text-white border-4 border-gray-700 p-2 rounded"
				>Commitments</a
			>
			<!-- <a href="./Scenarios" class="dark:text-white border-4 border-gray-700 p-2 rounded"
				>Simulation</a
			> -->
		</span>
	</nav>

	<slot />
</div>
