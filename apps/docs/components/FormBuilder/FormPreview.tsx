import { CodeHighlight } from "@mantine/code-highlight";
import {
	Alert,
	Autocomplete,
	Button,
	Checkbox,
	Chip,
	CloseButton,
	ColorInput,
	Divider,
	Fieldset,
	FileInput,
	Grid,
	Group,
	Input,
	JsonInput,
	MaskInput,
	MultiSelect,
	NativeSelect,
	NumberInput,
	Paper,
	PasswordInput,
	PinInput,
	Radio,
	Rating,
	SegmentedControl,
	Select,
	Slider,
	Space,
	Stack,
	Switch,
	TagsInput,
	Text,
	Textarea,
	TextInput,
	Title,
} from "@mantine/core";
import {
	DateInput,
	DateTimePicker,
	MonthPickerInput,
	TimePicker,
} from "@mantine/dates";
import { type UseFormReturnType, useForm } from "@mantine/form";
import { type ComponentType, type ReactNode, useMemo, useState } from "react";
import {
	type ConditionEffect,
	type ConditionScope,
	createScope,
	evaluate,
	evaluateAll,
	getActiveCondition,
	getOwnVisibility,
	getReferencedIds,
	getVisibilityConditions,
} from "./conditions";
import type { FormDocument, FormSettings } from "./defaults";
import { type BuilderField, getFieldKeys, getInitialValue } from "./fieldTypes";
import {
	type BuilderNode,
	CONTENT_TYPES,
	type ContentNode,
	flattenFields,
} from "./nodes";
import {
	describeField,
	type FieldDescription,
	type FieldLogic,
	getColSpan,
	splitTextChild,
} from "./resolve";
import { composeValidators, getValidators, type Values } from "./validation";

type AnyComponent = ComponentType<Record<string, unknown>>;

const COMPONENTS = {
	Alert,
	Autocomplete,
	Checkbox,
	"Checkbox.Group": Checkbox.Group,
	Chip,
	"Chip.Group": Chip.Group,
	ColorInput,
	DateInput,
	DateTimePicker,
	Divider,
	FileInput,
	JsonInput,
	MaskInput,
	MonthPickerInput,
	MultiSelect,
	NativeSelect,
	NumberInput,
	PasswordInput,
	PinInput,
	Radio,
	"Radio.Group": Radio.Group,
	Rating,
	SegmentedControl,
	Select,
	Slider,
	Space,
	Switch,
	"Switch.Group": Switch.Group,
	TagsInput,
	Text,
	Textarea,
	TextInput,
	TimePicker,
	Title,
} as unknown as Record<string, AnyComponent>;

function getComponent(name: string) {
	const component = COMPONENTS[name];

	if (!component) {
		throw new Error(`Form builder has no preview component for ${name}`);
	}

	return component;
}

function renderOptions({
	component,
	layout,
	items,
}: NonNullable<FieldDescription["options"]>) {
	const Option = getComponent(component);
	const Layout = layout.component === "Stack" ? Stack : Group;

	return (
		<Layout {...layout.props}>
			{items.map(({ props, text }) => (
				<Option key={String(props.value)} {...props}>
					{text}
				</Option>
			))}
		</Layout>
	);
}

interface PreviewFieldProps {
	field: BuilderField;
	fieldKey: string;
	form: UseFormReturnType<Values>;
	settings: FormSettings;
	logic?: FieldLogic;
}

export function PreviewField({
	field,
	fieldKey,
	form,
	settings,
	logic,
}: PreviewFieldProps) {
	const { component, props, wrapper, options, binding, validators } =
		describeField(field, settings, logic);
	const Component = getComponent(component);
	const inputProps = form.getInputProps(
		fieldKey,
		binding === "checkbox" ? { type: "checkbox" } : undefined,
	);
	const element = (
		<Component
			key={form.key(fieldKey)}
			{...props}
			{...inputProps}
			onChangeRaw={
				binding === "raw"
					? (value: string) =>
							form.setFieldValue(fieldKey, value, { forceUpdate: false })
					: undefined
			}
		>
			{options && renderOptions(options)}
		</Component>
	);

	if (!wrapper) {
		return element;
	}

	return (
		<Input.Wrapper
			{...wrapper}
			error={validators.length > 0 ? inputProps.error : undefined}
		>
			{element}
		</Input.Wrapper>
	);
}

export function PreviewContent({ node }: { node: ContentNode }) {
	const Component = getComponent(CONTENT_TYPES[node.type].component);
	const { text, props } = splitTextChild(node);

	return <Component {...props}>{text}</Component>;
}

interface PreviewNodesProps {
	nodes: BuilderNode[];
	scope: ConditionScope;
	values: Values;
	form: UseFormReturnType<Values>;
	settings: FormSettings;
}

