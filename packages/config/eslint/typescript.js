import { join } from "path";
import tseslint from "typescript-eslint";

export default function typescript(
	dir,
	/** @type {import("eslint").Linter.Config[]} */
	...config
) {
	return tseslint.config(
		...config,
		...tseslint.configs.recommendedTypeChecked,
		{
			settings: {
				"import/resolver": {
					typescript: {
						project: join(dir, "./tsconfig.json"),
					},
				},
			},
			rules: {
				"@typescript-eslint/no-empty-object-type": "warn",
				"@typescript-eslint/no-unused-vars": "warn",
				"@typescript-eslint/no-misused-promises": "off",
				"@typescript-eslint/no-floating-promises": "off",
				"@typescript-eslint/no-unsafe-call": "off",
				"@typescript-eslint/no-unsafe-assignment": "off",
				"prefer-const": "warn",
				"import/no-unresolved": "off",
				"import/prefer-default-export": "off",
				"import/extensions": "off",
				"consistent-return": "off",
				"prefer-template": "off",
				"arrow-body-style": "off",
			},
			languageOptions: {
				parserOptions: {
					projectService: true,
					tsconfigRootDir: dir,
					project: join(dir, "./tsconfig.lint.json"),
				},
			},
		}
	);
}
