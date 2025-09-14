<script lang="ts">
	import '../app.css';
	import logo from '$lib/assets/logo.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={logo} />
</svelte:head>

{@render children?.()}

<footer>Copyright (c) 2025  Ishta Mahadew</footer>