<script lang="ts">
	let { message }: { message?: string | null } = $props();
</script>

{#if message}
	<div class="font-bold text-red-700">*{message}</div>
{/if}


