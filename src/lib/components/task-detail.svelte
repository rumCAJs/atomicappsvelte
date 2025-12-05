<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import ErrorMessage from './error-message.svelte';
	import type { TaskSelect } from '$lib/types/db';

	interface Props extends TaskSelect {}

	let { name, description, id, version, reward, isActive }: Props = $props();
</script>

<form class="space-y-4">
	<Field.Group>
		<Field.Field>
			<Field.Label for="name-{id}">Task Name</Field.Label>
			<Input id="name-{id}" name="name" placeholder="e.g., workouts" value={name} required />
		</Field.Field>
		<Field.Field>
			<Field.Label for="reward-{id}">Reward</Field.Label>
			<Input id="reward-{id}" name="reward" type="number" value={reward} required />
		</Field.Field>
		<Field.Field>
			<Field.Label for="description-{id}">Task Description</Field.Label>
			<Textarea
				id="description-{id}"
				name="description"
				placeholder="Detailed description of the task..."
				value={description || ''}
				required
			/>
		</Field.Field>
		<Field.Field>
			<Field.Label for="active-{id}">Active</Field.Label>
			<Checkbox id="active-{id}" name="active" checked={isActive} />
		</Field.Field>
	</Field.Group>
	<Button type="submit" disabled={false}>Update Task</Button>
	<ErrorMessage message={null} />
</form>
