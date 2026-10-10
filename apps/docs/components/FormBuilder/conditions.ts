import {
	type BuilderField,
	FIELD_TYPES,
	getInitialValue,
	type ValueKind,
} from "./fieldTypes";
import {
	type BuilderNode,
	flattenFields,
	flattenNodes,
	getNodeLabel,
	isContainer,
} from "./nodes";
import { printValue } from "./print";
import type { PropDef } from "./props";

export type ConditionEffect = "visible" | "hidden" | "required" | PropEffect;

/** Effects that drive a boolean prop of the same name, replacing its static toggle. */
export type PropEffect = "disabled" | "readOnly";

const PROP_EFFECTS: ConditionEffect[] = ["disabled", "readOnly"];

function isPropEffect(effect: ConditionEffect): effect is PropEffect {
	return PROP_EFFECTS.includes(effect);
}

export type Operator =
	| "equals"
	| "notEquals"
	| "greaterThan"
	| "lessThan"
	| "includes"
	| "excludes"
	| "isEmpty"
	| "isNotEmpty"
	| "isChecked"
	| "isNotChecked";

export type ClauseValue = string | number;

export interface Clause {
	fieldId: string;
	operator: Operator;
	value?: ClauseValue;
}

export interface Condition {
	match: "all" | "any";
	clauses: Clause[];
	/** Set by `getOwnVisibility` for hide conditions and never stored on a node. */
	negate?: boolean;
}

export type NodeConditions = Partial<Record<ConditionEffect, Condition>>;

interface OperatorDefinition {
	label: string;
	kinds: ValueKind[];
	takesValue: boolean;
	test: (
		value: unknown,
		target: ClauseValue | undefined,
		kind: ValueKind,
	) => boolean;
	/** Prints the same test as `test`, so the preview and the generated code agree. */
	print: (accessor: string, target: string, field: BuilderField) => string;
}

function isEmptyValue(value: unknown, kind: ValueKind) {
	if (kind === "list") {
		return !Array.isArray(value) || value.length === 0;
	}

	if (kind === "number") {
		return typeof value !== "number";
	}

	return !value;
}

function printEmpty(accessor: string, field: BuilderField) {
	switch (FIELD_TYPES[field.type].valueKind) {
		case "list":
			return `${accessor}.length === 0`;
		case "number":
			return `typeof ${accessor} !== 'number'`;
		default:
			return `!${accessor}`;
	}
}

function printNotEmpty(accessor: string, field: BuilderField) {
	switch (FIELD_TYPES[field.type].valueKind) {
		case "list":
			return `${accessor}.length > 0`;
		case "number":
			return `typeof ${accessor} === 'number'`;
		default:
			return `!!${accessor}`;
	}
}

/** NumberInput holds an empty string until something is typed, so its comparisons need a type guard. */
function printCompare(
	accessor: string,
	comparison: string,
	field: BuilderField,
) {
	return typeof getInitialValue(field) === "number"
		? comparison
		: `typeof ${accessor} === 'number' && ${comparison}`;
}

export const OPERATORS: Record<Operator, OperatorDefinition> = {
	equals: {
		label: "is",
		kinds: ["text", "number"],
		takesValue: true,
		test: (value, target) => value === target,
		print: (accessor, target) => `${accessor} === ${target}`,
	},
	notEquals: {
		label: "is not",
		kinds: ["text", "number"],
		takesValue: true,
		test: (value, target) => value !== target,
		print: (accessor, target) => `${accessor} !== ${target}`,
	},
	greaterThan: {
		label: "is greater than",
		kinds: ["number"],
		takesValue: true,
		test: (value, target) =>
			typeof value === "number" && typeof target === "number" && value > target,
		print: (accessor, target, field) =>
			printCompare(accessor, `${accessor} > ${target}`, field),
	},
	lessThan: {
		label: "is less than",
		kinds: ["number"],
		takesValue: true,
		test: (value, target) =>
			typeof value === "number" && typeof target === "number" && value < target,
		print: (accessor, target, field) =>
			printCompare(accessor, `${accessor} < ${target}`, field),
	},
	includes: {
		label: "includes",
		kinds: ["list"],
		takesValue: true,
		test: (value, target) =>
			Array.isArray(value) && value.includes(target as string),
		print: (accessor, target) => `${accessor}.includes(${target})`,
	},
	excludes: {
		label: "does not include",
		kinds: ["list"],
		takesValue: true,
		test: (value, target) =>
			!Array.isArray(value) || !value.includes(target as string),
		print: (accessor, target) => `!${accessor}.includes(${target})`,
	},
	isEmpty: {
		label: "is empty",
		kinds: ["text", "number", "list", "presence"],
		takesValue: false,
		test: (value, _target, kind) => isEmptyValue(value, kind),
		print: (accessor, _target, field) => printEmpty(accessor, field),
	},
	isNotEmpty: {
		label: "is not empty",
		kinds: ["text", "number", "list", "presence"],
		takesValue: false,
		test: (value, _target, kind) => !isEmptyValue(value, kind),
		print: (accessor, _target, field) => printNotEmpty(accessor, field),
	},
	isChecked: {
		label: "is checked",
		kinds: ["boolean"],
		takesValue: false,
		test: (value) => value === true,
		print: (accessor) => accessor,
	},
	isNotChecked: {
		label: "is not checked",
		kinds: ["boolean"],
		takesValue: false,
		test: (value) => value !== true,
		print: (accessor) => `!${accessor}`,
	},
};

