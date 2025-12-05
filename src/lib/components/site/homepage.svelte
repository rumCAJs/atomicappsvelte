<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
	} from "$lib/components/ui/card";
	import HomeIcon from "@lucide/svelte/icons/home";
	import BookOpenIcon from "@lucide/svelte/icons/book-open";
	import LayoutPanelLeftIcon from "@lucide/svelte/icons/layout-panel-left";
</script>

<section class="w-full bg-gray-100 py-12 md:py-24 lg:py-32 dark:bg-gray-800">
	<div class="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
		<Card>
			<CardHeader class="flex flex-row items-center gap-4">
				<HomeIcon class="h-8 w-8" />
				<div class="grid gap-1">
					<CardTitle>Project 1</CardTitle>
					<CardDescription>Short description of Project 1</CardDescription>
				</div>
			</CardHeader>
			<CardContent class="grid gap-2">
				<img
					alt="Project 1"
					class="h-60 w-full object-cover"
					height={300}
					src="/placeholder.svg"
					style="aspect-ratio: 400/300; object-fit: cover;"
					width={400}
				/>
				<div class="text-sm font-semibold">User Score: 85</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center gap-4">
				<BookOpenIcon class="h-8 w-8" />
				<div class="grid gap-1">
					<CardTitle>Project 2</CardTitle>
					<CardDescription>Short description of Project 2</CardDescription>
				</div>
			</CardHeader>
			<CardContent class="grid gap-2">
				<img
					alt="Project 2"
					class="h-60 w-full object-cover"
					height={300}
					src="/placeholder.svg"
					style="aspect-ratio: 400/300; object-fit: cover;"
					width={400}
				/>
				<div class="text-sm font-semibold">User Score: 90</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center gap-4">
				<LayoutPanelLeftIcon class="h-8 w-8" />
				<div class="grid gap-1">
					<CardTitle>Project 3</CardTitle>
					<CardDescription>Short description of Project 3</CardDescription>
				</div>
			</CardHeader>
			<CardContent class="grid gap-2">
				<img
					alt="Project 3"
					class="h-60 w-full object-cover"
					height={300}
					src="/placeholder.svg"
					style="aspect-ratio: 400/300; object-fit: cover;"
					width={400}
				/>
				<div class="text-sm font-semibold">User Score: 95</div>
			</CardContent>
		</Card>
	</div>
</section>