function PreviewNodes({
	nodes,
	scope,
	values,
	form,
	settings,
}: PreviewNodesProps) {
	const resolve = (node: BuilderNode, effect: ConditionEffect) => {
		const condition = getActiveCondition(node, effect, scope);
		return condition ? evaluate(condition, values, scope) : undefined;
	};

	const isVisible = (node: BuilderNode) =>
		evaluateAll(getOwnVisibility(node, scope), values, scope);

	const render = (node: BuilderNode): ReactNode => {
		if (!isVisible(node)) {
			return null;
		}

		switch (node.kind) {
			case "field":
				return (
					<PreviewField
						key={node.id}
						field={node}
						fieldKey={scope.keys.get(node.id) ?? node.id}
						form={form}
						settings={settings}
						logic={{
							required: resolve(node, "required"),
							disabled: resolve(node, "disabled"),
							readOnly: resolve(node, "readOnly"),
						}}
					/>
				);
			case "content":
				return <PreviewContent key={node.id} node={node} />;
			case "row":
				return (
					<Grid key={node.id} {...node.props}>
						{node.children.filter(isVisible).map((child) => (
							<Grid.Col key={child.id} span={getColSpan(child)}>
								{render(child)}
							</Grid.Col>
						))}
					</Grid>
				);
			default:
				return (
					<Fieldset
						key={node.id}
						{...node.props}
						disabled={resolve(node, "disabled") ?? node.props.disabled === true}
					>
						<Stack gap={settings.gap}>{node.children.map(render)}</Stack>
					</Fieldset>
				);
		}
	};

	return nodes.map(render);
}

interface SubmitRowProps {
	settings: FormSettings;
	onReset?: () => void;
}

export function SubmitRow({ settings, onReset }: SubmitRowProps) {
	const stretch = settings.submitAlign === "stretch";

	return (
		<Group
			justify={stretch ? undefined : settings.submitAlign}
			grow={stretch}
			mt="md"
		>
			{settings.withReset && (
				<Button variant="default" onClick={onReset}>
					Reset
				</Button>
			)}
			<Button type="submit">{settings.submitLabel || "Submit"}</Button>
		</Group>
	);
}

interface FormPreviewProps {
	document: FormDocument;
}

export function FormPreview({ document }: FormPreviewProps) {
	const { nodes, settings } = document;
	const [submitted, setSubmitted] = useState<Values | null>(null);
	const { fields, keys, scope, visibility, watchedKeys } = useMemo(() => {
		const fields = flattenFields(nodes);
		const keys = getFieldKeys(fields);
		const scope = createScope(nodes, keys);

		return {
			fields,
			keys,
			scope,
			visibility: getVisibilityConditions(nodes, scope),
			watchedKeys: [...getReferencedIds(nodes, scope)].map(
				(id) => keys.get(id) ?? id,
			),
		};
	}, [nodes]);
	const keyOf = (field: BuilderField) => keys.get(field.id) ?? field.id;
	const isVisible = (field: BuilderField, values: Values) =>
		evaluateAll(visibility.get(field.id) ?? [], values, scope);
	const initialValues = Object.fromEntries(
		fields.map((field) => [keyOf(field), getInitialValue(field)]),
	);
	const [values, setValues] = useState<Values>(initialValues);
	const form = useForm<Values>({
		mode: "uncontrolled",
		validateInputOnBlur: settings.validateInputOnBlur,
		initialValues,
		onValuesChange: (next, previous) => {
			if (watchedKeys.some((key) => next[key] !== previous[key])) {
				setValues(next);
			}
		},
		transformValues: (submitted) =>
			settings.excludeHiddenValues
				? Object.fromEntries(
						fields
							.filter((field) => isVisible(field, submitted))
							.map((field) => [keyOf(field), submitted[keyOf(field)]]),
					)
				: submitted,
		validate: Object.fromEntries(
			fields
				.map((field) => [field, getValidators(field)] as const)
				.filter(([, validators]) => validators.length > 0)
				.map(([field, validators]) => {
					const required = getActiveCondition(field, "required", scope);

					return [
						keyOf(field),
						composeValidators(validators, {
							visible: (current) => isVisible(field, current),
							required: required
								? (current) => evaluate(required, current, scope)
								: undefined,
						}),
					];
				}),
		),
	});

	if (nodes.length === 0) {
		return (
			<Text c="dimmed" ta="center" py="xl">
				Your form will appear here once you add a field.
			</Text>
		);
	}

	return (
		<Stack>
			<form onSubmit={form.onSubmit(setSubmitted)}>
				<Stack gap={settings.gap}>
					<PreviewNodes
						nodes={nodes}
						scope={scope}
						values={values}
						form={form}
						settings={settings}
					/>
				</Stack>
				<SubmitRow settings={settings} onReset={form.reset} />
			</form>
			{submitted && (
				<Paper withBorder radius="md" p="sm">
					<Group justify="space-between" mb="xs">
						<Text size="sm" fw={500}>
							Submitted values
						</Text>
						<CloseButton
							size="sm"
							aria-label="Hide submitted values"
							onClick={() => setSubmitted(null)}
						/>
					</Group>
					<CodeHighlight
						code={JSON.stringify(submitted, null, 2)}
						language="json"
						withCopyButton={false}
					/>
				</Paper>
			)}
		</Stack>
	);
}