export function getOperators(field: BuilderField) {
	const kind = FIELD_TYPES[field.type].valueKind;

	return (Object.keys(OPERATORS) as Operator[]).filter((operator) =>
		OPERATORS[operator].kinds.includes(kind),
	);
}

/** Options a clause value can be picked from, or `null` when the field accepts values outside its options. */
export function getChoices(field: BuilderField) {
	const { options, freeText } = FIELD_TYPES[field.type];

	return options !== undefined && !freeText ? field.options : null;
}

export function createClause(field: BuilderField): Clause {
	const operator = getOperators(field)[0] ?? "isNotEmpty";

	return {
		fieldId: field.id,
		operator,
		value: OPERATORS[operator].takesValue ? getChoices(field)?.[0] : undefined,
	};
}

export const EFFECTS: ConditionEffect[] = [
	"visible",
	"hidden",
	"required",
	"disabled",
	"readOnly",
];

export const EFFECT_LABELS: Record<ConditionEffect, string> = {
	visible: "Shown",
	hidden: "Hidden",
	required: "Required",
	disabled: "Disabled",
	readOnly: "Read only",
};

/** Required only applies once the Required rule is on, so a condition never adds a validator by itself. */
export function supportsEffect(node: BuilderNode, effect: ConditionEffect) {
	switch (effect) {
		case "visible":
		case "hidden":
			return true;
		case "required":
			return (
				node.kind === "field" &&
				FIELD_TYPES[node.type].rules.includes("required") &&
				Boolean(node.rules.required)
			);
		case "disabled":
			return node.kind === "field"
				? FIELD_TYPES[node.type].props.some((prop) => prop.name === "disabled")
				: node.kind === "fieldset";
		default:
			return (
				node.kind === "field" &&
				FIELD_TYPES[node.type].props.some((prop) => prop.name === effect)
			);
	}
}

export function setCondition(
	node: BuilderNode,
	effect: ConditionEffect,
	condition: Condition | null,
): BuilderNode {
	const { [effect]: _removed, ...rest } = node.conditions ?? {};
	const conditions = condition ? { ...rest, [effect]: condition } : rest;
	const next = {
		...node,
		conditions: Object.keys(conditions).length > 0 ? conditions : undefined,
	};

	if (isPropEffect(effect) && condition && effect in node.props) {
		const { [effect]: _static, ...props } = node.props;
		return { ...next, props } as BuilderNode;
	}

	return next as BuilderNode;
}

/** A prop condition replaces the matching static toggle, which `setCondition` clears when the condition is added. */
export function getStaticPropDefs(node: BuilderNode, defs: PropDef[]) {
	return defs.filter(
		(def) =>
			!(
				isPropEffect(def.name as ConditionEffect) &&
				node.conditions?.[def.name as PropEffect]
			),
	);
}

export interface ConditionScope {
	fields: Map<string, BuilderField>;
	keys: Map<string, string>;
}

export function createScope(nodes: BuilderNode[], keys: Map<string, string>) {
	return {
		fields: new Map(flattenFields(nodes).map((field) => [field.id, field])),
		keys,
	} satisfies ConditionScope;
}

/** A container hidden by one of its own fields could never be shown again, so its conditions cannot read them. */
export function getExcludedIds(node: BuilderNode) {
	return new Set(
		isContainer(node)
			? flattenFields(node.children).map((field) => field.id)
			: [node.id],
	);
}

export type ClauseIssue = "missing" | "self" | "operator" | "value";

export function getClauseIssue(
	clause: Clause,
	owner: BuilderNode,
	scope: ConditionScope,
): ClauseIssue | null {
	const field = scope.fields.get(clause.fieldId);

	if (!field) {
		return "missing";
	}

	if (getExcludedIds(owner).has(field.id)) {
		return "self";
	}

	if (!getOperators(field).includes(clause.operator)) {
		return "operator";
	}

	if (
		OPERATORS[clause.operator].takesValue &&
		(clause.value === undefined || clause.value === "")
	) {
		return "value";
	}

	return null;
}

