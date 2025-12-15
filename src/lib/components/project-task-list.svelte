<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import BookCheckIcon from '@lucide/svelte/icons/book-check';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';
	import AddIcon from './add-icon.svelte';
	import TaskCard from './task-card.svelte';
	import { cn } from '$lib/utils.js';
	import type { TaskSelect } from '$lib/types/db';

	interface Props {
		tasks: TaskSelect[];
		className?: string;
		projectId: string;
		isUserAdmin?: boolean;
		isShowingAll?: boolean;
	}

	let { tasks, className, projectId, isUserAdmin, isShowingAll = false }: Props = $props();
</script>

<Card.Root class={cn('bg-card text-card-foreground', className)}>
	<Card.Header>
		<Card.Title class="flex justify-between">
			<div class="flex gap-2">
				<BookCheckIcon />
				Tasks
			</div>
			<div class="flex gap-4">
				{#if isUserAdmin}
					<a href={`?show=${isShowingAll ? 'active' : 'all'}`}>
						{#if isShowingAll}
							<EyeOffIcon />
						{:else}
							<EyeIcon />
						{/if}
					</a>
				{/if}
				<AddIcon href={`/project/${projectId}/create-task`} title="Create new task" />
			</div>
		</Card.Title>
	</Card.Header>
	<Card.Content class="px-4 pt-0">
		<div class="grid gap-4 md:grid-cols-3">
			{#each tasks as task (task.id)}
				<TaskCard projectPublicId={projectId} {...task} {isShowingAll} />
			{/each}
		</div>
	</Card.Content>
</Card.Root>
