<script lang="ts">
import { goto } from "$app/navigation"
import { resolve } from "$app/paths"
import { authClient } from "$lib/auth-client"

let { user }: { user: { name: string; role: string } | null } = $props()

async function _handleLogout() {
	await authClient.signOut()
	await goto(resolve("/login"))
}
</script>

<header
	class="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-100 bg-white/80 px-8 backdrop-blur-md"
>
	<div class="flex flex-1 items-center gap-4">
		<div class="relative hidden w-full max-w-md lg:block">
			<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
			<input
				type="text"
				placeholder="Pesquisar..."
				class="w-full rounded-full border-none bg-gray-50 py-2 pr-4 pl-10 text-sm transition-all focus:ring-2 focus:ring-blue-100"
			/>
		</div>
	</div>

	<div class="flex items-center gap-6">
		<button class="relative p-2 text-gray-400 transition-colors hover:text-gray-600">
			<Bell class="h-5 w-5" />
			<span class="absolute top-2 right-2 h-2 w-2 rounded-full border-2 border-white bg-red-500"
			></span>
		</button>

		<div class="h-8 w-px bg-gray-100"></div>

		<div class="flex items-center gap-4">
			<div class="hidden text-right sm:block">
				<p class="text-sm font-semibold text-gray-900">{user?.name || "Usuário"}</p>
				<p class="text-xs font-medium tracking-tight text-gray-500 uppercase">
					{user?.role || "Visitante"}
				</p>
			</div>

			<div class="group relative">
				<div
					class="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 font-bold text-white shadow-md shadow-blue-100 transition-transform active:scale-95"
				>
					{#if user?.name}
						{user.name.charAt(0)}
					{:else}
						<User class="h-5 w-5" />
					{/if}
				</div>

				<!-- Simple Dropdown Placeholder -->
				<div
					class="invisible absolute right-0 mt-2 w-48 origin-top-right transform rounded-xl border border-gray-100 bg-white py-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100"
				>
					<div class="px-2">
						<button
							onclick={handleLogout}
							class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
						>
							<LogOut class="h-4 w-4" />
							Sair da conta
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</header>
