<script>
	import '../app.css';
	import '../tailwind.css';
	import '../app.postcss';
</script>

<div class="h-screen flex flex-col items-center dark:bg-black">
	<nav class="text-center font-bold mt-10">
		<a href="/" class="dark:text-white">Home</a>
		<a href="./NewEventForm" class="dark:text-white ml-3">+Events</a>
		<a href="./NewCommitmentForm" class="dark:text-white ml-3">+Commitments</a>
	</nav>

	<slot />
</div>
