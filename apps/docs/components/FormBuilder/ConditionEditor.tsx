import {
	Button,
	CloseButton,
	Group,
	NumberInput,
	Paper,
	SegmentedControl,
	Select,
	Stack,
	Text,
	TextInput,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import {
	type Clause,
	type ClauseIssue,
	type ClauseValue,
	type Condition,
	type ConditionEffect,
	type ConditionScope,
	createClause,
	EFFECTS,
	getChoices,
	getClauseIssue,
	getExcludedIds,
	getOperators,
	OPERATORS,
	setCondition,
	supportsEffect,
} from "./conditions";
import { Section } from "./FieldInspector";
import { type BuilderField, FIELD_TYPES } from "./fieldTypes";
import { type BuilderNode, getNodeLabel } from "./nodes";

const EFFECT_TEXT: Record<
	ConditionEffect,
	{ title: string; fallback: string }
> = {
	visible: { title: "Show when", fallback: "Always shown" },
	hidden: { title: "Hide when", fallback: "Never hidden" },
	required: { title: "Require when", fallback: "Always required" },
	disabled: { title: "Disable when", fallback: "Uses the Disabled toggle" },
	readOnly: { title: "Read only when", fallback: "Uses the Read only toggle" },
};

const ISSUE_MESSAGES: Partial<Record<ClauseIssue, string>> = {
	missing: "This field was deleted, so the condition is ignored",
	self: "Cannot depend on itself, so the condition is ignored",
	operator: "Pick a check that fits this field",
};

interface ValueInputProps {
	field: BuilderField;
	value: ClauseValue | undefined;
	onChange: (value: ClauseValue | undefined) => void;
}

function ValueInput({ field, value, onChange }: ValueInputProps) {
	const choices = getChoices(field);

	if (FIELD_TYPES[field.type].valueKind === "number") {
		return (
			<NumberInput
				size="xs"
				aria-label="Value"
				placeholder="Value"
				value={typeof value === "number" ? value : ""}
				onChange={(next) =>
					onChange(typeof next === "number" ? next : undefined)
				}
			/>
		);
	}

	if (choices) {
		return (
			<Select
				size="xs"
				aria-label="Value"
				placeholder="Pick option"
				data={[...new Set(choices)]}
				value={typeof value === "string" ? value : null}
				onChange={(next) => onChange(next ?? undefined)}
			/>
		);
	}

	return (
		<TextInput
			size="xs"
			aria-label="Value"
			placeholder="Value"
			value={typeof value === "string" ? value : ""}
			onChange={(event) => onChange(event.currentTarget.value || undefined)}
		/>
	);
}

interface ClauseEditorProps {
	clause: Clause;
	owner: BuilderNode;
	sources: BuilderField[];
	scope: ConditionScope;
	onChange: (clause: Clause) => void;
	onRemove: () => void;
}

function ClauseEditor({
	clause,
	owner,
	sources,
	scope,
	onChange,
	onRemove,
}: ClauseEditorProps) {
	const field = scope.fields.get(clause.fieldId);
	const issue = getClauseIssue(clause, owner, scope);
	const operators = field ? getOperators(field) : [];
	const takesValue = OPERATORS[clause.operator].takesValue;

	const changeSource = (id: string | null) => {
		const next = id ? scope.fields.get(id) : undefined;

		if (!next) {
			return;
		}

		const fresh = createClause(next);
		const { operator } = clause;

		onChange(
			getOperators(next).includes(operator)
				? {
						...fresh,
						operator,
						value: OPERATORS[operator].takesValue ? fresh.value : undefined,
					}
				: fresh,
		);
	};

	return (
		<Paper withBorder radius="sm" p="xs">
			<Stack gap="xs">
				<Group gap="xs" wrap="nowrap" align="flex-start">
					<Select
						size="xs"
						flex={1}
						aria-label="Field"
						placeholder="Pick field"
						searchable
						data={sources.map((source) => ({
							value: source.id,
							label: getNodeLabel(source),
						}))}
						value={field && issue !== "self" ? field.id : null}
						error={issue ? ISSUE_MESSAGES[issue] : undefined}
						allowDeselect={false}
						onChange={changeSource}
					/>
					<CloseButton
						size="sm"
						mt={4}
						aria-label="Remove condition"
						onClick={onRemove}
					/>
				</Group>
				{field && (
					<Group gap="xs" grow wrap="nowrap">
						<Select
							size="xs"
							aria-label="Check"
							data={operators.map((operator) => ({
								value: operator,
								label: OPERATORS[operator].label,
							}))}
							value={
								operators.includes(clause.operator) ? clause.operator : null
							}
							allowDeselect={false}
							onChange={(operator) => {
								const next = operator as Clause["operator"];

								onChange({
									...clause,
									operator: next,
									value: OPERATORS[next].takesValue
										? (clause.value ?? getChoices(field)?.[0])
										: undefined,
								});
							}}
						/>
						{takesValue && (
							<ValueInput
								field={field}
								value={clause.value}
								onChange={(value) => onChange({ ...clause, value })}
							/>
						)}
					</Group>
				)}
			</Stack>
		</Paper>
	);
}

interface EffectEditorProps {
	effect: ConditionEffect;
	node: BuilderNode;
	sources: BuilderField[];
	scope: ConditionScope;
	onChange: (node: BuilderNode) => void;
}

function EffectEditor({
	effect,
	node,
	sources,
	scope,
	onChange,
}: EffectEditorProps) {
	const condition = node.conditions?.[effect];
	const clauses = condition?.clauses ?? [];
	const match = condition?.match ?? "all";
	const { title, fallback } = EFFECT_TEXT[effect];

	const update = (next: Clause[], nextMatch = match) =>
		onChange(
			setCondition(
				node,
				effect,
				next.length > 0 ? { match: nextMatch, clauses: next } : null,
			),
		);

	return (
		<Stack gap="xs">
			<Group justify="space-between" wrap="nowrap" mih={22}>
				<Text size="sm" fw={500}>
					{title}
				</Text>
				{clauses.length > 1 && (
					<SegmentedControl
						size="xs"
						value={match}
						data={[
							{ value: "all", label: "All match" },
							{ value: "any", label: "Any match" },
						]}
						onChange={(value) => update(clauses, value as Condition["match"])}
					/>
				)}
			</Group>
			{clauses.length === 0 && (
				<Text size="xs" c="dimmed">
					{fallback}
				</Text>
			)}
			{clauses.map((clause, index) => (
				<ClauseEditor
					// biome-ignore lint/suspicious/noArrayIndexKey: Clauses have no id and hold no state of their own.
					key={index}
					clause={clause}
					owner={node}
					sources={sources}
					scope={scope}
					onChange={(next) =>
						update(clauses.map((item, i) => (i === index ? next : item)))
					}
					onRemove={() => update(clauses.filter((_, i) => i !== index))}
				/>
			))}
			<Button
				variant="subtle"
				size="compact-xs"
				leftSection={<IconPlus size={12} />}
				disabled={sources.length === 0}
				style={{ alignSelf: "flex-start" }}
				onClick={() => {
					const source = sources[0];

					if (source) {
						update([...clauses, createClause(source)]);
					}
				}}
			>
				{clauses.length === 0 ? "Add condition" : "Add another"}
			</Button>
		</Stack>
	);
}

interface ConditionEditorProps {
	node: BuilderNode;
	scope: ConditionScope;
	onChange: (node: BuilderNode) => void;
}

export function ConditionEditor({
	node,
	scope,
	onChange,
}: ConditionEditorProps) {
	const excluded = getExcludedIds(node);
	const sources = [...scope.fields.values()].filter(
		(field) => !excluded.has(field.id),
	);
	const effects = EFFECTS.filter((effect) => supportsEffect(node, effect));

	return (
		<Section title="Logic">
			{sources.length === 0 && (
				<Text size="xs" c="dimmed">
					Add another field to base conditions on its value.
				</Text>
			)}
			{effects.map((effect) => (
				<EffectEditor
					key={effect}
					effect={effect}
					node={node}
					sources={sources}
					scope={scope}
					onChange={onChange}
				/>
			))}
		</Section>
	);
}
