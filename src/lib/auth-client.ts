import { createAuthClient } from "better-auth/svelte"

export const authClient = createAuthClient({
	// baseURL: window.location.origin // Defaults to the current origin
})
