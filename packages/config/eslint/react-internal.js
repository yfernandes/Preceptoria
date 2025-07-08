import prettier from "eslint-plugin-prettier/recommended";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import globals from "globals";

const configs = await import("@eslint/js").then(
	(x) => x.default.configs.recommended
);

/*
 * This is a custom ESLint configuration for use with
 * internal (bundled by their consumer) libraries
 * that utilize React.
 */

/** @type {import("eslint").Linter.Config} */
export default {
	plugins: {
		prettier,
	},
	...configs.recommended,
	...prettierRecommended,
	plugins: {
		prettier,
		react,
	},
	languageOptions: {
		parserOptions: {
			ecmaFeatures: {
				jsx: true,
			},
		},
		globals: {
			...globals.browser,
		},
	},
	rules: {
		"react/function-component-definition": "off",
		"react/jsx-filename-extension": [
			"warn",
			{
				extensions: [".jsx", ".tsx"],
			},
		],
		"react/jsx-props-no-spreading": "off",
		"react/prop-types": "off",
		"react/react-in-jsx-scope": "off",
		"react/jsx-indent": "off",
		"react/jsx-indent-props": "off",
		"react/jsx-one-expression-per-line": "off",
		"react/jsx-closing-tag-location": "off",
		"react/destructuring-assignment": "off",
		"jsx-a11y/anchor-is-valid": "off",
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
	],
};
