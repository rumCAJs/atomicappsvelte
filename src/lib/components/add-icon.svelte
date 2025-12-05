<script lang="ts">
	import PlusSquareIcon from "@lucide/svelte/icons/plus-square";
	import type { Component } from "svelte";

	interface Props {
		href: string;
		title: string;
		icon?: Component;
	}

	let { href, title, icon }: Props = $props();
</script>

<a
	href={href}
	class="hover:scale-125 transition duration-300"
	{title}
>
	{#if icon}
		<svelte:component this={icon} />
	{:else}
		<PlusSquareIcon />
	{/if}
</a>

