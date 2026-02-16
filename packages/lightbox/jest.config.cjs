const path = require("node:path");

module.exports = {
	rootDir: ".",
	testEnvironment: require.resolve("jest-environment-jsdom"),
	transform: {
		"^.+\\.tsx?$": require.resolve("esbuild-jest"),
	},
	testMatch: ["**/?(*.)+(spec|test).ts?(x)"],
	setupFilesAfterEnv: [path.join(__dirname, "jsdom.mocks.cjs")],
	moduleNameMapper: {
		"\\.(css)$": require.resolve("identity-obj-proxy"),
		"^(\\.\\.?/.*)\\.js$": "$1",
	},
};
