import { lowerFirst, upperFirst } from "@mantine/hooks";
import {
	clearableProp,
	colorProp,
	disabledProp,
	INPUT_APPEARANCE,
	type PropDef,
	type PropValues,
	radiusProp,
	readOnlyProp,
	sizeProp,
} from "./props";

export type FieldType =
	| "text"
	| "email"
	| "password"
	| "tel"
	| "url"
	| "textarea"
	| "json"
	| "number"
	| "slider"
	| "rating"
	| "pin"
	| "select"
	| "multiselect"
	| "autocomplete"
	| "tags"
	| "nativeselect"
	| "segmented"
	| "radio"
	| "chips"
	| "multichips"
	| "checkbox"
	| "checkboxgroup"
	| "switch"
	| "switchgroup"
	| "color"
	| "file"
	| "date"
	| "datetime"
	| "time"
	| "month";

export type RuleName =
	| "required"
	| "email"
	| "minLength"
	| "maxLength"
	| "min"
	| "max"
	| "pattern";

export interface FieldRules {
	required?: boolean;
	email?: boolean;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
	pattern?: string;
}

export interface BuilderField {
	kind: "field";
	id: string;
	label: string;
	type: FieldType;
	options: string[];
	rules: FieldRules;
	props: PropValues;
	placeholder?: string;
	description?: string;
	/** Column span out of 12, only read when the field sits in a row. */
	span?: number;
}

export type FieldGroup = "Text" | "Number" | "Choice" | "Dates" | "Other";

/** How options become markup. `data` passes them as a prop, otherwise each one renders as a child component that also receives the field's props. */
export type OptionsRender =
	| "data"
	| {
			component: string;
			/** Whether the option text goes on a `label` prop or between the tags. */
			labelAs: "prop" | "children";
			/** Props for the `Group` that lays the options out horizontally. */
			groupProps: PropValues;
	  };

interface FieldTypeDefinition {
	label: string;
	group: FieldGroup;
	component: string;
	source: "@mantine/core" | "@mantine/dates";
	options?: OptionsRender;
	rules: RuleName[];
	props: PropDef[];
	initialValue: (field: BuilderField) => unknown;
	/** Returning `undefined` means the component has no placeholder. */
	placeholder?: (field: BuilderField) => string | undefined;
	inputType?: "email" | "tel" | "url";
	/** Label and description go on an `Input.Wrapper` because the component has no label of its own. */
	wrapped?: boolean;
	checkbox?: boolean;
	/** Props computed from the field rather than stored. */
	derivedProps?: (field: BuilderField) => PropValues;
	/** Props that stay on the component itself when the field's own props are passed to each option instead. */
	componentProps?: PropValues;
}

const TEXT_RULES: RuleName[] = [
	"required",
	"minLength",
	"maxLength",
	"pattern",
];

const labelPlaceholder = (field: BuilderField) => field.label;
const empty = () => "";
const nothing = () => null;
const firstOption = (field: BuilderField) => field.options[0] ?? "";

const textareaProps: PropDef[] = [
	{
		name: "autosize",
		label: "Grow with content",
		control: { type: "switch" },
		default: false,
	},
	{
		name: "minRows",
		label: "Min rows",
		control: { type: "number", min: 1 },
	},
	{
		name: "maxRows",
		label: "Max rows",
		control: { type: "number", min: 1 },
	},
];

const comboboxProps: PropDef[] = [
	{
		name: "searchable",
		label: "Searchable",
		control: { type: "switch" },
		default: false,
	},
	clearableProp,
];

const dateProps: PropDef[] = [
	clearableProp,
	{
		name: "valueFormat",
		label: "Display format",
		control: { type: "text", placeholder: "DD MMM YYYY" },
	},
];

const groupedChoiceProps: PropDef[] = [sizeProp, colorProp(), disabledProp];

/** Read by `describeField` to pick the options layout, never passed to a component. */
export const orientationProp: PropDef = {
	name: "orientation",
	label: "Orientation",
	control: { type: "segmented", data: ["horizontal", "vertical"] },
	default: "horizontal",
};

const chipProps: PropDef[] = [
	{
		name: "variant",
		label: "Variant",
		control: { type: "segmented", data: ["filled", "outline", "light"] },
		default: "filled",
	},
	orientationProp,
	...groupedChoiceProps,
];

