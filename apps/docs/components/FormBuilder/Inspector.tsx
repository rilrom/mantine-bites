import {
	Anchor,
	Breadcrumbs,
	Button,
	Code,
	Group,
	Menu,
	ScrollArea,
	Stack,
	Text,
	ThemeIcon,
} from "@mantine/core";
import {
	IconCheck,
	IconChevronDown,
	IconClick,
	IconForms,
	IconSettings,
} from "@tabler/icons-react";
import { Fragment } from "react";
import { ConditionEditor } from "./ConditionEditor";
import { type ConditionScope, getStaticPropDefs } from "./conditions";
import {
	DEFAULT_SETTINGS,
	type FormSettings,
	SETTINGS_SECTIONS,
} from "./defaults";
import {
	FieldInspector,
	PropSection,
	Section,
	SpanSelect,
} from "./FieldInspector";
import { FIELD_ICONS, getNodeIcon } from "./fieldIcons";
import {
	type BuilderField,
	FIELD_GROUPS,
	FIELD_TYPES,
	FIELD_TYPES_BY_GROUP,
	type FieldType,
	getDefaultOptions,
	hasOptions,
} from "./fieldTypes";
import {
	type BuilderNode,
	getNodeLabel,
	getPropDefs,
	getTypeLabel,
} from "./nodes";
import {
	type PropDef,
	type PropValue,
	type PropValues,
	setPropValue,
	splitToggles,
} from "./props";

interface ChangeTypeMenuProps {
	field: BuilderField;
	onChange: (field: BuilderField) => void;
}

function ChangeTypeMenu({ field, onChange }: ChangeTypeMenuProps) {
	const changeType = (type: FieldType) => {
		const needsOptions = hasOptions(type) && field.options.length === 0;
		onChange({
			...field,
			type,
			options: needsOptions ? getDefaultOptions(type) : field.options,
		});
	};

	return (
		<Menu position="bottom-end" shadow="md" withArrow>
			<Menu.Target>
				<Button
					size="compact-xs"
					variant="default"
					rightSection={<IconChevronDown size={12} />}
				>
					Change type
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
				<ScrollArea.Autosize mah={360} type="auto">
					{FIELD_GROUPS.map((group) => (
						<Fragment key={group}>
							<Menu.Label>{group}</Menu.Label>
							{FIELD_TYPES_BY_GROUP[group].map((type) => {
								const Icon = FIELD_ICONS[type];

								return (
									<Menu.Item
										key={type}
										leftSection={<Icon size={16} stroke={1.5} />}
										rightSection={
											type === field.type && <IconCheck size={14} />
										}
										onClick={() => changeType(type)}
									>
										{FIELD_TYPES[type].label}
									</Menu.Item>
								);
							})}
						</Fragment>
					))}
				</ScrollArea.Autosize>
			</Menu.Dropdown>
		</Menu>
	);
}

interface InspectorProps {
	view: "node" | "form";
	path: BuilderNode[];
	fieldKeys: Map<string, string>;
	scope: ConditionScope;
	settings: FormSettings;
	autoFocusLabel: boolean;
	onSelect: (id: string | null) => void;
	onChange: (node: BuilderNode) => void;
	onSettingsChange: (settings: FormSettings) => void;
}

