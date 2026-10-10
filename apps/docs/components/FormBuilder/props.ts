import { jsxString, printValue } from "./print";

export type PropValue = string | number | boolean;

export type PropValues = Record<string, PropValue>;

/** A prop computed when the form renders, printed as `{code}` in the generated source. */
export class Expression {
	constructor(readonly code: string) {}
}

/** Props handed to a rendered component, which unlike stored props can hold option lists. */
export type ElementProps = Record<
	string,
	PropValue | string[] | PropValues | Expression
>;

export type PropOption = string | { value: string; label: string };

export type PropControl =
	| { type: "text"; placeholder?: string }
	| { type: "textarea" }
	| { type: "number"; min?: number; max?: number; step?: number }
	| { type: "switch" }
	| { type: "select"; data: PropOption[] }
	| { type: "radio"; data: PropOption[] };

export interface PropDef {
	name: string;
	label: string;
	control: PropControl;
	/** Mantine's own default. A stored value equal to it is dropped so the generated code stays minimal. */
	default?: PropValue;
	description?: string;
}

export const SIZES = ["xs", "sm", "md", "lg", "xl"];

const COLORS = [
	"blue",
	"cyan",
	"teal",
	"green",
	"lime",
	"yellow",
	"orange",
	"red",
	"pink",
	"grape",
	"violet",
	"indigo",
	"gray",
	"dark",
];

const TEXT_COLORS = ["dimmed", "bright", ...COLORS];

export const sizeProp: PropDef = {
	name: "size",
	label: "Size",
	control: { type: "radio", data: SIZES },
	default: "sm",
};

export const radiusProp: PropDef = {
	name: "radius",
	label: "Radius",
	control: { type: "radio", data: SIZES },
	default: "sm",
};

export const colorProp = (fallback = "blue"): PropDef => ({
	name: "color",
	label: "Color",
	control: { type: "select", data: COLORS },
	default: fallback,
});

export const textColorProp: PropDef = {
	name: "c",
	label: "Color",
	control: { type: "select", data: TEXT_COLORS },
};

export const alignProp: PropDef = {
	name: "ta",
	label: "Alignment",
	control: { type: "radio", data: ["left", "center", "right"] },
	default: "left",
};

export const disabledProp: PropDef = {
	name: "disabled",
	label: "Disabled",
	control: { type: "switch" },
	default: false,
};

export const readOnlyProp: PropDef = {
	name: "readOnly",
	label: "Read only",
	control: { type: "switch" },
	default: false,
};

export const clearableProp: PropDef = {
	name: "clearable",
	label: "Clearable",
	control: { type: "switch" },
	default: false,
};

export const INPUT_APPEARANCE: PropDef[] = [
	sizeProp,
	radiusProp,
	{
		name: "variant",
		label: "Variant",
		control: { type: "radio", data: ["default", "filled", "unstyled"] },
		default: "default",
	},
	disabledProp,
	readOnlyProp,
];

/** Drops values equal to Mantine's default or left blank, so only meaningful props are stored. */
export function setPropValue(
	values: PropValues,
	def: PropDef,
	value: PropValue | undefined,
) {
	const next = { ...values };

	if (value === undefined || value === "" || value === def.default) {
		delete next[def.name];
	} else {
		next[def.name] = value;
	}

	return next;
}

export function pickProps(values: PropValues, defs: PropDef[]) {
	const names = new Set(defs.map((def) => def.name));

	return Object.fromEntries(
		Object.entries(values).filter(([name]) => names.has(name)),
	);
}

function printProp(name: string, value: ElementProps[string]) {
	if (value instanceof Expression) {
		return `${name}={${value.code}}`;
	}

	if (value === true) {
		return name;
	}

	if (typeof value === "string") {
		return `${name}=${jsxString(value)}`;
	}

	return `${name}={${printValue(value)}}`;
}

export function printProps(values: ElementProps) {
	return Object.entries(values).map(([name, value]) => printProp(name, value));
}
