<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import ErrorMessage from './error-message.svelte';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import type { ProjectSelect } from '$lib/types/db';

	interface Props extends ProjectSelect {}

	let { name, description, publicId, version, isActive }: Props = $props();
</script>

<Card.Root class="w-full max-w-md">
	<Card.Header>
		<Card.Title>Project {name} settings</Card.Title>
	</Card.Header>
	<form class="space-y-4">
		<Card.Content>
			<Field.Group>
				<Field.Field>
					<Field.Label for="name-{publicId}">Project Name</Field.Label>
					<Input id="name-{publicId}" name="name" placeholder="Workout" value={name} required />
				</Field.Field>
				<Field.Field>
					<Field.Label for="description-{publicId}">Description</Field.Label>
					<Textarea
						id="description-{publicId}"
						name="description"
						placeholder="Detailed description of the project..."
						value={description || ''}
						required
					/>
				</Field.Field>
				<Field.Field>
					<Field.Label for="active-{publicId}">Active</Field.Label>
					<Checkbox id="active-{publicId}" name="active" checked={isActive} />
				</Field.Field>
			</Field.Group>
		</Card.Content>
		<Card.Footer class="flex gap-4">
			<Button type="submit" disabled={false}>Update Project</Button>
			<ErrorMessage message={null} />

			<Button type="submit" disabled={false}>
				<div class="flex items-center gap-2">
					<Trash2Icon /> Delete Project
				</div>
			</Button>
		</Card.Footer>
	</form>
</Card.Root>
