import {
	Button,
	Popover,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { type Icon, IconSearch } from "@tabler/icons-react";
import { type ReactElement, useState } from "react";
import { CONTAINER_ICONS, CONTENT_ICONS, FIELD_ICONS } from "./fieldIcons";
import { FIELD_GROUPS, FIELD_TYPES, FIELD_TYPES_BY_GROUP } from "./fieldTypes";
import {
	CONTAINER_TYPES,
	CONTENT_TYPES,
	type ContentType,
	type NodeTemplate,
} from "./nodes";

interface PaletteItem {
	template: NodeTemplate;
	label: string;
	icon: Icon;
}

const contentItem = (type: ContentType): PaletteItem => ({
	template: { kind: "content", type },
	label: CONTENT_TYPES[type].label,
	icon: CONTENT_ICONS[type],
});

const PALETTE_GROUPS: { group: string; items: PaletteItem[] }[] = [
	{
		group: "Layout",
		items: [
			{
				template: { kind: "row" },
				label: CONTAINER_TYPES.row.label,
				icon: CONTAINER_ICONS.row,
			},
			{
				template: { kind: "fieldset" },
				label: CONTAINER_TYPES.fieldset.label,
				icon: CONTAINER_ICONS.fieldset,
			},
			contentItem("divider"),
			contentItem("space"),
		],
	},
	{
		group: "Content",
		items: [contentItem("title"), contentItem("text"), contentItem("alert")],
	},
	...FIELD_GROUPS.map((group) => ({
		group,
		items: FIELD_TYPES_BY_GROUP[group].map(
			(type): PaletteItem => ({
				template: { kind: "field", type },
				label: FIELD_TYPES[type].label,
				icon: FIELD_ICONS[type],
			}),
		),
	})),
];

interface FieldPaletteProps {
	onSelect: (template: NodeTemplate) => void;
	/** Hides entries the target container cannot hold. */
	accepts?: (template: NodeTemplate) => boolean;
}

export function FieldPalette({ onSelect, accepts }: FieldPaletteProps) {
	const [search, setSearch] = useState("");
	const query = search.trim().toLowerCase();
	const groups = PALETTE_GROUPS.map(({ group, items }) => ({
		group,
		items: items.filter(
			(item) =>
				(!accepts || accepts(item.template)) &&
				(!query || item.label.toLowerCase().includes(query)),
		),
	})).filter(({ items }) => items.length > 0);

	return (
		<Stack gap="sm">
			<TextInput
				size="xs"
				placeholder="Search components"
				leftSection={<IconSearch size={14} />}
				value={search}
				data-autofocus
				onChange={(event) => setSearch(event.currentTarget.value)}
				onKeyDown={(event) => {
					const first = groups[0]?.items[0];

					if (event.key === "Enter" && first) {
						onSelect(first.template);
					}
				}}
			/>
			{groups.length === 0 && (
				<Text size="sm" c="dimmed" ta="center" py="sm">
					Nothing matches "{search}"
				</Text>
			)}
			{groups.map(({ group, items }) => (
				<div key={group}>
					<Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>
						{group}
					</Text>
					<SimpleGrid cols={2} spacing={6} verticalSpacing={6}>
						{items.map(({ template, label, icon: ItemIcon }) => (
							<Button
								key={label}
								variant="default"
								size="xs"
								justify="flex-start"
								leftSection={<ItemIcon size={16} stroke={1.5} />}
								onClick={() => onSelect(template)}
							>
								{label}
							</Button>
						))}
					</SimpleGrid>
				</div>
			))}
		</Stack>
	);
}

interface FieldPalettePopoverProps extends FieldPaletteProps {
	children: (toggle: () => void) => ReactElement;
}

export function FieldPalettePopover({
	onSelect,
	accepts,
	children,
}: FieldPalettePopoverProps) {
	const [opened, { toggle, close, set }] = useDisclosure(false);

	return (
		<Popover
			opened={opened}
			onChange={set}
			width={340}
			position="bottom"
			shadow="md"
			withArrow
			trapFocus
		>
			<Popover.Target>{children(toggle)}</Popover.Target>
			<Popover.Dropdown mah={420} style={{ overflowY: "auto" }}>
				<FieldPalette
					accepts={accepts}
					onSelect={(template) => {
						onSelect(template);
						close();
					}}
				/>
			</Popover.Dropdown>
		</Popover>
	);
}
