import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
	{
		ignores: [
			"dist/**/*.ts",
			"dist/**",
			"**/*.mjs",
			"eslint.config.mjs",
			"drizzle.config.ts",
			"**/*.js",
			"infrastructure/database/migrations/**/*.ts",
		],
	},
	eslint.configs.recommended,
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	eslintConfigPrettier
);
