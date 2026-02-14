/** @type {import('stylelint').Config} */
module.exports = {
	extends: ["stylelint-config-standard-scss"],
	ignoreFiles: [
		"**/node_modules/**",
		"**/dist/**",
		"**/out/**",
		"**/storybook-static/**",
		"**/.next/**",
		"**/.astro/**",
		"**/.turbo/**",
	],
	rules: {
		"scss/at-mixin-pattern": null,
		"selector-class-pattern": [
			"^[a-z][a-zA-Z0-9]*$",
			{ message: "Expected class selector to be camelCase" },
		],
		"selector-pseudo-class-no-unknown": [
			true,
			{ ignorePseudoClasses: ["global"] },
		],
	},
};
