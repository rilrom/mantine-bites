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
	excludeHiddenValues: boolean;
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
	excludeHiddenValues: true,
};

export interface SettingsSection {
	title: string;
	props: PropDef[];
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
	{
		title: "Submit button",
		props: [
			{
				name: "submitLabel",
				label: "Label",
				control: { type: "text" },
				default: DEFAULT_SETTINGS.submitLabel,
			},
			{
				name: "submitAlign",
				label: "Alignment",
				control: {
					type: "radio",
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
		],
	},
	{
		title: "Inputs",
		props: [
			{
				name: "size",
				label: "Size",
				description: "Applies to every input unless a field sets its own",
				control: { type: "radio", data: SIZES },
				default: DEFAULT_SETTINGS.size,
			},
			{
				name: "gap",
				label: "Spacing between fields",
				control: { type: "radio", data: SIZES },
				default: DEFAULT_SETTINGS.gap,
			},
		],
	},
	{
		title: "Validation",
		props: [
			{
				name: "validateInputOnBlur",
				label: "Validate on blur",
				description: "Shows errors as soon as a field loses focus",
				control: { type: "switch" },
				default: DEFAULT_SETTINGS.validateInputOnBlur,
			},
		],
	},
	{
		title: "Conditional fields",
		props: [
			{
				name: "excludeHiddenValues",
				label: "Leave hidden fields out of submitted values",
				description:
					"Hidden fields are never validated. This also drops their values on submit.",
				control: { type: "switch" },
				default: DEFAULT_SETTINGS.excludeHiddenValues,
			},
		],
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
			kind: "content",
			id: "intro-text",
			type: "text",
			props: {
				children: "It takes less than a minute. No credit card required.",
				size: "sm",
				c: "dimmed",
			},
		},
		{
			kind: "fieldset",
			id: "account",
			props: { legend: "Account" },
			children: [
				{
					kind: "row",
					id: "name-row",
					props: {},
					children: [
						field("first-name", "First name", "text", {
							rules: { required: true, maxLength: 80 },
						}),
						field("last-name", "Last name", "text", {
							rules: { required: true, maxLength: 100 },
						}),
					],
				},
				field("email", "Email", "email", {
					placeholder: "you@example.com",
					rules: { required: true, email: true },
				}),
				field("password", "Password", "password", {
					description: "At least 8 characters",
					rules: { required: true, minLength: 8 },
				}),
			],
		},
		{
			kind: "fieldset",
			id: "about",
			props: { legend: "About you" },
			children: [
				field("role", "What best describes you?", "radio", {
					options: ["Developer", "Designer", "Product manager", "Other"],
					props: { orientation: "vertical" },
					rules: { required: true },
				}),
				field("updates", "Send me product updates", "switch", {
					description: "Roughly once a month, unsubscribe any time",
				}),
			],
		},
		field("terms", "I agree to the terms and conditions", "checkbox", {
			rules: { required: true },
		}),
	],
};
