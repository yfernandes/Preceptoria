import { defineConfig, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";

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
import { Migrator } from "@mikro-orm/migrations";

export const localConfig = defineConfig({
	host: Bun.env.DB_HOST,
	port: Bun.env.DB_PORT,
	user: Bun.env.DB_USER,
	password: Bun.env.DB_PASS,
	dbName: Bun.env.DB_NAME,

	metadataProvider: TsMorphMetadataProvider,
	driver: PostgreSqlDriver,
	debug: true,
	verbose: true,
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
	},

	colors: true,
});
