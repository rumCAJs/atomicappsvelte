<script lang="ts">
	import ProjectCard from '$lib/components/project-card.svelte';
	import ProjectTaskList from '$lib/components/project-task-list.svelte';
	import StoreItemCard from '$lib/components/store-item-card.svelte';
	import AddIcon from '$lib/components/add-icon.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import ShoppingBasketIcon from '@lucide/svelte/icons/shopping-basket';
	import { getProject } from '$lib/remote/project/project.remote.js';

	let { data } = $props();

	let projectQuery = $derived(
		getProject({
			id: data.projectId,
			showOnlyActive: !data.isShowingAll
		})
	);

	$inspect(data.isShowingAll);
</script>

<div class="flex w-full flex-col gap-8">
	{#if projectQuery.error}
		<p>oops!</p>
	{:else if projectQuery.loading}
		<p>loading...</p>
	{:else if projectQuery.current}
		<ProjectCard
			project={projectQuery.current.project}
			projectId={data.projectId}
			balance={projectQuery.current.balance}
			isUserAdmin={data.role === 'admin'}
		/>

		<ProjectTaskList
			tasks={projectQuery.current.tasks}
			projectId={projectQuery.current.project.publicId}
			isUserAdmin={projectQuery.current.role === 'admin'}
			isShowingAll={data.isShowingAll}
		/>

		<Card.Root class="bg-card text-card-foreground">
			<Card.Header>
				<Card.Title class="flex justify-between gap-2">
					<div class="flex gap-2">
						<ShoppingBasketIcon />
						Store - {projectQuery.current.store.info.name}
					</div>
					<AddIcon
						href={`/project/${projectQuery.current.project.publicId}/store/${projectQuery.current.store.info.id}/create-item`}
						title="Create new item"
					/>
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="grid gap-4 md:grid-cols-3">
					{#each projectQuery.current.store.items as item (item.id)}
						<StoreItemCard
							{...item}
							projectId={projectQuery.current.project.publicId}
							storeId={projectQuery.current.store.info.id}
						/>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
