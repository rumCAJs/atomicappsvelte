<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import AnimatedCard from './animated-card.svelte';
	import { cn } from '$lib/utils.js';
	import type { TaskSelect } from '$lib/types/db';
	import { completeTask } from '$lib/remote/project/task.remote';
	import { getProject } from '$lib/remote/project/project.remote';

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

	let isCompleting = $state(false);

	async function handleCompleteTask() {
		isCompleting = true;
		try {
			await completeTask({ taskId: id, projectId: projectPublicId });
		} finally {
			isCompleting = false;
		}
	}
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
		<Button variant="outline" disabled={isLoading || isCompleting} onclick={handleCompleteTask}>
			{isCompleting ? 'Completing...' : 'Complete task'}
		</Button>
	</Card.Footer>
</AnimatedCard>
