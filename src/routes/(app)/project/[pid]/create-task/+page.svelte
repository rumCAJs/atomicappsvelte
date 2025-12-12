<script lang="ts">
	import CreateTaskForm from '$lib/components/create-task-form.svelte';

	let { data } = $props();
</script>

<div class="flex w-full justify-center">
	<CreateTaskForm projectId={data.projectId} />
</div>

