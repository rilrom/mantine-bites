import type { BuilderField, FieldType } from "./fieldTypes";
import type { BuilderNode } from "./nodes";
import { type PropDef, SIZES } from "./props";

export interface FormSettings {
	submitLabel: string;
	submitAlign: "flex-start" | "center" | "flex-end" | "stretch";
	withReset: boolean;
	size: string;
	gap: string;
	validateInputOnBlur: boolean;
}

export interface FormDocument {
	nodes: BuilderNode[];
	settings: FormSettings;
}

export const DEFAULT_SETTINGS: FormSettings = {
	submitLabel: "Submit",
	submitAlign: "flex-end",
	withReset: false,
	size: "sm",
	gap: "md",
	validateInputOnBlur: false,
};

export const SETTINGS_PROPS: PropDef[] = [
	{
		name: "submitLabel",
		label: "Submit label",
		control: { type: "text" },
		default: DEFAULT_SETTINGS.submitLabel,
	},
	{
		name: "submitAlign",
		label: "Button alignment",
		control: {
			type: "segmented",
			data: [
				{ value: "flex-start", label: "Start" },
				{ value: "center", label: "Center" },
				{ value: "flex-end", label: "End" },
				{ value: "stretch", label: "Full" },
			],
		},
		default: DEFAULT_SETTINGS.submitAlign,
	},
	{
		name: "withReset",
		label: "Reset button",
		description: "Adds a button that calls form.reset()",
		control: { type: "switch" },
		default: DEFAULT_SETTINGS.withReset,
	},
	{
		name: "size",
		label: "Input size",
		description: "Applies to every input unless a field sets its own",
		control: { type: "segmented", data: SIZES },
		default: DEFAULT_SETTINGS.size,
	},
	{
		name: "gap",
		label: "Spacing between fields",
		control: { type: "segmented", data: SIZES },
		default: DEFAULT_SETTINGS.gap,
	},
	{
		name: "validateInputOnBlur",
		label: "Validate on blur",
		description: "Shows errors as soon as a field loses focus",
		control: { type: "switch" },
		default: DEFAULT_SETTINGS.validateInputOnBlur,
	},
];

function field(
	id: string,
	label: string,
	type: FieldType,
	rest: Partial<BuilderField> = {},
): BuilderField {
	return {
		kind: "field",
		id,
		label,
		type,
		options: [],
		rules: {},
		props: {},
		...rest,
	};
}

export const DEFAULT_DOCUMENT: FormDocument = {
	settings: DEFAULT_SETTINGS,
	nodes: [
		{
			kind: "content",
			id: "intro",
			type: "title",
			props: { children: "Create your account", order: 3 },
		},
		{
			kind: "fieldset",
			id: "personal",
			props: { legend: "Personal details" },
			children: [
				{
					kind: "row",
					id: "name-row",
					props: {},
					children: [
						field("title", "Title", "select", {
							options: ["Mr", "Mrs", "Miss", "Dr"],
							span: 4,
						}),
						field("first-name", "First name", "text", {
							rules: { required: true, maxLength: 80 },
						}),
						field("last-name", "Last name", "text", {
							rules: { required: true, maxLength: 100 },
						}),
					],
				},
				field("email", "Email", "email", {
					rules: { required: true, email: true },
				}),
				field("mobile-number", "Mobile number", "tel", {
					rules: { required: true, minLength: 6, maxLength: 12 },
				}),
			],
		},
		{
			kind: "content",
			id: "divider",
			type: "divider",
			props: { label: "Preferences", my: "xs" },
		},
		field("developer", "Are you a developer?", "segmented", {
			options: ["Yes", "No", "Learning"],
		}),
		field("terms", "I agree to the terms and conditions", "checkbox", {
			rules: { required: true },
		}),
	],
};
