import {
	NumberInput,
	type NumberInputProps,
	Select,
	SimpleGrid,
	Stack,
	Switch,
	TagsInput,
	Text,
	TextInput,
} from "@mantine/core";
import type { ReactNode } from "react";
import { ConditionEditor } from "./ConditionEditor";
import {
	type ConditionScope,
	getStaticPropDefs,
	setCondition,
} from "./conditions";
import classes from "./FormBuilder.module.css";
import {
	type BuilderField,
	FIELD_TYPES,
	type FieldRules,
	getDefaultPlaceholder,
	hasOptions,
	isCheckboxLike,
	supportsPlaceholder,
} from "./fieldTypes";
import { type LeafNode, SPANS } from "./nodes";
import { PropControls, type PropControlsProps } from "./PropControls";
import {
	type PropDef,
	type PropValue,
	setPropValue,
	splitToggles,
} from "./props";
import { isValidPattern } from "./validation";

interface SectionProps {
	title: string;
	children: ReactNode;
}

export function Section({ title, children }: SectionProps) {
	return (
		<Stack gap="md" pt="lg" className={classes.section}>
			<Text fw={600} c="bright">
				{title}
			</Text>
			{children}
		</Stack>
	);
}

interface PropSectionProps extends PropControlsProps {
	title: string;
}

export function PropSection({
	title,
	defs,
	values,
	onChange,
}: PropSectionProps) {
	if (defs.length === 0) {
		return null;
	}

	return (
		<Section title={title}>
			<PropControls defs={defs} values={values} onChange={onChange} />
		</Section>
	);
}

const SPAN_OPTIONS = [
	{ value: "auto", label: "Equal share" },
	...SPANS.map((span) => ({ value: String(span), label: `${span} of 12` })),
];

interface SpanSelectProps {
	node: LeafNode;
	label?: string;
	onChange: (node: LeafNode) => void;
}

export function SpanSelect({
	node,
	label = "Column width",
	onChange,
}: SpanSelectProps) {
	return (
		<Select
			label={label}
			description="Rows stack into a single column on small screens"
			data={SPAN_OPTIONS}
			allowDeselect={false}
			value={node.span === undefined ? "auto" : String(node.span)}
			onChange={(value) =>
				onChange({
					...node,
					span: !value || value === "auto" ? undefined : Number(value),
				})
			}
		/>
	);
}

function toRuleNumber(value: number | string) {
	return typeof value === "number" ? value : undefined;
}

function isInverted(min: number | undefined, max: number | undefined) {
	return min !== undefined && max !== undefined && min > max;
}

interface FieldInspectorProps {
	field: BuilderField;
	autoFocusLabel: boolean;
	inRow: boolean;
	scope: ConditionScope;
	onChange: (field: BuilderField) => void;
}

