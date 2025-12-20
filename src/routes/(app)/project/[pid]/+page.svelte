<script lang="ts">
	import ProjectCard from '$lib/components/project-card.svelte';
	import ProjectTaskList from '$lib/components/project-task-list.svelte';
	import StoreItemCard from '$lib/components/store-item-card.svelte';
	import AddIcon from '$lib/components/add-icon.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import ShoppingBasketIcon from '@lucide/svelte/icons/shopping-basket';
	import { getProject } from '$lib/remote/project/project.remote.js';

	let { data } = $props();

	// let projectQuery = $derived(
	// 	getProject({
	// 		id: data.projectId,
	// 		showOnlyActive: !data.isShowingAll
	// 	})
	// );

	// $inspect(data.isShowingAll);
</script>

<div class="flex w-full flex-col gap-8">
	<ProjectCard
		project={data.project}
		projectId={data.projectId}
		balance={data.balance}
		isUserAdmin={data.role === 'admin'}
	/>

	<ProjectTaskList
		tasks={data.tasks}
		projectId={data.project.publicId}
		isUserAdmin={data.role === 'admin'}
		isShowingAll={data.isShowingAll}
	/>

	<Card.Root class="bg-card text-card-foreground">
		<Card.Header>
			<Card.Title class="flex justify-between gap-2">
				<div class="flex gap-2">
					<ShoppingBasketIcon />
					Store - {data.store.info.name}
				</div>
				<AddIcon
					href={`/project/${data.project.publicId}/store/${data.store.info.id}/create-item`}
					title="Create new item"
				/>
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-4 md:grid-cols-3">
				{#each data.store.items as item (item.id)}
					<StoreItemCard {...item} projectId={data.project.publicId} storeId={data.store.info.id} />
				{/each}
			</div>
		</Card.Content>
	</Card.Root>
</div>
