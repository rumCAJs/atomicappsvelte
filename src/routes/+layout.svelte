<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/site/header.svelte';
	import Footer from '$lib/components/site/footer.svelte';
	import Homepage from '$lib/components/site/homepage.svelte';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Header />
<Homepage />
{@render children()}
<Footer />