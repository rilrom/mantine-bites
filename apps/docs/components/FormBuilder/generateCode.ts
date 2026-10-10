import type { FormDocument, FormSettings } from "./defaults";
import {
	type BuilderField,
	FIELD_TYPES,
	getFieldKeys,
	getInitialValue,
} from "./fieldTypes";
import {
	type BuilderNode,
	CONTAINER_TYPES,
	CONTENT_TYPES,
	type ContentNode,
	flattenFields,
	flattenNodes,
} from "./nodes";
import {
	INDENT,
	jsxText,
	MAX_WIDTH,
	printElement,
	printImport,
	printValue,
	quote,
} from "./print";
import { printProps } from "./props";
import {
	describeField,
	type FieldDescription,
	getColSpan,
	splitTextChild,
} from "./resolve";
import { getValidators } from "./validation";

interface PrintContext {
	keys: Map<string, string>;
	settings: FormSettings;
	stackProps: string[];
}

function printOptions(
	{ component, layout, items }: NonNullable<FieldDescription["options"]>,
	depth: number,
) {
	return printElement(
		layout.component,
		printProps(layout.props),
		depth,
		items.flatMap(({ props, text }) =>
			printElement(
				component,
				printProps(props),
				depth + 1,
				text === undefined
					? undefined
					: [`${INDENT.repeat(depth + 2)}${jsxText(text)}`],
			),
		),
	);
}

function printField(field: BuilderField, depth: number, ctx: PrintContext) {
	const { component, props, wrapper, options, binding, validators } =
		describeField(field, ctx.settings);
	const key = ctx.keys.get(field.id) ?? field.id;
	const bindings = [
		`key={form.key(${quote(key)})}`,
		binding === "checkbox"
			? `{...form.getInputProps(${quote(key)}, { type: 'checkbox' })}`
			: `{...form.getInputProps(${quote(key)})}`,
	];

	if (binding === "raw") {
		bindings.push(
			`onChangeRaw={(value) => form.setFieldValue(${quote(key)}, value, { forceUpdate: false })}`,
		);
	}

	const innerDepth = wrapper ? depth + 1 : depth;
	const element = printElement(
		component,
		[...printProps(props), ...bindings],
		innerDepth,
		options ? printOptions(options, innerDepth + 1) : undefined,
	);

	if (!wrapper) {
		return element;
	}

	return printElement(
		"Input.Wrapper",
		[
			...printProps(wrapper),
			...(validators.length > 0 ? [`error={form.errors.${key}}`] : []),
		],
		depth,
		element,
	);
}

function printContent(node: ContentNode, depth: number) {
	const { text, props } = splitTextChild(node);
	const tag = CONTENT_TYPES[node.type].component;
	const printed = printProps(props);

	if (text === undefined) {
		return printElement(tag, printed, depth);
	}

	const inline = `${INDENT.repeat(depth)}<${[tag, ...printed].join(" ")}>${jsxText(text)}</${tag}>`;

	if (inline.length <= MAX_WIDTH) {
		return [inline];
	}

	return printElement(tag, printed, depth, [
		`${INDENT.repeat(depth + 1)}${jsxText(text)}`,
	]);
}

function printSpan(node: BuilderNode) {
	const { base, sm } = getColSpan(node);

	return `span={{ base: ${base}, sm: ${printValue(sm)} }}`;
}

function printNode(
	node: BuilderNode,
	depth: number,
	ctx: PrintContext,
): string[] {
	switch (node.kind) {
		case "field":
			return printField(node, depth, ctx);
		case "content":
			return printContent(node, depth);
		case "row":
			return printElement(
				"Grid",
				printProps(node.props),
				depth,
				node.children.flatMap((child) =>
					printElement(
						"Grid.Col",
						[printSpan(child)],
						depth + 1,
						printNode(child, depth + 2, ctx),
					),
				),
			);
		default:
			return printElement(
				"Fieldset",
				printProps(node.props),
				depth,
				printElement(
					"Stack",
					ctx.stackProps,
					depth + 1,
					node.children.flatMap((child) => printNode(child, depth + 2, ctx)),
				),
			);
	}
}

function rootComponent(name: string) {
	return name.split(".")[0] ?? name;
}

