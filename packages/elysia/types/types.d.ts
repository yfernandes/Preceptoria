declare module "bun" {
	interface Env {
		JWT_SECRET: string;
		DB_HOST: string;
		DB_PORT: string;
		DB_USER: string;
		DB_PASS: string;
		DB_NAME: string;
		DB_URL: string;
		TEST_DB_HOST?: string;
		TEST_DB_PORT?: string;
		TEST_DB_USER?: string;
		TEST_DB_PASS?: string;
		TEST_DB_NAME?: string;
		NODE_ENV?: string;
	}
}
