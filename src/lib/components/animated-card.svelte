<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { Card } from "$lib/components/ui/card";
	import { cn } from "$lib/utils";

	interface Props extends HTMLAttributes<HTMLDivElement> {
		variant?: "default" | "store";
		direction?: "right" | "left";
		class?: string;
		children?: import("svelte").Snippet;
	}

	let {
		variant = "default",
		direction = "right",
		class: className,
		children,
		...restProps
	}: Props = $props();

	let rootElement: HTMLDivElement | null = $state(null);

	$effect(() => {
		if (!rootElement) {
			return;
		}

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				const hw = height / width;
				const p = Math.min(Math.round((100 * hw) / 2), 50);
				const target = entry.target as HTMLDivElement;
				target.style.setProperty("--card-before-width", `${p}%`);
			}
		});

		resizeObserver.observe(rootElement);

		return () => {
			if (rootElement) {
				resizeObserver.unobserve(rootElement);
			}
			resizeObserver.disconnect();
		};
	});

	const variantClasses = {
		default: "[--card-gradient-from:#0074d9] [--card-gradient-to:#01ff70]",
		store: "[--card-gradient-from:#21D4FD] [--card-gradient-to:#B721FF]",
	};

	const directionClasses = {
		right: "[--card-rotate-to:405deg]",
		left: "[--card-rotate-to:-315deg]",
	};
</script>

<Card
	bind:ref={rootElement}
	class={cn(
		"animated-card",
		"bg-white",
		"hover:border-gray-300",
		variantClasses[variant],
		directionClasses[direction],
		className
	)}
	{...restProps}
>
	{@render children?.()}
</Card>

<style>
	:global(.animated-card) {
		--card-radius: 0.5rem;
		--card-gradient-from-real: var(--card-gradient-from, #0074d9);
		--card-gradient-to-real: var(--card-gradient-to, #01ff70);

		display: grid;
		place-items: center;
		position: relative;
		border-radius: var(--card-radius);
		overflow: hidden;
		z-index: 5;
		transition: all 1s;
	}

	:global(.animated-card:hover) {
		transform: scale(105%, 105%);
	}

	:global(.animated-card::before) {
		content: "";
		position: absolute;
		width: var(--card-before-width);
		height: 380%;
		background: conic-gradient(
			from 90deg,
			var(--card-gradient-from-real),
			var(--card-gradient-to-real),
			var(--card-gradient-from-real)
		);
		transform: rotate(45deg);
		z-index: -1;
		animation: card-animation 60s linear infinite;
		transition: all 1s;
	}

	:global(.animated-card:hover::before) {
		width: 300%;
		animation: card-animation 3s linear infinite;
	}

	@keyframes card-animation {
		from {
			transform: rotate(45deg);
		}
		to {
			transform: rotate(var(--card-rotate-to, 405deg));
		}
	}

	:global(.animated-card::after) {
		--card-inset: 2px;
		content: "";
		position: absolute;
		inset: var(--card-inset);
		z-index: -1;
		background: inherit;
		border-radius: calc(var(--card-radius) - var(--card-inset));
	}

	:global(.animated-card:hover::after) {
		--card-inset: 4px;
	}
</style>
