# AI Agent Instructions for Preceptoria V2

This document provides essential guidelines, rules, and commands for AI coding agents operating in this repository. 

## 🏗️ Project Architecture & Stack
- **Framework**: SvelteKit with Svelte 5
- **Language**: TypeScript (strictly typed)
- **Backend/Database**: Drizzle ORM + PostgreSQL (Neon)
- **Authentication**: better-auth
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest (Unit), Playwright (E2E)
- **Package Manager**: Bun

## 💻 Commands

We strictly prefer `bun` for scripts. Doppler environment injection is already embedded in the `package.json` scripts where needed.

### Development & Build
- **Install dependencies**: `bun install`
- **Start dev server**: `bun run dev`
- **Build project**: `bun run build`

### Database
- **Push schema changes**: `bun run db:push`
- **Generate migrations**: `bun run db:generate`
- **Run migrations**: `bun run db:migrate`
- **Update Auth Schema**: `bun run auth:schema`

### Linting & Formatting
- **Check formatting & lint**: `bun run lint`
- **Format code**: `bun run format`
- **Type check**: `bun run check`

### Testing
- **Run all tests**: `bun run test`
- **Run unit tests**: `bun run test:unit --run`
- **Run E2E tests**: `bun run test:e2e`
- **Run a single test**: `bun run test:unit <path/to/file.spec.ts> --run` 
  *(Always append `--run` for AI agents to prevent interactive hang)*

## 📐 Code Style & Guidelines

### TypeScript & Types
- **Strict Typing**: Ensure all variables, function arguments, and return types are strictly typed. Avoid `any`.
- **Consistency**: Backend Drizzle schemas drive application types. Always keep schema and inferred types in sync. Update frontend types whenever backend entities change.

### Formatting & Naming
- **Naming**: Use `camelCase` for variables and functions, `PascalCase` for classes and components, and `UPPER_SNAKE_CASE` for global constants.
- **Files**: Use `camelCase` or `kebab-case` for standard files, `PascalCase.svelte` for Svelte components. `+page.svelte` and `+layout.svelte` for SvelteKit routing.
- Rely on Prettier and ESLint for formatting; auto-fix standard issues using `bun run format`.

### Error Handling
- Use `try-catch` blocks for async database or API operations.
- Handle errors gracefully. Server functions and form actions should return standardized payloads (e.g. `{ success: false, message: string }`) or appropriate HTTP status codes (`error(400, "...")`).
- Do not leak stack traces to the client side.

### Imports
- Use SvelteKit aliases (`$lib/`, `$app/`) for shared resources or absolute imports.
- Group external framework imports (like `drizzle-orm`, `svelte`) above internal project imports.

## 🔒 Security, Auth & RBAC
- **Cookies**: Always use `secure: import.meta.env.PROD` and `sameSite: "lax"` when working manually with cookies.
- **Secrets**: Never hardcode credentials. Update `.env.example` when adding new variables.
- **Permissions**: Always check `hasPermission()` from `$lib/server/permissions.ts` inside actions, endpoints, or services before allowing resource mutations or reads.

## 🛠️ Tooling Integrations (MCP & Cursor Rules)

### Svelte MCP Server
Agents have access to the Svelte MCP server for comprehensive Svelte 5 and SvelteKit documentation. Use it systematically:
1. **`list-sections`**: Use this FIRST to discover available documentation.
2. **`get-documentation`**: Fetch required sections based on `use_cases`.
3. **`svelte-autofixer`**: ALWAYS run this before writing Svelte code to project files. Keep calling it until no issues are returned.
4. **`playground-link`**: Generate a Svelte Playground link with provided code, but ONLY if confirmed by the user.

### Dev & Workflow Rules
- **Database Migration Rule**: When changing Drizzle schemas (`src/lib/server/db/schema.ts`), generate the migration AND update any related test factories/seeders.
- **Frontend-First Rule**: When making system changes, prefer modifying the frontend to adapt to backend types rather than tweaking backend models just for convenience.
- **Proactiveness**: Verify code logic by running a test (`bun run test:unit --run`). Execute project linting (`bun run lint`) before declaring a coding task finished.
