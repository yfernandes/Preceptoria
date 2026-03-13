# AI Agent Instructions for Preceptoria V2

This document provides essential guidelines, rules, and commands for AI coding agents operating in this repository.

## 🏗️ Project Architecture & Stack

- **Framework**: SvelteKit with Svelte 5 (Runes mode)
- **Language**: TypeScript (strictly typed)
- **Backend/Database**: Drizzle ORM + PostgreSQL (Neon)
- **Authentication**: better-auth
- **UI Components**: bits-ui (Headless)
- **Icons**: lucide-svelte
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
  _(Always append `--run` for AI agents to prevent interactive hang)_

## 📐 Code Style & Guidelines

### TypeScript & Types

- **Strict Typing**: Ensure all variables, function arguments, and return types are strictly typed. Avoid `any`.
- **Consistency**: Backend Drizzle schemas drive application types. Always keep schema and inferred types in sync. Update frontend types whenever backend entities change.
- **Runes**: Use Svelte 5 runes (`$state`, `$derived`, `$effect`, etc.) instead of Svelte 4 stores where appropriate.

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

### better-auth & Cookies

- **Auth Configuration**: Located in `src/lib/server/auth.ts`.
- **Cookies**: Always use `secure: import.meta.env.PROD` and `sameSite: "lax"` when working manually with cookies.
- **Secrets**: Never hardcode credentials. Update `.env.example` when adding new variables.

### RBAC System

The system uses a granular permission model: `Resource:Action_Modifier`.

- **Resources**: Hospital, Student, School, Course, Classes, Document, Shift, Supervisor, HospitalManager, Preceptor, User, Audit.
- **Actions**: Create, Read, Update, Delete, Assign, Compile, Approve.
- **Modifiers**:
  - `Own`: Direct ownership (prevents cross-user access).
  - `Managed`: Organizational hierarchy (prevents cross-org access).
  - `Students`: Acting on behalf of supervised students.
  - `Assigned`: Resources explicitly assigned (e.g., shifts).
  - `Basic`: Limited read for cross-org navigation.
  - `Class`: Resources within the same class.

Always check `hasPermission()` from `$lib/server/permissions.ts` inside actions, endpoints, or services before allowing resource mutations or reads.

## 🛠️ Tooling Integrations (MCP & Cursor Rules)

### Svelte MCP Server

Agents have access to the Svelte MCP server for comprehensive Svelte 5 and SvelteKit documentation. Use it systematically:

1. **`list-sections`**: Use this FIRST to discover available documentation.
2. **`get-documentation`**: Fetch required sections based on `use_cases`.
3. **`svelte-autofixer`**: ALWAYS run this before writing Svelte code to project files. Keep calling it until no issues are returned.

### Dev & Workflow Rules

- **Database Migration Rule**: When changing Drizzle schemas (`src/lib/server/db/schema.ts`), generate the migration AND update any related test factories/seeders.
- **Endpoint Documentation Rule**: When modifying server routes or actions, ensure any shared contracts (like `endpoints.jsonl` if it exists) are updated.
- **Environment Variable Rule**: When adding new env vars, update `.env.example` and validation logic in `src/lib/server/db/index.ts` or relevant config files.
- **Frontend-First Rule**: When making system changes, prefer modifying the frontend to match backend types rather than tweaking backend models just for convenience.
- **Proactiveness**: Verify code logic by running a test (`bun run test:unit --run`). Execute project linting (`bun run lint`) before declaring a coding task finished.

### Common Pitfalls & Tips

- **Drizzle Relations**: Remember to define both sides of a relation in `schema.ts`. Use the `with` property in `findFirst`/`findMany` for eager loading.
- **Better Auth Client**: Use the `$lib/client/auth.ts` helper on the frontend to interact with the authentication session.
- **Server Load Functions**: Data fetching for pages should happen in `+page.server.ts` using the `load` function. Pass data to the frontend through the `data` prop.
- **Form Actions**: Use SvelteKit `actions` for data mutations. Handle success/failure responses consistently to trigger appropriate UI feedback.
- **Zod Validation**: Use Zod for runtime type checking of form data and API request bodies.

## 📋 Operational Workflow

1. **Adding new endpoint**: Update route (+page.server.ts or +server.ts), update permissions if needed, update frontend client/types.
2. **Changing entity**: Update `schema.ts`, create migration, update frontend types, update seeders.
3. **Adding env vars**: Update `.env.example`, update validation in server init, document in README.
4. **Implementing UI**: Use Tailwind CSS v4 and Svelte 5 runes. Ensure components are responsive and accessible. Use **bits-ui** for complex accessible components and **lucide-svelte** for icons.
5. **Testing**: Add a `.spec.ts` file for any new logic. Run Vitest frequently.
