<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import AnimatedCard from './animated-card.svelte';
	import { cn } from '$lib/utils.js';
	import type { TaskSelect } from '$lib/types/db';

	interface Props extends TaskSelect {
		isLoading?: boolean;
		projectPublicId: string;
	}

	let {
		name,
		reward,
		projectPublicId,
		id,
		description,
		isActive = true,
		isLoading = false
	}: Props = $props();
</script>

<AnimatedCard class={cn('dark:bg-gray-800', !isActive && 'opacity-50')}>
	<Card.Header>
		<Card.Title class={cn(!isActive && 'line-through')}>
			{name}
		</Card.Title>
		{#if !isActive}
			<Card.Description class="text-center">[inactive]</Card.Description>
		{/if}
	</Card.Header>
	<Card.Content>
		{#if description}
			<p>{description}</p>
		{/if}
		<p class="font-semibold">Reward: {reward} points</p>
	</Card.Content>
	<Card.Footer class="flex flex-col gap-2 lg:flex-row">
		<a href={`/project/${projectPublicId}/task/${id}`}>View Details</a>
		<Button variant="outline" disabled={isLoading}>Complete task</Button>
	</Card.Footer>
</AnimatedCard>