export const FIELD_TYPES: Record<FieldType, FieldTypeDefinition> = {
	text: {
		label: "Text",
		group: "Text",
		component: "TextInput",
		source: "@mantine/core",
		rules: TEXT_RULES,
		props: INPUT_APPEARANCE,
		initialValue: empty,
		placeholder: labelPlaceholder,
	},
	email: {
		label: "Email",
		group: "Text",
		component: "TextInput",
		source: "@mantine/core",
		rules: ["required", "email", "minLength", "maxLength", "pattern"],
		props: INPUT_APPEARANCE,
		initialValue: empty,
		placeholder: labelPlaceholder,
		inputType: "email",
	},
	password: {
		label: "Password",
		group: "Text",
		component: "PasswordInput",
		source: "@mantine/core",
		rules: TEXT_RULES,
		props: INPUT_APPEARANCE,
		initialValue: empty,
		placeholder: labelPlaceholder,
	},
	tel: {
		label: "Tel",
		group: "Text",
		component: "TextInput",
		source: "@mantine/core",
		rules: TEXT_RULES,
		props: INPUT_APPEARANCE,
		initialValue: empty,
		placeholder: labelPlaceholder,
		inputType: "tel",
	},
	url: {
		label: "URL",
		group: "Text",
		component: "TextInput",
		source: "@mantine/core",
		rules: TEXT_RULES,
		props: INPUT_APPEARANCE,
		initialValue: empty,
		placeholder: labelPlaceholder,
		inputType: "url",
	},
	textarea: {
		label: "Textarea",
		group: "Text",
		component: "Textarea",
		source: "@mantine/core",
		rules: TEXT_RULES,
		props: [...textareaProps, ...INPUT_APPEARANCE],
		initialValue: empty,
		placeholder: labelPlaceholder,
	},
	json: {
		label: "JSON",
		group: "Text",
		component: "JsonInput",
		source: "@mantine/core",
		rules: ["required"],
		props: [
			{
				name: "formatOnBlur",
				label: "Format on blur",
				control: { type: "switch" },
				default: false,
			},
			...textareaProps,
			...INPUT_APPEARANCE,
		],
		initialValue: empty,
		placeholder: () => '{ "key": "value" }',
	},
	number: {
		label: "Number",
		group: "Number",
		component: "NumberInput",
		source: "@mantine/core",
		rules: ["required", "min", "max"],
		props: [
			{ name: "prefix", label: "Prefix", control: { type: "text" } },
			{ name: "suffix", label: "Suffix", control: { type: "text" } },
			{ name: "step", label: "Step", control: { type: "number" }, default: 1 },
			{
				name: "thousandSeparator",
				label: "Thousand separator",
				control: { type: "switch" },
				default: false,
			},
			...INPUT_APPEARANCE,
		],
		initialValue: empty,
		placeholder: labelPlaceholder,
	},
	slider: {
		label: "Slider",
		group: "Number",
		component: "Slider",
		source: "@mantine/core",
		rules: [],
		props: [
			{ name: "min", label: "Min", control: { type: "number" }, default: 0 },
			{ name: "max", label: "Max", control: { type: "number" }, default: 100 },
			{ name: "step", label: "Step", control: { type: "number" }, default: 1 },
			{
				name: "labelAlwaysOn",
				label: "Always show value",
				control: { type: "switch" },
				default: false,
			},
			sizeProp,
			colorProp(),
			disabledProp,
		],
		initialValue: (field) => field.props.min ?? 0,
		wrapped: true,
	},
	rating: {
		label: "Rating",
		group: "Number",
		component: "Rating",
		source: "@mantine/core",
		rules: ["min", "max"],
		props: [
			{
				name: "count",
				label: "Stars",
				control: { type: "number", min: 1, max: 10 },
				default: 5,
			},
			{
				name: "fractions",
				label: "Fractions per star",
				control: { type: "number", min: 1, max: 4 },
				default: 1,
			},
			sizeProp,
			colorProp("yellow"),
			readOnlyProp,
		],
		initialValue: () => 0,
		wrapped: true,
	},
	pin: {
		label: "PIN",
		group: "Number",
		component: "PinInput",
		source: "@mantine/core",
		rules: ["required"],
		props: [
			{
				name: "length",
				label: "Length",
				control: { type: "number", min: 1, max: 8 },
				default: 4,
			},
			{
				name: "type",
				label: "Characters",
				control: { type: "segmented", data: ["alphanumeric", "number"] },
				default: "alphanumeric",
			},
			{
				name: "mask",
				label: "Mask characters",
				control: { type: "switch" },
				default: false,
			},
			sizeProp,
			radiusProp,
			disabledProp,
		],
		initialValue: empty,
		wrapped: true,
	},
	select: {
		label: "Select",
		group: "Choice",
		component: "Select",
		source: "@mantine/core",
		options: "data",
		rules: ["required"],
		props: [...comboboxProps, ...INPUT_APPEARANCE],
		initialValue: nothing,
		placeholder: () => "Pick value",
	},
	multiselect: {
		label: "Multi select",
		group: "Choice",
		component: "MultiSelect",
		source: "@mantine/core",
		options: "data",
		rules: ["required"],
		props: [
			...comboboxProps,
			{
				name: "hidePickedOptions",
				label: "Hide picked options",
				control: { type: "switch" },
				default: false,
			},
			{
				name: "maxValues",
				label: "Max values",
				control: { type: "number", min: 1 },
			},
			...INPUT_APPEARANCE,
		],
		initialValue: () => [],
		placeholder: () => "Pick values",
	},
	autocomplete: {
		label: "Autocomplete",
		group: "Choice",
		component: "Autocomplete",
		source: "@mantine/core",
		options: "data",
		rules: TEXT_RULES,
		props: [clearableProp, ...INPUT_APPEARANCE],
		initialValue: empty,
		placeholder: labelPlaceholder,
	},
	tags: {
		label: "Tags",
		group: "Choice",
		component: "TagsInput",
		source: "@mantine/core",
		options: "data",
		rules: ["required"],
		props: [
			clearableProp,
			{
				name: "maxTags",
				label: "Max tags",
				control: { type: "number", min: 1 },
			},
			...INPUT_APPEARANCE,
		],
		initialValue: () => [],
		placeholder: () => "Enter tags",
	},
	nativeselect: {
		label: "Native select",
		group: "Choice",
		component: "NativeSelect",
		source: "@mantine/core",
		options: "data",
		rules: [],
		props: INPUT_APPEARANCE.filter((prop) => prop.name !== "readOnly"),
		initialValue: firstOption,
	},
	segmented: {
		label: "Segmented",
		group: "Choice",
		component: "SegmentedControl",
		source: "@mantine/core",
		options: "data",
		rules: [],
		props: [
			{
				name: "fullWidth",
				label: "Full width",
				control: { type: "switch" },
				default: false,
			},
			sizeProp,
			radiusProp,
			colorProp(),
			disabledProp,
		],
		initialValue: firstOption,
		wrapped: true,
		// SegmentedControl is inline-flex, so without this it sits beside the wrapper's inline-block label.
		derivedProps: (field): PropValues =>
			field.props.fullWidth ? {} : { display: "flex", w: "fit-content" },
	},
	radio: {
		label: "Radio",
		group: "Choice",
		component: "Radio.Group",
		source: "@mantine/core",
		options: {
			component: "Radio",
			labelAs: "prop",
			groupProps: { mt: "xs" },
		},
		rules: ["required"],
		props: [orientationProp, ...groupedChoiceProps],
		initialValue: empty,
	},
	chips: {
		label: "Chips",
		group: "Choice",
		component: "Chip.Group",
		source: "@mantine/core",
		options: {
			component: "Chip",
			labelAs: "children",
			groupProps: { gap: "xs", mt: "xs" },
		},
		rules: ["required"],
		props: chipProps,
		initialValue: nothing,
		wrapped: true,
	},
	multichips: {
		label: "Multi chips",
		group: "Choice",
		component: "Chip.Group",
		source: "@mantine/core",
		options: {
			component: "Chip",
			labelAs: "children",
			groupProps: { gap: "xs", mt: "xs" },
		},
		rules: ["required"],
		props: chipProps,
		initialValue: () => [],
		wrapped: true,
		componentProps: { multiple: true },
	},
	checkbox: {
		label: "Checkbox",
		group: "Choice",
		component: "Checkbox",
		source: "@mantine/core",
		rules: ["required"],
		props: [...groupedChoiceProps, radiusProp],
		initialValue: () => false,
		checkbox: true,
	},
	checkboxgroup: {
		label: "Checkbox group",
		group: "Choice",
		component: "Checkbox.Group",
		source: "@mantine/core",
		options: {
			component: "Checkbox",
			labelAs: "prop",
			groupProps: { mt: "xs" },
		},
		rules: ["required"],
		props: [orientationProp, ...groupedChoiceProps, radiusProp],
		initialValue: () => [],
	},
	switch: {
		label: "Switch",
		group: "Choice",
		component: "Switch",
		source: "@mantine/core",
		rules: ["required"],
		props: [...groupedChoiceProps, radiusProp],
		initialValue: () => false,
		checkbox: true,
	},
	switchgroup: {
		label: "Switch group",
		group: "Choice",
		component: "Switch.Group",
		source: "@mantine/core",
		options: {
			component: "Switch",
			labelAs: "prop",
			groupProps: { mt: "xs" },
		},
		rules: ["required"],
		props: [orientationProp, ...groupedChoiceProps, radiusProp],
		initialValue: () => [],
	},
	color: {
		label: "Color",
		group: "Other",
		component: "ColorInput",
		source: "@mantine/core",
		rules: ["required"],
		props: [
			{
				name: "format",
				label: "Format",
				control: {
					type: "select",
					data: ["hex", "hexa", "rgb", "rgba", "hsl", "hsla"],
				},
				default: "hex",
			},
			...INPUT_APPEARANCE,
		],
		initialValue: empty,
		placeholder: () => "Pick color",
	},
	file: {
		label: "File",
		group: "Other",
		component: "FileInput",
		source: "@mantine/core",
		rules: ["required"],
		props: [
			{
				name: "accept",
				label: "Accepted types",
				control: { type: "text", placeholder: "image/png,image/jpeg" },
			},
			clearableProp,
			...INPUT_APPEARANCE,
		],
		initialValue: nothing,
		placeholder: () => "Pick file",
	},
	date: {
		label: "Date",
		group: "Dates",
		component: "DateInput",
		source: "@mantine/dates",
		rules: ["required"],
		props: [...dateProps, ...INPUT_APPEARANCE],
		initialValue: nothing,
		placeholder: () => "Pick date",
	},
	datetime: {
		label: "Date and time",
		group: "Dates",
		component: "DateTimePicker",
		source: "@mantine/dates",
		rules: ["required"],
		props: [...dateProps, ...INPUT_APPEARANCE],
		initialValue: nothing,
		placeholder: () => "Pick date and time",
	},
	time: {
		label: "Time",
		group: "Dates",
		component: "TimePicker",
		source: "@mantine/dates",
		rules: ["required"],
		props: [
			{
				name: "format",
				label: "Format",
				control: { type: "segmented", data: ["24h", "12h"] },
				default: "24h",
			},
			{
				name: "withSeconds",
				label: "With seconds",
				control: { type: "switch" },
				default: false,
			},
			clearableProp,
			...INPUT_APPEARANCE,
		],
		initialValue: empty,
	},
	month: {
		label: "Month",
		group: "Dates",
		component: "MonthPickerInput",
		source: "@mantine/dates",
		rules: ["required"],
		props: [clearableProp, ...INPUT_APPEARANCE],
		initialValue: nothing,
		placeholder: () => "Pick month",
	},
};

