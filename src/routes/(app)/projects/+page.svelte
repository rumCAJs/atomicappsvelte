<script lang="ts">
	import ProjectCard from '$lib/components/project-card.svelte';
	import PlusCircle from '@lucide/svelte/icons/plus-circle';

	let { data } = $props();
</script>

<section class="flex w-full flex-col gap-8">
	<div class="flex justify-center">
		<a class="flex gap-2 px-4 dark:text-white" href="/project/create">
			<PlusCircle />
			Create new project
		</a>
	</div>
	{#each data.projects as p (p.project.publicId)}
		<ProjectCard project={p.project} balance={p.balance} projectId={p.project.publicId} />
	{/each}
</section>
