<script lang="ts">
	import CreateStoreItem from '$lib/components/create-store-item.svelte';
	import { page } from '$app/state';
</script>

<CreateStoreItem storeId={Number(page.params.storeId)} projectId={page.params.pid!} />
