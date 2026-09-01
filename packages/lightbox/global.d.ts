/// <reference types="@testing-library/jest-dom" />

declare module "*.module.css" {
	const classes: Record<string, string>;
	export default classes;
}

declare module "*.png" {
	const content: string;
	export default content;
}