export const FIELD_GROUPS: FieldGroup[] = [
	"Text",
	"Number",
	"Choice",
	"Dates",
	"Other",
];

export const FIELD_TYPES_BY_GROUP = Object.fromEntries(
	FIELD_GROUPS.map((group) => [
		group,
		(Object.keys(FIELD_TYPES) as FieldType[]).filter(
			(type) => FIELD_TYPES[type].group === group,
		),
	]),
) as Record<FieldGroup, FieldType[]>;

export function hasOptions(type: FieldType) {
	return FIELD_TYPES[type].options !== undefined;
}

function toFieldKey(label: string) {
	const words = label
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.split(/[^A-Za-z0-9]+/)
		.filter(Boolean);

	const key = words
		.map((word, index) => (index === 0 ? lowerFirst(word) : upperFirst(word)))
		.join("");

	if (!key) {
		return "field";
	}

	if (/^\d/.test(key)) {
		return `field${key}`;
	}

	return key;
}

export function getInitialValue(field: BuilderField): unknown {
	return FIELD_TYPES[field.type].initialValue(field);
}

export function getDefaultPlaceholder(field: BuilderField) {
	return FIELD_TYPES[field.type].placeholder?.(field);
}

export function supportsPlaceholder(type: FieldType) {
	return FIELD_TYPES[type].placeholder !== undefined;
}

export function getPlaceholder(field: BuilderField) {
	if (!supportsPlaceholder(field.type)) {
		return undefined;
	}

	return field.placeholder || getDefaultPlaceholder(field);
}

/** Labels that normalize to the same key get a numeric suffix so every form value stays distinct. */
export function getFieldKeys(fields: BuilderField[]) {
	const keys = new Map<string, string>();
	const used = new Set<string>();

	for (const field of fields) {
		const base = toFieldKey(field.label);
		let key = base;
		let suffix = 2;

		while (used.has(key)) {
			key = `${base}${suffix}`;
			suffix += 1;
		}

		used.add(key);
		keys.set(field.id, key);
	}

	return keys;
}

export function usesDates(fields: BuilderField[]) {
	return fields.some(
		(field) => FIELD_TYPES[field.type].source === "@mantine/dates",
	);
}

export function getDefaultOptions(type: FieldType) {
	return hasOptions(type) ? ["Option 1", "Option 2"] : [];
}

export function isCheckboxLike(field: BuilderField) {
	return Boolean(FIELD_TYPES[field.type].checkbox);
}