function getImports(nodes: BuilderNode[]) {
	const core = new Set(["Button", "Stack", "Group"]);
	const dates = new Set<string>();
	const form = new Set(["useForm"]);

	for (const node of flattenNodes(nodes)) {
		if (node.kind === "content") {
			core.add(CONTENT_TYPES[node.type].component);
			continue;
		}

		if (node.kind !== "field") {
			core.add(CONTAINER_TYPES[node.kind].component);
			continue;
		}

		const definition = FIELD_TYPES[node.type];
		const target = definition.source === "@mantine/dates" ? dates : core;
		target.add(rootComponent(definition.component));

		if (definition.wrapped) {
			core.add("Input");
		}

		for (const validator of getValidators(node)) {
			form.add(validator.name);
		}
	}

	const sort = (names: Set<string>) =>
		[...names].sort((a, b) => a.localeCompare(b));

	return [
		...printImport(sort(core), "@mantine/core"),
		...(dates.size > 0 ? printImport(sort(dates), "@mantine/dates") : []),
		...printImport(sort(form), "@mantine/form"),
	];
}

function printValidate(
	field: BuilderField,
	key: string,
	depth: number,
): string[] {
	const validators = getValidators(field);
	const pad = INDENT.repeat(depth);
	const calls = validators.map((v) => `${v.name}(${v.args})`);

	if (calls.length === 1) {
		return [`${pad}${key}: ${calls[0]},`];
	}

	return [
		`${pad}${key}: (value) =>`,
		...calls.map(
			(call, index) =>
				`${pad}${INDENT}${call}(value)${index === calls.length - 1 ? "," : " ||"}`,
		),
	];
}

function printSubmit(settings: FormSettings, depth: number) {
	const stretch = settings.submitAlign === "stretch";
	const groupProps = [
		...(stretch ? ["grow"] : [`justify="${settings.submitAlign}"`]),
		'mt="md"',
	];
	const pad = INDENT.repeat(depth + 1);
	const buttons = [
		...(settings.withReset
			? [`${pad}<Button variant="default" onClick={form.reset}>Reset</Button>`]
			: []),
		`${pad}<Button type="submit">${jsxText(settings.submitLabel || "Submit")}</Button>`,
	];

	return printElement("Group", groupProps, depth, buttons);
}

export function generateCode({ nodes, settings }: FormDocument) {
	const fields = flattenFields(nodes);
	const keys = getFieldKeys(fields);
	const keyOf = (field: BuilderField) => keys.get(field.id) ?? field.id;
	const validated = fields.filter((field) => getValidators(field).length > 0);
	const initialValues = fields.map(
		(field) =>
			`${INDENT.repeat(3)}${keyOf(field)}: ${printValue(getInitialValue(field))},`,
	);
	const validate =
		validated.length > 0
			? [
					`${INDENT.repeat(2)}validate: {`,
					...validated.flatMap((field) =>
						printValidate(field, keyOf(field), 3),
					),
					`${INDENT.repeat(2)}},`,
				]
			: [];
	const stackProps = settings.gap === "md" ? [] : [`gap="${settings.gap}"`];
	const ctx: PrintContext = { keys, settings, stackProps };

	return [
		...getImports(nodes),
		"",
		"export function Demo() {",
		`${INDENT}const form = useForm({`,
		`${INDENT.repeat(2)}mode: 'uncontrolled',`,
		...(settings.validateInputOnBlur
			? [`${INDENT.repeat(2)}validateInputOnBlur: true,`]
			: []),
		...(initialValues.length > 0
			? [
					`${INDENT.repeat(2)}initialValues: {`,
					...initialValues,
					`${INDENT.repeat(2)}},`,
				]
			: [`${INDENT.repeat(2)}initialValues: {},`]),
		...validate,
		`${INDENT}});`,
		"",
		`${INDENT}return (`,
		`${INDENT.repeat(2)}<form onSubmit={form.onSubmit((values) => console.log(values))}>`,
		...printElement(
			"Stack",
			stackProps,
			3,
			nodes.flatMap((node) => printNode(node, 4, ctx)),
		),
		...printSubmit(settings, 3),
		`${INDENT.repeat(2)}</form>`,
		`${INDENT});`,
		"}",
		"",
	].join("\n");
}
