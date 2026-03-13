<script lang="ts">
	import Sidebar from "$lib/components/layout/Sidebar.svelte";
	import Header from "$lib/components/layout/Header.svelte";
	import type { LayoutData } from "./$types";

	let { children, data }: { children: any; data: LayoutData } = $props();
</script>

<div class="flex h-screen bg-[#F9FAFB]">
	<!-- Sidebar -->
	<Sidebar />

	<!-- Main Content -->
	<div class="flex min-w-0 flex-1 flex-col overflow-hidden">
		<!-- Header -->
		<Header user={data.user} />

		<!-- Content -->
		<main class="relative flex-1 overflow-y-auto scroll-smooth outline-none focus:outline-none">
			<div class="mx-auto max-w-[1600px] p-4 md:p-8 lg:p-10">
				{@render children()}
			</div>
		</main>
	</div>
</div>