export function FieldInspector({
	field,
	autoFocusLabel,
	inRow,
	scope,
	onChange,
}: FieldInspectorProps) {
	const definition = FIELD_TYPES[field.type];
	const rules = new Set(definition.rules);

	const update = (patch: Partial<BuilderField>) =>
		onChange({ ...field, ...patch });

	const setRule = <K extends keyof FieldRules>(
		name: K,
		value: FieldRules[K],
	) => {
		const next = { ...field.rules };

		if (value === undefined || value === false || value === "") {
			delete next[name];
		} else {
			next[name] = value;
		}

		if (name === "required" && !next.required) {
			onChange(
				setCondition(
					{ ...field, rules: next },
					"required",
					null,
				) as BuilderField,
			);
			return;
		}

		update({ rules: next });
	};

	const renderRange = (
		[minRule, maxRule]: ["min", "max"] | ["minLength", "maxLength"],
		suffix: string,
		props: NumberInputProps = {},
	) => (
		<SimpleGrid cols={2}>
			<NumberInput
				{...props}
				label={`Min${suffix}`}
				value={field.rules[minRule] ?? ""}
				onChange={(value) => setRule(minRule, toRuleNumber(value))}
			/>
			<NumberInput
				{...props}
				label={`Max${suffix}`}
				value={field.rules[maxRule] ?? ""}
				error={
					isInverted(field.rules[minRule], field.rules[maxRule])
						? `Must be greater than min${suffix}`
						: undefined
				}
				onChange={(value) => setRule(maxRule, toRuleNumber(value))}
			/>
		</SimpleGrid>
	);

	const { props, toggles } = splitToggles(
		getStaticPropDefs(field, definition.props),
	);
	const setProp = (def: PropDef, value: PropValue | undefined) =>
		update({ props: setPropValue(field.props, def, value) });

	return (
		<Stack gap="lg">
			<Section title="Field">
				<TextInput
					label="Label"
					value={field.label}
					autoFocus={autoFocusLabel}
					onFocus={(event) => autoFocusLabel && event.currentTarget.select()}
					error={field.label.trim() ? undefined : "Label is required"}
					onChange={(event) => update({ label: event.currentTarget.value })}
				/>
				{supportsPlaceholder(field.type) && (
					<TextInput
						label="Placeholder"
						value={field.placeholder ?? ""}
						placeholder={getDefaultPlaceholder(field)}
						onChange={(event) =>
							update({ placeholder: event.currentTarget.value || undefined })
						}
					/>
				)}
				<TextInput
					label="Description"
					placeholder="Optional help text below the label"
					value={field.description ?? ""}
					onChange={(event) =>
						update({ description: event.currentTarget.value || undefined })
					}
				/>
			</Section>

			{hasOptions(field.type) && (
				<Section title="Options">
					<TagsInput
						aria-label="Options"
						value={field.options}
						splitChars={[",", ";"]}
						description="Press Enter or comma after each option"
						error={
							field.options.length === 0 ? "Add at least one option" : undefined
						}
						clearable
						onChange={(options) => update({ options })}
					/>
				</Section>
			)}

			<PropSection
				title="Props"
				defs={props}
				values={field.props}
				onChange={setProp}
			/>

			{inRow && (
				<Section title="Layout">
					<SpanSelect
						node={field}
						onChange={(next) => onChange(next as BuilderField)}
					/>
				</Section>
			)}

			<PropSection
				title="Toggles"
				defs={toggles}
				values={field.props}
				onChange={setProp}
			/>

			{rules.size > 0 && (
				<Section title="Validation">
					{rules.has("required") && (
						<Switch
							label="Required"
							description={
								field.conditions?.required
									? "Only while the Require when condition below matches"
									: isCheckboxLike(field)
										? "Must be checked to submit"
										: "Shows an asterisk and blocks empty submissions"
							}
							checked={Boolean(field.rules.required)}
							onChange={(event) =>
								setRule("required", event.currentTarget.checked)
							}
						/>
					)}
					{rules.has("email") && (
						<Switch
							label="Valid email"
							description="Checks the value looks like an email address"
							checked={Boolean(field.rules.email)}
							onChange={(event) =>
								setRule("email", event.currentTarget.checked)
							}
						/>
					)}
					{rules.has("minLength") &&
						renderRange(["minLength", "maxLength"], " length", {
							min: 0,
							allowDecimal: false,
						})}
					{rules.has("min") && renderRange(["min", "max"], "")}
					{rules.has("pattern") && (
						<TextInput
							label="Pattern"
							description="Regular expression without the surrounding slashes"
							placeholder="^[A-Z]{2}\d{4}$"
							styles={{
								input: { fontFamily: "var(--mantine-font-family-monospace)" },
							}}
							value={field.rules.pattern ?? ""}
							error={
								field.rules.pattern && !isValidPattern(field.rules.pattern)
									? "Invalid regular expression, it will be left out of the code"
									: undefined
							}
							onChange={(event) =>
								setRule("pattern", event.currentTarget.value)
							}
						/>
					)}
				</Section>
			)}

			<ConditionEditor
				node={field}
				scope={scope}
				onChange={(next) => onChange(next as BuilderField)}
			/>
		</Stack>
	);
}
