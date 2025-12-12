<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Loader2 } from '@lucide/svelte';
	import { createTask } from '$lib/remote/project/task.remote';
	import { goto } from '$app/navigation';

	interface Props {
		projectId: string;
	}

	let { projectId }: Props = $props();

	let isPending = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		isPending = true;

		try {
			await createTask({
				name: formData.get('name') as string,
				reward: Number(formData.get('reward')),
				pid: projectId
			});
			await goto(`/project/${projectId}?refetch`);
		} catch (e) {
			console.error(e);
		} finally {
			isPending = false;
		}
	}
</script>

<Card.Root class="w-full max-w-md">
	<Card.Header>
		<Card.Title>Create new task</Card.Title>
	</Card.Header>
	<form onsubmit={handleSubmit} class="space-y-4">
		<Card.Content>
			<div>
				<label for="name" class="text-sm font-medium">Task Name</label>
				<Input id="name" name="name" placeholder="workouts, ..." required />
			</div>
			<div class="mt-8">
				<label for="reward" class="text-sm font-medium">Reward</label>
				<Input id="reward" name="reward" placeholder="" required type="number" />
			</div>
		</Card.Content>
		<Card.Footer>
			<Button type="submit" class="w-full" disabled={isPending}>
				{#if isPending}
					<Loader2 class="animate-spin" />
				{:else}
					Create task
				{/if}
			</Button>
		</Card.Footer>
	</form>
</Card.Root>
