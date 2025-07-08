import next from "@next/eslint-plugin-next";
import config from "./react-internal.js";

/** @type {import("eslint").Linter.Config} */
export default {
	...config,
	plugins: {
		...config.plugins,
		"@next/next": next,
	},
	ignores: [...config.ignores, ".next"],
	rules: {
		...config.rules,
		...next.configs.recommended.rules,
	},
};
