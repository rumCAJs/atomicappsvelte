<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import AnimatedCard from './animated-card.svelte';
	import { cn } from '$lib/utils.js';
	import type { StoreItemSelect } from '$lib/types/db';
	import { buyStoreItem } from '$lib/remote/store.remote';

	interface Props extends StoreItemSelect {
		storeId: number;
		projectId: string;
		className?: string;
	}

	let { id, name, price, storeId, projectId, className }: Props = $props();

	let isLoading = $state(false);

	async function handleBuy() {
		isLoading = true;
		try {
			await buyStoreItem({ itemId: id });
		} catch (error) {
			console.error('Failed to buy item:', error);
		} finally {
			isLoading = false;
		}
	}
</script>

<AnimatedCard variant="store" direction="left" class={cn('dark:bg-gray-800', className)}>
	<Card.Header>
		<Card.Title>{name}</Card.Title>
	</Card.Header>
	<Card.Content>
		<p>TODO: add description</p>
		<p class="font-semibold">Price: {price} points</p>
	</Card.Content>
	<Card.Footer>
		<Button variant="outline" onclick={handleBuy} disabled={isLoading}>
			{isLoading ? 'Buying...' : 'Buy'}
		</Button>
	</Card.Footer>
</AnimatedCard>
