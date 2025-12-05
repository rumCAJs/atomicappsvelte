<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	interface Props {
		currentNick?: string;
	}

	let { currentNick = '' }: Props = $props();
</script>

<div>
	<Button variant="secondary" disabled={false}>Logout</Button>

	<Card.Root>
		<Card.Header>Change your info</Card.Header>

		<form>
			<Card.Content>
				<Input name="nick" value={currentNick} required />
			</Card.Content>
			<Card.Footer>
				<Button type="submit" disabled={false}>Save</Button>
			</Card.Footer>
		</form>
	</Card.Root>
</div>
