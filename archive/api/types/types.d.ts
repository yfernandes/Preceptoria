declare module "bun" {
	interface Env {
		JWT_SECRET: string;
		DB_HOST: string;
		DB_PORT: string;
		DB_USER: string;
		DB_PASS: string;
		DB_NAME: string;
		DB_URL: string;
		GOOGLE_SPREADSHEET_ID: string;
		NODE_ENV?: string;
	}
}
