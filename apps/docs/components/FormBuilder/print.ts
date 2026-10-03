export const INDENT = "  ";

export const MAX_WIDTH = 80;

export function quote(value: string) {
	return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n")}'`;
}

export function jsxString(value: string) {
	return /["{}<>\\\n]/.test(value) ? `{${quote(value)}}` : `"${value}"`;
}

export function jsxText(value: string) {
	return /[{}<>\n]|^\s|\s$/.test(value) ? `{${quote(value)}}` : value;
}

export function printValue(value: unknown): string {
	if (typeof value === "string") {
		return quote(value);
	}

	if (Array.isArray(value)) {
		return `[${value.map(printValue).join(", ")}]`;
	}

	if (typeof value === "object" && value !== null) {
		const entries = Object.entries(value).map(
			([key, entry]) => `${key}: ${printValue(entry)}`,
		);

		return `{ ${entries.join(", ")} }`;
	}

	return String(value);
}

export function printImport(names: string[], source: string) {
	const single = `import { ${names.join(", ")} } from ${quote(source)};`;

	if (single.length <= MAX_WIDTH) {
		return [single];
	}

	return [
		"import {",
		...names.map((name) => `${INDENT}${name},`),
		`} from ${quote(source)};`,
	];
}

export function printElement(
	tag: string,
	props: string[],
	depth: number,
	children?: string[],
) {
	const pad = INDENT.repeat(depth);
	const open = [tag, ...props].join(" ");
	const multiline = [
		`${pad}<${tag}`,
		...props.map((p) => `${pad}${INDENT}${p}`),
	];

	if (!children) {
		const single = `${pad}<${open} />`;

		return single.length <= MAX_WIDTH ? [single] : [...multiline, `${pad}/>`];
	}

	const head = `${pad}<${open}>`;
	const headLines =
		head.length <= MAX_WIDTH ? [head] : [...multiline, `${pad}>`];

	return [...headLines, ...children, `${pad}</${tag}>`];
}
