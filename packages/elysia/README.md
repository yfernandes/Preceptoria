# Elysia with Bun runtime

## Getting Started

To get started with this template, simply paste this command into your terminal:

```bash
bun create elysia ./elysia-example
```

## Environment Configuration

This project uses environment-specific MikroORM configurations. Copy the example environment file and configure your database settings:

```bash
cp env.example .env
```

### Environment Variables

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` - Database configuration
- `JWT_SECRET` - JWT signing secret
- `GOOGLE_SPREADSHEET_ID` - Google Sheets integration ID
- `NODE_ENV` - Environment (development/production/test)
- `DB_URL` - Alternative database connection string

### Google Sheets Setup

For Google Sheets integration, you need to:

1. **Create a Google Service Account** in the Google Cloud Console
2. **Download the service account JSON file**
3. **Place it in the `secrets/` directory** as `service_account.json`

The `secrets/` directory is automatically ignored by git for security.

**Advanced Features:**
- **Multi-form consolidation**: Processes data from 4 merged Google Forms
- **Crefito-based grouping**: Uses professional identity numbers for reliable student matching
- **Smart deduplication**: Removes duplicate documents while preserving all unique files
- **Data validation**: Automatically formats phone numbers and emails to pass validation
- **99.46% data completion** achieved in production

### Environment Files

The project supports multiple environment files for different contexts:

- **`.env`** - Development environment (default)
- **`.env.test`** - Test environment (same variable names, different values)
- **`.env.production`** - Production environment (same variable names, different values)

All environment files use the same variable names - only the values change per environment.

### Configuration Profiles

The MikroORM configuration automatically adapts based on `NODE_ENV`:

- **Development**: Debug logging enabled, development database
- **Production**: Optimized for performance, production database
- **Test**: Minimal pooling, test database, validation disabled

## Development

### Prerequisites

- **Bun** (latest version)
- **Node.js** 18+ (for some tooling)
- **PostgreSQL** database

### Setup

1. **Install dependencies:**

   ```bash
   bun install
   ```

2. **Configure environment:**

   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

3. **Start development server:**
   ```bash
   bun run dev
   ```

Open http://localhost:3000/ with your browser to see the result.

### Development Scripts

| Command                 | Description                              |
| ----------------------- | ---------------------------------------- |
| `bun run dev`           | Start development server with hot reload |
| `bun run test`          | Run tests                                |
| `bun run test:watch`    | Run tests in watch mode                  |
| `bun run test:coverage` | Run tests with coverage report           |
| `bun run lint`          | Check code with ESLint                   |
| `bun run lint:fix`      | Fix ESLint issues automatically          |
| `bun run format`        | Format code with Prettier                |
| `bun run format:check`  | Check code formatting                    |
| `bun run type-check`    | Run TypeScript type checking             |

## Testing

This project uses **Bun's built-in test runner**, which provides extremely fast execution and excellent TypeScript support without external dependencies.

### Test Configuration

- **Framework**: Bun Test (built-in, no external dependencies)
- **Coverage**: Built-in coverage provider
- **Environment**: Bun runtime
- **Watch Mode**: Available for development

### Running Tests

```bash
# Run all tests
bun run test

# Run tests in watch mode (development)
bun run test:watch

# Run tests with coverage report
bun run test:coverage
```

### Test Database

For testing, set `NODE_ENV=test` and use a `.env.test` file with test-specific values. The configuration will automatically use test-optimized settings.

**Example `.env.test`:**

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=test_password
DB_NAME=preceptoria_test
JWT_SECRET=test_secret
GOOGLE_SPREADSHEET_ID=test_spreadsheet_id
NODE_ENV=test
```

### Writing Tests

Tests should be placed alongside source files with `.test.ts` or `.spec.ts` extensions:

```
src/
├── controllers/
│   ├── auth.controller.ts
│   └── auth.controller.test.ts
├── entities/
│   ├── user.entity.ts
│   └── user.entity.test.ts
```

### Test Examples

Bun Test uses a Jest-like API:

```typescript
import { describe, it, expect } from "bun:test";

describe("Example Test Suite", () => {
	it("should pass a basic test", () => {
		expect(1 + 1).toBe(2);
	});

	it("should handle async operations", async () => {
		const result = await Promise.resolve("test");
		expect(result).toBe("test");
	});
});
```

## Database Development

This project uses a clean separation of concerns for optimal performance on limited resources:

- **MikroORM**: Handles all database operations (migrations, queries, schema management)
- **Drizzle Studio**: Lightweight database browser for development only

### Using Drizzle Studio

Start the database studio for easy data browsing and management:

```bash
bun run db:studio
```

This opens a lightweight web interface at `http://localhost:4983` for:

- Browsing tables and data
- Running queries
- Viewing schema
- Data visualization

### Database Operations

All database operations are handled by MikroORM with convenient Bun scripts:

#### Migrations

```bash
bun run db:migration:create    # Create a new migration
bun run db:migration:up        # Apply pending migrations
bun run db:migration:down      # Rollback last migration
bun run db:migration:list      # List all migrations
```

#### Schema Management

```bash
bun run db:schema:update       # Update database schema
bun run db:schema:drop         # Drop all tables (⚠️ destructive)
```

#### Seeding

```bash
bun run db:seed:create         # Create a new seeder
bun run db:seed                # Run all seeders
```

**Note**: Drizzle is only used for the Studio interface. All actual database operations go through MikroORM for consistency and type safety.

### Quick Reference

| Command                       | Description                           |
| ----------------------------- | ------------------------------------- |
| `bun run db:studio`           | Open Drizzle Studio for data browsing |
| `bun run db:migration:create` | Create new migration file             |
| `bun run db:migration:up`     | Apply pending migrations              |
| `bun run db:migration:down`   | Rollback last migration               |
| `bun run db:schema:update`    | Update database schema                |
| `bun run db:seed`             | Run database seeders                  |