/** Returns the condition without the clauses that cannot run, or `null` when nothing is left. */
export function getActiveCondition(
	node: BuilderNode,
	effect: ConditionEffect,
	scope: ConditionScope,
): Condition | null {
	const condition = node.conditions?.[effect];

	if (!condition || !supportsEffect(node, effect)) {
		return null;
	}

	const clauses = condition.clauses.filter(
		(clause) => getClauseIssue(clause, node, scope) === null,
	);

	return clauses.length > 0 ? { ...condition, clauses } : null;
}

export function evaluate(
	condition: Condition,
	values: Record<string, unknown>,
	scope: ConditionScope,
) {
	const results = condition.clauses.map((clause) => {
		const field = scope.fields.get(clause.fieldId);

		if (!field) {
			return false;
		}

		const key = scope.keys.get(field.id) ?? field.id;

		return OPERATORS[clause.operator].test(
			values[key],
			clause.value,
			FIELD_TYPES[field.type].valueKind,
		);
	});

	const matched =
		condition.match === "all" ? results.every(Boolean) : results.some(Boolean);

	return condition.negate ? !matched : matched;
}

export function evaluateAll(
	conditions: Condition[],
	values: Record<string, unknown>,
	scope: ConditionScope,
) {
	return conditions.every((condition) => evaluate(condition, values, scope));
}

function wrap(expression: string) {
	return /&&|\|\|/.test(expression) ? `(${expression})` : expression;
}

function joinParts(parts: string[], separator: " && " | " || ") {
	return parts.length === 1
		? (parts[0] as string)
		: parts.map(wrap).join(separator);
}

export function printCondition(
	condition: Condition,
	scope: ConditionScope,
	accessor: (key: string) => string,
) {
	const parts = condition.clauses.map((clause) => {
		const field = scope.fields.get(clause.fieldId) as BuilderField;
		const key = scope.keys.get(field.id) ?? field.id;

		return OPERATORS[clause.operator].print(
			accessor(key),
			printValue(clause.value),
			field,
		);
	});

	const expression = joinParts(
		parts,
		condition.match === "all" ? " && " : " || ",
	);

	return condition.negate ? `!(${expression})` : expression;
}

export function printConditions(
	conditions: Condition[],
	scope: ConditionScope,
	accessor: (key: string) => string,
) {
	return joinParts(
		conditions.map((condition) => printCondition(condition, scope, accessor)),
		" && ",
	);
}

export function describeCondition(condition: Condition, scope: ConditionScope) {
	const parts = condition.clauses.map((clause) => {
		const field = scope.fields.get(clause.fieldId) as BuilderField;
		const target = clause.value === undefined ? "" : ` ${String(clause.value)}`;

		return `${getNodeLabel(field)} ${OPERATORS[clause.operator].label}${target}`;
	});

	return parts.join(condition.match === "all" ? " and " : " or ");
}

/** Combines a node's show and hide conditions into conditions that must all pass for it to render. */
export function getOwnVisibility(node: BuilderNode, scope: ConditionScope) {
	const visible = getActiveCondition(node, "visible", scope);
	const hidden = getActiveCondition(node, "hidden", scope);

	return [
		...(visible ? [visible] : []),
		...(hidden ? [{ ...hidden, negate: true }] : []),
	];
}

/** Collects every visibility condition a field sits under, its own and its containers', keyed by field id. */
export function getVisibilityConditions(
	nodes: BuilderNode[],
	scope: ConditionScope,
	inherited: Condition[] = [],
	result = new Map<string, Condition[]>(),
) {
	for (const node of nodes) {
		const conditions = [...inherited, ...getOwnVisibility(node, scope)];

		if (node.kind === "field" && conditions.length > 0) {
			result.set(node.id, conditions);
		}

		if (isContainer(node)) {
			getVisibilityConditions(node.children, scope, conditions, result);
		}
	}

	return result;
}

/** Some initial values, such as `null` for a select, infer a type too narrow for the comparisons a condition prints. */
export function getValueType(field: BuilderField) {
	const initial = getInitialValue(field);
	const kind = FIELD_TYPES[field.type].valueKind;

	if (kind === "list" && Array.isArray(initial)) {
		return "string[]";
	}

	if (kind === "text" && initial === null) {
		return "string | null";
	}

	if (kind === "number" && typeof initial !== "number") {
		return "string | number";
	}

	return null;
}

export function getReferencedIds(nodes: BuilderNode[], scope: ConditionScope) {
	return new Set(
		flattenNodes(nodes).flatMap((node) =>
			EFFECTS.flatMap(
				(effect) =>
					getActiveCondition(node, effect, scope)?.clauses.map(
						(clause) => clause.fieldId,
					) ?? [],
			),
		),
	);
}
