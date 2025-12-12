<script lang="ts">
	import TaskDetail from '$lib/components/task-detail.svelte';
	import * as Card from '$lib/components/ui/card/index.js';

	let { data } = $props();
</script>

<Card.Root class="w-full max-w-md">
	<Card.Header>
		<Card.Title>Task {data.task.name} settings</Card.Title>
	</Card.Header>
	<Card.Content>
		<TaskDetail {...data.task} />
	</Card.Content>
</Card.Root>
