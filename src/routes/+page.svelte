<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import AnimatedCard from '$lib/components/animated-card.svelte';
	import SignupForm from '$lib/components/signup-form.svelte';
	const session = authClient.useSession();
</script>

<div>
	<SignupForm />

	{#if $session.data}
		<div>
			<p>
				{$session.data.user.name}
			</p>
			<button
				on:click={async () => {
					await authClient.signOut();
				}}
			>
				Sign Out
			</button>
		</div>
	{:else}
		<button
			on:click={async () => {
				// authClient.signUp.email({

				// })
				await authClient.signIn.email({
					email: 'test@test.com',
					password: 'testGA42!'
				});
			}}
		>
			Continue with GitHub
		</button>
	{/if}
</div>
