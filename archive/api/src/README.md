# API Server Architecture

This document describes the modular architecture of the Preceptoria API server.

## Overview

The API server has been refactored into focused, manageable modules that follow the Single Responsibility Principle. Each module handles a specific aspect of the application.

## Directory Structure

```
src/
├── config/
│   └── app.ts              # Application configuration and constants
├── middleware/
│   ├── index.ts            # Core middleware (CORS, Swagger, etc.)
│   ├── logging.ts          # Request/response logging
│   └── errorHandler.ts     # Global error handling
├── services/
│   ├── cron.ts             # Scheduled tasks (cron jobs)
│   └── syncService.ts      # Google Sheets synchronization
├── controllers/            # Route handlers (existing)
├── entities/               # Database entities (existing)
├── server.ts               # Main server setup
└── index.ts                # Server entry point
```

## Module Responsibilities

### Configuration (`config/app.ts`)

- **Purpose**: Centralized application configuration
- **Responsibilities**:
  - Environment variables
  - Server constants
  - CORS origins
  - Cron job patterns
- **Benefits**: Single source of truth for configuration

### Core Middleware (`middleware/index.ts`)

- **Purpose**: Essential middleware setup
- **Responsibilities**:
  - CORS configuration
  - Swagger documentation
  - Bearer token authentication
  - OpenTelemetry observability
  - Server timing
- **Benefits**: Centralized middleware management

### Logging Middleware (`middleware/logging.ts`)

- **Purpose**: Request/response logging and database context
- **Responsibilities**:
  - Database context setup
  - Request logging
  - Response transformation
  - Response logging
- **Benefits**: Consistent logging across all endpoints

### Error Handler (`middleware/errorHandler.ts`)

- **Purpose**: Global error handling
- **Responsibilities**:
  - Error classification
  - HTTP status code mapping
  - Consistent error responses
- **Benefits**: Unified error handling strategy

### Cron Service (`services/cron.ts`)

- **Purpose**: Scheduled tasks
- **Responsibilities**:
  - Google Sheets synchronization
  - Other scheduled operations
- **Benefits**: Isolated background task management

### Main Server (`server.ts`)

- **Purpose**: Application orchestration
- **Responsibilities**:
  - Module composition
  - Controller registration
  - Clean application setup
- **Benefits**: Clear separation of concerns

## Usage

### Adding New Middleware

1. Create a new file in `middleware/`
2. Export a function that takes an Elysia app and returns it
3. Import and use in `server.ts` with `.use()`

### Adding New Cron Jobs

1. Add configuration to `config/app.ts`
2. Create the job logic in `services/cron.ts`
3. The job will be automatically applied

### Adding New Configuration

1. Add to `config/app.ts`
2. Use throughout the application via imports

## Benefits of This Architecture

1. **Maintainability**: Each module has a single responsibility
2. **Testability**: Modules can be tested in isolation
3. **Reusability**: Middleware can be reused across different apps
4. **Clarity**: Clear separation of concerns
5. **Scalability**: Easy to add new features without affecting existing code
6. **Simplicity**: Direct app creation without unnecessary factory patterns

## Migration Notes

The refactoring maintains 100% backward compatibility. All existing functionality works exactly the same, but the code is now more organized and maintainable.
