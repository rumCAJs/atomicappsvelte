<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Loader2 } from '@lucide/svelte';
	import { createProject } from '$lib/remote/project/project.remote';

	let isDialogOpen = $state(false);
	let isPending = $state(false);
	let formData = $state({ name: '', description: '' });

	function showDialog() {
		isDialogOpen = true;
	}

	async function createProjectaaa() {
		isDialogOpen = false;
		isPending = true;
		await createProject({ name: 'test project1', description: 'test description1' });
		isPending = false;
	}
</script>

<Card.Root class="w-full max-w-md">
	<Card.Header>
		<Card.Title>Create new project</Card.Title>
	</Card.Header>
	<form class="space-y-4">
		<Card.Content>
			<Input name="name" placeholder="workouts, ..." required />
			<Input class="mt-8" name="description" placeholder="" required />
		</Card.Content>
		<Card.Footer>
			<Button onclick={showDialog} class="w-full" disabled={isPending}>
				{#if isPending}
					<Loader2 class="animate-spin" />
				{:else}
					Create project
				{/if}
			</Button>
		</Card.Footer>
	</form>
</Card.Root>

<Dialog.Root bind:open={isDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Confirm Project Creation</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to create the project "{formData.name}"?
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (isDialogOpen = false)}>Cancel</Button>
			<Button onclick={createProjectaaa}>Confirm</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
