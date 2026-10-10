import {
	type Condition,
	type ConditionScope,
	createScope,
	getActiveCondition,
	getOwnVisibility,
	getReferencedIds,
	getValueType,
	getVisibilityConditions,
	type PropEffect,
	printCondition,
	printConditions,
} from "./conditions";
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
import { Expression, printProps } from "./props";
import {
	describeField,
	type FieldDescription,
	getColSpan,
	splitTextChild,
} from "./resolve";
import { getValidators, VALIDATOR_NAMES } from "./validation";

interface PrintContext {
	keys: Map<string, string>;
	settings: FormSettings;
	stackProps: string[];
	scope: ConditionScope;
	/** Maps a field key to the variable holding its watched value. */
	watched: Map<string, string>;
}

const RESERVED_NAMES = new Set<string>([
	"form",
	"useForm",
	...VALIDATOR_NAMES,
	"break",
	"case",
	"catch",
	"class",
	"const",
	"continue",
	"debugger",
	"default",
	"delete",
	"do",
	"else",
	"enum",
	"export",
	"extends",
	"false",
	"finally",
	"for",
	"function",
	"if",
	"import",
	"in",
	"instanceof",
	"let",
	"new",
	"null",
	"return",
	"static",
	"super",
	"switch",
	"this",
	"throw",
	"true",
	"try",
	"typeof",
	"var",
	"void",
	"while",
	"with",
	"yield",
]);

function getWatchedName(key: string) {
	return RESERVED_NAMES.has(key) ? `${key}Value` : key;
}

const fromValues = (key: string) => `values.${key}`;

function printWatched(condition: Condition, ctx: PrintContext) {
	return printCondition(
		condition,
		ctx.scope,
		(key) => ctx.watched.get(key) ?? key,
	);
}

function printLogicProp(
	node: BuilderNode,
	effect: "required" | PropEffect,
	ctx: PrintContext,
) {
	const condition = getActiveCondition(node, effect, ctx.scope);

	return condition ? new Expression(printWatched(condition, ctx)) : undefined;
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
		describeField(field, ctx.settings, {
			required: printLogicProp(field, "required", ctx),
			disabled: printLogicProp(field, "disabled", ctx),
			readOnly: printLogicProp(field, "readOnly", ctx),
		});
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

function printVisible(
	node: BuilderNode,
	depth: number,
	ctx: PrintContext,
	print: (depth: number) => string[],
) {
	const conditions = getOwnVisibility(node, ctx.scope);

	if (conditions.length === 0) {
		return print(depth);
	}

	const pad = INDENT.repeat(depth);
	const guard = printConditions(
		conditions,
		ctx.scope,
		(key) => ctx.watched.get(key) ?? key,
	);

	return [
		`${pad}{${guard.includes("||") ? `(${guard})` : guard} && (`,
		...print(depth + 1),
		`${pad})}`,
	];
}

function printNode(
	node: BuilderNode,
	depth: number,
	ctx: PrintContext,
): string[] {
	return printVisible(node, depth, ctx, (inner) =>
		printBareNode(node, inner, ctx),
	);
}

function printBareNode(
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
					printVisible(child, depth + 1, ctx, (inner) =>
						printElement(
							"Grid.Col",
							[printSpan(child)],
							inner,
							printBareNode(child, inner + 1, ctx),
						),
					),
				),
			);
		default: {
			const disabled = printLogicProp(node, "disabled", ctx);

			return printElement(
				"Fieldset",
				printProps(disabled ? { ...node.props, disabled } : node.props),
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
	ctx: PrintContext,
	visibility: Condition[],
): string[] {
	const validators = getValidators(field);
	const pad = INDENT.repeat(depth);
	const required = getActiveCondition(field, "required", ctx.scope);
	const calls = validators.map((v) => `${v.name}(${v.args})`);

	if (calls.length === 1 && !required && visibility.length === 0) {
		return [`${pad}${key}: ${calls[0]},`];
	}

	const checks = validators.map((validator, index) => {
		const call = `${calls[index]}(value)`;

		if (validator.name !== "isNotEmpty" || !required) {
			return call;
		}

		const ternary = `${printCondition(required, ctx.scope, fromValues)} ? ${call} : null`;

		return validators.length === 1 ? ternary : `(${ternary})`;
	});
	const params =
		required || visibility.length > 0 ? "(value, values)" : "(value)";

	if (visibility.length === 0) {
		return [
			`${pad}${key}: ${params} =>`,
			...checks.map(
				(check, index) =>
					`${pad}${INDENT}${check}${index === checks.length - 1 ? "," : " ||"}`,
			),
		];
	}

	return [
		`${pad}${key}: ${params} =>`,
		`${pad}${INDENT}${printConditions(visibility, ctx.scope, fromValues)}`,
		...checks.map(
			(check, index) =>
				`${pad}${INDENT.repeat(2)}${index === 0 ? "? " : "  "}${check}${index === checks.length - 1 ? "" : " ||"}`,
		),
		`${pad}${INDENT.repeat(2)}: null,`,
	];
}

function printTransformValues(
	fields: BuilderField[],
	visibility: Map<string, Condition[]>,
	ctx: PrintContext,
) {
	const hidden = fields.filter((field) => visibility.has(field.id));

	if (!ctx.settings.excludeHiddenValues || hidden.length === 0) {
		return [];
	}

	return [
		`${INDENT.repeat(2)}transformValues: (values) => ({`,
		`${INDENT.repeat(3)}...values,`,
		...hidden.map((field) => {
			const key = ctx.keys.get(field.id) ?? field.id;
			const conditions = printConditions(
				visibility.get(field.id) ?? [],
				ctx.scope,
				fromValues,
			);

			return `${INDENT.repeat(3)}${key}: ${conditions} ? values.${key} : undefined,`;
		}),
		`${INDENT.repeat(2)}}),`,
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
	const scope = createScope(nodes, keys);
	const referenced = getReferencedIds(nodes, scope);
	const watched = new Map(
		fields
			.filter((field) => referenced.has(field.id))
			.map((field) => [keyOf(field), getWatchedName(keyOf(field))]),
	);
	const visibility = getVisibilityConditions(nodes, scope);
	const stackProps = settings.gap === "md" ? [] : [`gap="${settings.gap}"`];
	const ctx: PrintContext = { keys, settings, stackProps, scope, watched };
	const validated = fields.filter((field) => getValidators(field).length > 0);
	const initialValues = fields.map((field) => {
		const type = referenced.has(field.id) ? getValueType(field) : null;
		const value = printValue(getInitialValue(field));

		return `${INDENT.repeat(3)}${keyOf(field)}: ${type ? `${value} as ${type}` : value},`;
	});
	const validate =
		validated.length > 0
			? [
					`${INDENT.repeat(2)}validate: {`,
					...validated.flatMap((field) =>
						printValidate(
							field,
							keyOf(field),
							3,
							ctx,
							visibility.get(field.id) ?? [],
						),
					),
					`${INDENT.repeat(2)}},`,
				]
			: [];
	const watches = [...watched].map(
		([key, name]) =>
			`${INDENT}const ${name} = form.useWatchValue(${quote(key)});`,
	);

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
		...printTransformValues(fields, visibility, ctx),
		`${INDENT}});`,
		"",
		...(watches.length > 0 ? [...watches, ""] : []),
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