export function Inspector({
	view,
	path,
	fieldKeys,
	scope,
	settings,
	autoFocusLabel,
	onSelect,
	onChange,
	onSettingsChange,
}: InspectorProps) {
	if (view === "form") {
		return (
			<Stack gap="lg">
				<Group gap="sm" wrap="nowrap">
					<ThemeIcon variant="light" size="lg" radius="md">
						<IconSettings size={18} stroke={1.5} />
					</ThemeIcon>
					<div>
						<Text size="sm" fw={600} c="bright">
							Form settings
						</Text>
						<Text size="xs" c="dimmed">
							Submit button, spacing and validation
						</Text>
					</div>
				</Group>
				{SETTINGS_SECTIONS.map((section) => (
					<PropSection
						key={section.title}
						title={section.title}
						defs={section.props}
						values={settings as unknown as PropValues}
						onChange={(def, value) =>
							onSettingsChange({
								...settings,
								[def.name]:
									value ?? DEFAULT_SETTINGS[def.name as keyof FormSettings],
							})
						}
					/>
				))}
			</Stack>
		);
	}

	const node = path.at(-1);
	const parent = path.at(-2);
	const inRow = parent?.kind === "row";

	if (!node) {
		return (
			<Stack align="center" gap={4} py="xl" c="dimmed" ta="center">
				<IconClick size={24} stroke={1.5} />
				<Text size="sm">Select a field on the canvas to edit it.</Text>
			</Stack>
		);
	}

	const HeaderIcon = getNodeIcon(node);
	const nodeProps = splitToggles(getStaticPropDefs(node, getPropDefs(node)));
	const setNodeProp = (def: PropDef, value: PropValue | undefined) =>
		onChange({
			...node,
			props: setPropValue(node.props, def, value),
		} as BuilderNode);

	return (
		<Stack gap="lg">
			{path.length > 1 && (
				<Breadcrumbs separatorMargin={4}>
					{path.map((item, index) =>
						index === path.length - 1 ? (
							<Text key={item.id} size="xs" fw={500} truncate maw={140}>
								{getNodeLabel(item)}
							</Text>
						) : (
							<Anchor
								key={item.id}
								component="button"
								type="button"
								size="xs"
								c="dimmed"
								truncate
								maw={120}
								onClick={() => onSelect(item.id)}
							>
								{getNodeLabel(item)}
							</Anchor>
						),
					)}
				</Breadcrumbs>
			)}

			<Group justify="space-between" wrap="nowrap">
				<Group gap="sm" wrap="nowrap" miw={0}>
					<ThemeIcon variant="light" size="lg" radius="md">
						<HeaderIcon size={18} stroke={1.5} />
					</ThemeIcon>
					<div>
						<Text size="sm" fw={600} c="bright">
							{getTypeLabel(node)}
						</Text>
						{node.kind === "field" ? (
							<Code fz="xs">{fieldKeys.get(node.id)}</Code>
						) : (
							<Text size="xs" c="dimmed">
								Layout and content, no form value
							</Text>
						)}
					</div>
				</Group>
				{node.kind === "field" && (
					<ChangeTypeMenu field={node} onChange={onChange} />
				)}
			</Group>

			{node.kind === "field" && (
				<FieldInspector
					key={node.id}
					field={node}
					autoFocusLabel={autoFocusLabel}
					inRow={inRow}
					scope={scope}
					onChange={onChange}
				/>
			)}

			{node.kind !== "field" && (
				<Stack gap="lg">
					<PropSection
						title="Props"
						defs={nodeProps.props}
						values={node.props}
						onChange={setNodeProp}
					/>

					{node.kind === "content" && inRow && (
						<Section title="Layout">
							<SpanSelect node={node} onChange={onChange} />
						</Section>
					)}

					{node.kind === "row" && (
						<Section title="Columns">
							{node.children.length === 0 ? (
								<Group gap="xs" c="dimmed">
									<IconForms size={16} stroke={1.5} />
									<Text size="sm">
										Drag fields into the row or use its + button.
									</Text>
								</Group>
							) : (
								node.children.map((child) => (
									<SpanSelect
										key={child.id}
										node={child}
										label={getNodeLabel(child)}
										onChange={onChange}
									/>
								))
							)}
						</Section>
					)}

					<PropSection
						title="Toggles"
						defs={nodeProps.toggles}
						values={node.props}
						onChange={setNodeProp}
					/>

					<ConditionEditor node={node} scope={scope} onChange={onChange} />
				</Stack>
			)}
		</Stack>
	);
}
