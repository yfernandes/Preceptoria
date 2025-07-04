# Development Guide

This document outlines the development setup, best practices, and workflow for the Elysia server.

## 🚀 Quick Start

1. **Clone and install:**
   ```bash
   cd packages/elysia
   bun install
   ```

2. **Setup environment:**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials and other required variables
   ```

   **Required environment variables:**
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` - Database configuration
   - `JWT_SECRET` - JWT signing secret
   - `GOOGLE_SPREADSHEET_ID` - Google Sheets integration ID
   - `NODE_ENV` - Environment (development/production/test)

   **For testing:** Create a `.env.test` file with test-specific values using the same variable names.

3. **Start development:**
   ```bash
   bun run dev
   ```

## 📋 Development Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server with hot reload |
| `bun run test` | Run all tests |
| `bun run test:watch` | Run tests in watch mode |
| `bun run test:coverage` | Generate coverage report |
| `bun run lint` | Check code quality |
| `bun run lint:fix` | Auto-fix linting issues |
| `bun run format` | Format code with Prettier |
| `bun run format:check` | Check code formatting |
| `bun run type-check` | Run TypeScript type checking |

## 🛠️ Development Tools

### Code Quality

- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **EditorConfig**: Consistent editor settings

### Testing

- **Bun Test**: Built-in testing framework (no external dependencies)
- **Coverage**: Built-in coverage provider
- **Watch Mode**: Development-friendly test watching

### Database

- **MikroORM**: ORM for database operations
- **Drizzle Studio**: Database browser (development only)
- **Migrations**: Database schema management

## 📁 Project Structure

```
src/
├── controllers/     # API route handlers
├── entities/        # Database models
├── middlewares/     # Express/Elysia middlewares
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── index.ts        # Application entry point
```

## 🔧 Configuration Files

- **`.editorconfig`**: Editor consistency
- **`.prettierrc`**: Code formatting rules
- **`.prettierignore`**: Files to ignore during formatting
- **`eslint.config.mjs`**: Linting rules
- **`tsconfig.json`**: TypeScript configuration

- **`bunfig.toml`**: Bun runtime configuration

## 🎯 Best Practices

### Code Style

1. **Use tabs for indentation** (2 spaces width)
2. **End files with newline**
3. **Use semicolons**
4. **Use double quotes for strings**
5. **Trailing commas in objects/arrays**

### TypeScript

1. **Enable strict mode**
2. **Use explicit types when needed**
3. **Prefer interfaces over types for objects**
4. **Use proper import/export syntax**

### Testing

1. **Write tests alongside source files**
2. **Use descriptive test names**
3. **Test both success and error cases**
4. **Keep tests simple and focused**

### Git Workflow

1. **Use conventional commits**
2. **Run linting before commits**
3. **Keep commits atomic**
4. **Write meaningful commit messages**

## 🔍 Code Quality Checks

Before committing, ensure:

```bash
# Run all quality checks
bun run lint
bun run format:check
bun run type-check
bun run test
```

## 🐛 Debugging

### Development Server

The development server runs with hot reload enabled. Any changes to source files will automatically restart the server.

### Database Debugging

Use Drizzle Studio for database inspection:

```bash
bun run db:studio
```

### Testing Debugging

Run tests in watch mode for development:

```bash
bun run test:watch
```

## 📚 Additional Resources

- [Elysia Documentation](https://elysiajs.com/)
- [MikroORM Documentation](https://mikro-orm.io/)
- [Bun Test Documentation](https://bun.sh/docs/cli/test)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) 