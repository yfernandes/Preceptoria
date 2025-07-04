import { defineConfig, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { Migrator } from "@mikro-orm/migrations";

import {
	BaseEntity,
	Document,
	Classes,
	Course,
	Hospital,
	HospitalManager,
	OrgAdmin,
	Organization,
	Preceptor,
	Role,
	School,
	Shift,
	Student,
	Supervisor,
	SysAdmin,
	User,
} from "./entities";

// Base configuration shared across all environments
const baseConfig = {
	metadataProvider: TsMorphMetadataProvider,
	driver: PostgreSqlDriver,
	strict: true,
	
	entities: [
		BaseEntity,
		User,
		SysAdmin,
		OrgAdmin,
		Supervisor,
		HospitalManager,
		Preceptor,
		Student,
		School,
		Course,
		Classes,
		Shift,
		Document,
		Role,
		Hospital,
		Organization,
	],

	extensions: [Migrator],
	migrations: {
		path: "dist/migrations",
		pathTs: "src/migrations",
		tableName: "mikro_orm_migrations",
		transactional: true,
		disableForeignKeys: false,
		allOrNothing: true,
		dropTables: false,
		safe: true,
		emit: "ts" as const,
	},

	// Connection pooling configuration
	pool: {
		min: 2,
		max: 10,
		acquireTimeoutMillis: 30000,
		createTimeoutMillis: 30000,
		destroyTimeoutMillis: 5000,
		idleTimeoutMillis: 30000,
		reapIntervalMillis: 1000,
		createRetryIntervalMillis: 200,
	},

	// Query optimization
	discovery: {
		warnWhenNoEntities: false,
		requireEntitiesArray: true,
		alwaysAnalyseProperties: false,
	},

	// Performance optimizations
	debug: false,
	verbose: false,
	colors: true,
	
	// Schema validation
	validateRequired: true,
	validate: true,
};

// Development configuration
export const devConfig = defineConfig({
	...baseConfig,
	host: Bun.env.DB_HOST || "localhost",
	port: Bun.env.DB_PORT ? parseInt(Bun.env.DB_PORT) : 5432,
	user: Bun.env.DB_USER || "postgres",
	password: Bun.env.DB_PASS || "postgres",
	dbName: Bun.env.DB_NAME || "preceptoria_dev",
	
	debug: true,
	verbose: true,
	
	// Development-specific settings
	discovery: {
		...baseConfig.discovery,
		warnWhenNoEntities: true,
	},
});

// Production configuration
export const prodConfig = defineConfig({
	...baseConfig,
	host: Bun.env.DB_HOST,
	port: Bun.env.DB_PORT ? parseInt(Bun.env.DB_PORT) : 5432,
	user: Bun.env.DB_USER,
	password: Bun.env.DB_PASS,
	dbName: Bun.env.DB_NAME,
	
	// Production-specific settings
	debug: false,
	verbose: false,
	
	// Enhanced connection pooling for production
	pool: {
		...baseConfig.pool,
		min: 5,
		max: 20,
	},
	
	// Disable schema validation in production for performance
	validate: false,
});

// Test configuration
export const testConfig = defineConfig({
	...baseConfig,
	host: Bun.env.TEST_DB_HOST || "localhost",
	port: Bun.env.TEST_DB_PORT ? parseInt(Bun.env.TEST_DB_PORT) : 5432,
	user: Bun.env.TEST_DB_USER || "postgres",
	password: Bun.env.TEST_DB_PASS || "postgres",
	dbName: Bun.env.TEST_DB_NAME || "preceptoria_test",
	
	// Test-specific settings
	debug: false,
	verbose: false,
	
	// Minimal pooling for tests
	pool: {
		...baseConfig.pool,
		min: 1,
		max: 5,
	},
	
	// Allow dropping tables in test environment
	migrations: {
		...baseConfig.migrations,
		dropTables: true,
		safe: false,
	},
	
	// Disable validation in tests for speed
	validate: false,
	validateRequired: false,
});

// Default configuration based on environment
const getConfig = () => {
	const nodeEnv = Bun.env.NODE_ENV || "development";
	
	switch (nodeEnv) {
		case "production":
			return prodConfig;
		case "test":
			return testConfig;
		case "development":
		default:
			return devConfig;
	}
};

// Export the appropriate config for the current environment
export const localConfig = getConfig();

// Export all configs for testing purposes
export const configs = {
	development: devConfig,
	production: prodConfig,
	test: testConfig,
};
