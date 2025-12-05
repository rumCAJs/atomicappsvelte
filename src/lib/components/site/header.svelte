<script lang="ts">
	import CheckCircleIcon from "@lucide/svelte/icons/check-circle";
	import MoonIcon from "@lucide/svelte/icons/moon";
	import SunIcon from "@lucide/svelte/icons/sun";
	import UserIcon from "@lucide/svelte/icons/user";

	interface Props {
		theme?: string;
		user?: { name?: string } | null;
	}

	let { theme = "light", user = null }: Props = $props();

	const isLightTheme = theme === "light";
</script>

<header class="px-4 lg:px-6 h-14 flex items-center bg-gray-50 dark:bg-gray-900 w-full">
	<a
		class="flex items-center justify-center"
		href={user ? "/projects" : "/"}
	>
		<CheckCircleIcon class="h-6 w-6 dark:text-white" />
		<span class="ml-2 font-semibold text-xl dark:text-white">
			HabbitApp
		</span>
		<span class="sr-only">Habit Tracker</span>
	</a>
	<nav class="ml-auto flex gap-4 sm:gap-6 dark:text-white">
		<span
			class="cursor-pointer"
			title={`Change to ${isLightTheme ? "dark" : "light"} theme`}
		>
			{#if isLightTheme}
				<SunIcon />
			{:else}
				<MoonIcon />
			{/if}
		</span>
		{#if !user}
			<a
				class="text-sm font-medium hover:underline underline-offset-4"
				href="/register"
			>
				Register
			</a>
			<a
				class="text-sm font-medium hover:underline underline-offset-4"
				href="/login"
			>
				Login
			</a>
		{/if}
		{#if user}
			<a
				class="text-sm font-medium hover:underline underline-offset-4"
				href="/projects"
			>
				Projects
			</a>
			<a href="/user">
				<UserIcon />
			</a>
		{/if}
	</nav>
</header>

