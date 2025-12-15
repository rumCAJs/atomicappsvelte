<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/site/header.svelte';
	import Footer from '$lib/components/site/footer.svelte';

	let { data, children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Header user={data.user} />
<main class="mx-auto max-w-7xl p-4">
	{@render children()}
</main>
<Footer />
