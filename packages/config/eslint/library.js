import prettier from "eslint-plugin-prettier/recommended";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";

const configs = await import("@eslint/js").then(
	(x) => x.default.configs.recommended
);

/** @type {import("eslint").Linter.Config} */
export default {
	plugins: {
		prettier,
	},
	...configs.recommended,
	...prettierRecommended,
	languageOptions: {
		parserOptions: {
			ecmaFeatures: {
				jsx: true,
			},
		},
		globals: {
			...globals.node,
		},
	},

	ignores: [
		// Ignore dotfiles
		".*.js",
		".turbo",
		"node_modules/",
		"dist/",
		"scripts/",
		"eslint.config.js",
		"postcss.config.js",
		"tailwind.config.js",
		"vitest.config.mts",
		"coverage",
		"vitest.config.ts",
		"vitest.unit.config.ts",
		".storybook",
	],
};
