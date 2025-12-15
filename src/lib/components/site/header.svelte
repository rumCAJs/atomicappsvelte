<script lang="ts">
	import CheckCircleIcon from '@lucide/svelte/icons/check-circle';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import UserIcon from '@lucide/svelte/icons/user';
	import { theme } from '$lib/theme.svelte';

	interface Props {
		user?: { name?: string } | null;
	}

	let { user = null }: Props = $props();

	const isDark = $derived(theme.current === 'dark');
</script>

<div class="sticky top-0 z-50">
	<header
		class="relative w-full border-b border-white/[0.08] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg shadow-black/20 backdrop-blur-xl dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
	>
		<!-- Subtle top highlight -->
		<div
			class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
			aria-hidden="true"
		></div>

		<!-- Subtle inner glow -->
		<div
			class="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent"
			aria-hidden="true"
		></div>

		<div class="relative mx-auto max-w-7xl px-4 lg:px-6">
			<div class="flex h-16 items-center">
				<a
					class="group inline-flex items-center gap-2.5 text-white"
					href={user ? '/projects' : '/'}
				>
					<span
						class="grid size-10 place-items-center rounded-xl border border-white/10 bg-gradient-to-b from-indigo-500/20 to-violet-600/20 shadow-lg ring-1 shadow-indigo-500/10 ring-white/10 transition-all duration-300 ring-inset group-hover:from-indigo-500/30 group-hover:to-violet-600/30 group-hover:shadow-indigo-500/20"
					>
						<CheckCircleIcon class="h-5 w-5 text-indigo-400" />
					</span>
					<span
						class="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-lg font-semibold tracking-tight text-transparent sm:text-xl"
					>
						HabbitApp
					</span>
					<span class="sr-only">Habit Tracker</span>
				</a>

				<nav class="ml-auto flex items-center gap-2 sm:gap-3">
					<button
						type="button"
						onclick={() => theme.toggle()}
						class="inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 ring-1 ring-white/5 transition-all duration-200 ring-inset hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
						title={`Change to ${isDark ? 'light' : 'dark'} theme`}
						aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
					>
						{#if isDark}
							<MoonIcon class="h-4 w-4" />
						{:else}
							<SunIcon class="h-4 w-4" />
						{/if}
					</button>

					<div class="hidden h-6 w-px bg-white/10 sm:block" aria-hidden="true"></div>

					{#if !user}
						<a
							class="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
							href="/register"
						>
							Register
						</a>
						<a
							class="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-1.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-400 hover:to-violet-400 hover:shadow-indigo-500/40 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
							href="/login"
						>
							Login
						</a>
					{/if}

					{#if user}
						<a
							class="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
							href="/projects"
						>
							Projects
						</a>
						<a
							class="inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 ring-1 ring-white/5 transition-all duration-200 ring-inset hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
							href="/user"
							aria-label="User profile"
							title="User profile"
						>
							<UserIcon class="h-4 w-4" />
						</a>
					{/if}
				</nav>
			</div>
		</div>
	</header>

	<!-- Gradient fade into content -->
	<div
		class="pointer-events-none h-8 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-transparent dark:from-slate-950/80 dark:via-slate-950/40"
		aria-hidden="true"
	></div>
</div>
