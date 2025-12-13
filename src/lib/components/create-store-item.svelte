<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Loader2 } from '@lucide/svelte';
	import { addStoreItem } from '$lib/remote/store.remote';
	import { goto } from '$app/navigation';

	interface Props {
		storeId: number;
		projectId: string;
	}

	let { storeId, projectId }: Props = $props();

	let isPending = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const name = formData.get('name') as string;
		const price = Number(formData.get('price'));

		isPending = true;
		try {
			await addStoreItem({ storeId, name, price });
			goto(`/project/${projectId}`);
		} catch (e) {
			console.error(e);
		} finally {
			isPending = false;
		}
	}
</script>

<Card.Root class="w-full max-w-md">
	<Card.Header>
		<Card.Title>Create store item</Card.Title>
	</Card.Header>
	<form class="space-y-4" onsubmit={handleSubmit}>
		<Card.Content>
			<div>
				<label for="name" class="text-sm font-medium">Item Name</label>
				<Input id="name" name="name" placeholder="dinner, relax" required />
			</div>
			<div class="mt-8">
				<label for="price" class="text-sm font-medium">Price</label>
				<Input id="price" name="price" placeholder="" required type="number" />
			</div>
		</Card.Content>
		<Card.Footer>
			<Button type="submit" class="w-full" disabled={isPending}>
				{#if isPending}
					<Loader2 class="animate-spin" />
				{:else}
					Create item
				{/if}
			</Button>
		</Card.Footer>
	</form>
</Card.Root>
