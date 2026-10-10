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
import { type ComponentType, type ReactNode, useState } from "react";
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
	getColSpan,
	splitTextChild,
} from "./resolve";
import { composeValidators, getValidators } from "./validation";

export type Values = Record<string, unknown>;

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
}

export function PreviewField({
	field,
	fieldKey,
	form,
	settings,
}: PreviewFieldProps) {
	const { component, props, wrapper, options, binding, validators } =
		describeField(field, settings);
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
	keys: Map<string, string>;
	form: UseFormReturnType<Values>;
	settings: FormSettings;
}

function PreviewNodes({ nodes, keys, form, settings }: PreviewNodesProps) {
	const render = (node: BuilderNode): ReactNode => {
		switch (node.kind) {
			case "field":
				return (
					<PreviewField
						key={node.id}
						field={node}
						fieldKey={keys.get(node.id) ?? node.id}
						form={form}
						settings={settings}
					/>
				);
			case "content":
				return <PreviewContent key={node.id} node={node} />;
			case "row":
				return (
					<Grid key={node.id} {...node.props}>
						{node.children.map((child) => (
							<Grid.Col key={child.id} span={getColSpan(child)}>
								{render(child)}
							</Grid.Col>
						))}
					</Grid>
				);
			default:
				return (
					<Fieldset key={node.id} {...node.props}>
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
	const fields = flattenFields(nodes);
	const keys = getFieldKeys(fields);
	const keyOf = (field: BuilderField) => keys.get(field.id) ?? field.id;
	const form = useForm<Values>({
		mode: "uncontrolled",
		validateInputOnBlur: settings.validateInputOnBlur,
		initialValues: Object.fromEntries(
			fields.map((field) => [keyOf(field), getInitialValue(field)]),
		),
		validate: Object.fromEntries(
			fields
				.map((field) => [keyOf(field), getValidators(field)] as const)
				.filter(([, validators]) => validators.length > 0)
				.map(([key, validators]) => [key, composeValidators(validators)]),
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
						keys={keys}
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
