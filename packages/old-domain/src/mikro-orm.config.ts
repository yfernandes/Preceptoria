import { existsSync, readFileSync } from "fs";

import { GeneratedCacheAdapter, SqliteDriver } from "@mikro-orm/sqlite";
import type { Options } from "@mikro-orm/sqlite";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { SeedManager } from "@mikro-orm/seeder";
import { Migrator } from "@mikro-orm/migrations";

// App imports
import {
	BaseEntity,
	Submission,
	Student,
	Document,
	Documentation,
} from "entities/entities";

import { ExtendedEntityRepository } from "entities/repositories";

const options: Options = {
	dbName: "db/sqlite.db",
	driver: SqliteDriver,
	entities: [BaseEntity, Submission, Document, Documentation, Student],
	entityRepository: ExtendedEntityRepository,

	allowGlobalContext: true,

	migrations: {
		path: "db/migrations",
		glob: "!(*.d).{js,ts}",
		transactional: true,
	},

	metadataCache: {
		options: { cacheDir: "./db/cache/" },
		pretty: true,
		combined: false,
	},

	// allowGlobalContext: true,
	debug: false,
	verbose: true,

	// for highlighting the SQL queries
	highlighter: new SqlHighlighter(),
	extensions: [SeedManager, Migrator],
	colors: true,
};

if (
	process.env.NODE_ENV === "production" &&
	existsSync("./temp/metadata.json")
) {
	console.log(
		"---- Since environment is in production and a temp folder exists setting metadata cache"
	);
	options.metadataCache = {
		enabled: true,
		pretty: true,
		adapter: GeneratedCacheAdapter,
		// temp/metadata.json can be generated via `npx mikro-orm-esm cache:generate --combine`
		options: {
			data: JSON.parse(
				readFileSync("./temp/metadata.json", { encoding: "utf8" })
			),
		},
	};
} else {
	console.log("---- Since not in production setting metadata provider");
	options.metadataProvider = (
		await import("@mikro-orm/reflection")
	).TsMorphMetadataProvider;
}

export default options;
