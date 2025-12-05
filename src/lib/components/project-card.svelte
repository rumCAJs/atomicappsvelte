<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import HomeIcon from '@lucide/svelte/icons/home';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import AddIcon from './add-icon.svelte';
	import { cn } from '$lib/utils.js';
	import type { ProjectSelect } from '$lib/types/db';

	interface Props {
		project: ProjectSelect;
		balance: number;
		className?: string;
		projectId: string;
		isUserAdmin?: boolean;
	}

	let { className, projectId, project, balance, isUserAdmin }: Props = $props();
</script>

<Card.Root class={cn('bg-gray-50', className)}>
	<Card.Header class="flex flex-row items-center justify-between gap-4">
		<div class="flex items-center gap-2">
			<HomeIcon class="h-8 w-8" />
			<div class="grid gap-1">
				<Card.Title>
					<a href={`/project/${project.publicId}`}>
						{project.name}
					</a>
				</Card.Title>
			</div>
		</div>
		{#if isUserAdmin}
			<AddIcon
				href={`/project/${project.publicId}/settings`}
				title="Project settings"
				icon={SettingsIcon}
			/>
		{/if}
	</Card.Header>

	<!-- <Card.Description> -->
	<!--   {project.description} -->
	<!-- </Card.Description> -->
	<Card.Content class="grid gap-2">
		<img
			alt="Project 1"
			class="h-40 w-full object-cover"
			height={100}
			src="/placeholder.svg"
			style="aspect-ratio: 1200/100; object-fit: cover;"
			width={1200}
		/>
		<div class="flex items-center text-xl font-semibold">
			My balance: {balance}
			<img src="/token-min.png" width={30} height={35} class="ml-2 drop-shadow-lg" />
		</div>
	</Card.Content>
</Card.Root>
