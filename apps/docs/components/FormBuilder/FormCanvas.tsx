import {
	type Active,
	type CollisionDetection,
	closestCenter,
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	type Over,
	PointerSensor,
	pointerWithin,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	rectSortingStrategy,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	ActionIcon,
	Button,
	Fieldset,
	Grid,
	Group,
	Paper,
	Stack,
	Text,
	ThemeIcon,
	Tooltip,
	UnstyledButton,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
	IconCopy,
	IconGripVertical,
	IconPlus,
	IconTrash,
} from "@tabler/icons-react";
import {
	type CSSProperties,
	createContext,
	type KeyboardEvent,
	memo,
	type ReactNode,
	use,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import type { FormSettings } from "./defaults";
import { FieldPalette, FieldPalettePopover } from "./FieldPalette";
import classes from "./FormBuilder.module.css";
import {
	PreviewContent,
	PreviewField,
	SubmitRow,
	type Values,
} from "./FormPreview";
import { getNodeIcon } from "./fieldIcons";
import { type BuilderField, getInitialValue } from "./fieldTypes";
import {
	type BuilderNode,
	type ContainerNode,
	canContain,
	findNode,
	flattenNodes,
	getFallbackId,
	getLocation,
	getNodeLabel,
	getParent,
	getSiblings,
	getTypeLabel,
	isContainer,
	moveNode,
	type NodeTemplate,
	type RowNode,
} from "./nodes";
import { getColSpan } from "./resolve";

type DropData =
	| { type: "item"; parentId: string | null }
	| { type: "zone"; containerId: string | null };

const ROOT_ZONE = "root:zone";

const zoneId = (containerId: string) => `${containerId}:zone`;

interface CanvasContextValue {
	nodes: BuilderNode[];
	settings: FormSettings;
	fieldKeys: Map<string, string>;
	selectedId: string | null;
	onSelect: (id: string | null) => void;
	onInsert: (
		template: NodeTemplate,
		parentId: string | null,
		index: number,
	) => void;
	onDuplicate: (id: string) => void;
	onDelete: (id: string) => void;
	onMove: (id: string, parentId: string | null, index: number) => void;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

function useCanvas() {
	const context = use(CanvasContext);

	if (!context) {
		throw new Error("Canvas components must be rendered inside FormCanvas");
	}

	return context;
}

function focusNode(id: string | null | undefined) {
	if (id) {
		requestAnimationFrame(() =>
			document.querySelector<HTMLElement>(`[data-node-id="${id}"]`)?.focus(),
		);
	}
}

function StaticField({ field }: { field: BuilderField }) {
	const { fieldKeys, settings } = useCanvas();
	const fieldKey = fieldKeys.get(field.id) ?? field.id;
	const form = useForm<Values>({
		mode: "uncontrolled",
		initialValues: { [fieldKey]: getInitialValue(field) },
	});

	return (
		<PreviewField
			field={field}
			fieldKey={fieldKey}
			form={form}
			settings={settings}
		/>
	);
}

interface InsertPointProps {
	parent: ContainerNode | null;
	index: number;
	label: string;
}

function InsertPoint({ parent, index, label }: InsertPointProps) {
	const { onInsert } = useCanvas();

	return (
		<div className={classes.insertPoint}>
			<FieldPalettePopover
				accepts={(template) => canContain(parent, template)}
				onSelect={(template) => onInsert(template, parent?.id ?? null, index)}
			>
				{(toggle) => (
					<ActionIcon
						size="sm"
						radius="xl"
						variant="default"
						className={classes.insertButton}
						aria-label={label}
						onClick={toggle}
					>
						<IconPlus size={12} />
					</ActionIcon>
				)}
			</FieldPalettePopover>
		</div>
	);
}

interface SortableRenderProps {
	ref: (element: HTMLElement | null) => void;
	style: CSSProperties;
	handle: Record<string, unknown> & {
		ref: (element: HTMLElement | null) => void;
	};
	isDragging: boolean;
}

interface SortableNodeProps {
	id: string;
	parentId: string | null;
	children: (props: SortableRenderProps) => ReactNode;
}

function SortableNode({ id, parentId, children }: SortableNodeProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id, data: { type: "item", parentId } satisfies DropData });

	return children({
		ref: setNodeRef,
		style: { transform: CSS.Translate.toString(transform), transition },
		handle: { ...attributes, ...listeners, ref: setActivatorNodeRef },
		isDragging,
	});
}

interface NodeFrameProps {
	node: BuilderNode;
	handle: SortableRenderProps["handle"];
	isDragging: boolean;
	children: ReactNode;
}

function NodeFrame({ node, handle, isDragging, children }: NodeFrameProps) {
	const {
		nodes,
		selectedId,
		onSelect,
		onDuplicate,
		onDelete,
		onMove,
		onInsert,
	} = useCanvas();
	const label = getNodeLabel(node);
	const selected = node.id === selectedId;
	const container = isContainer(node);

	const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		const location = getLocation(nodes, node.id);
		const { parent, parentId, siblings, index } = location;
		const backward = event.key === "ArrowUp" || event.key === "ArrowLeft";
		const forward = event.key === "ArrowDown" || event.key === "ArrowRight";

		if (backward || forward) {
			event.preventDefault();
			const target = index + (forward ? 1 : -1);

			if (target < 0 || target >= siblings.length) {
				return;
			}

			if (event.altKey) {
				onMove(node.id, parentId, target);
				focusNode(node.id);
			} else {
				const next = siblings[target]?.id ?? null;
				onSelect(next);
				focusNode(next);
			}
		} else if (event.key === "Escape") {
			event.preventDefault();
			onSelect(parent?.id ?? null);
			focusNode(parent?.id);
		} else if (event.key === "Delete" || event.key === "Backspace") {
			event.preventDefault();
			onDelete(node.id);
			focusNode(getFallbackId(location));
		}
	};

	return (
		<div
			className={classes.frame}
			data-kind={node.kind}
			data-selected={selected || undefined}
			data-dragging={isDragging || undefined}
		>
			<UnstyledButton
				className={classes.frameSelect}
				data-node-id={node.id}
				aria-label={`Edit ${label}`}
				aria-pressed={selected}
				onClick={() => onSelect(node.id)}
				onKeyDown={handleKeyDown}
			/>
			{container && (
				<Text className={classes.frameTag} size="xs" fw={600}>
					{getTypeLabel(node)}
				</Text>
			)}
			{container ? (
				<div className={classes.frameBody}>{children}</div>
			) : (
				<div inert className={classes.frameContent}>
					{children}
				</div>
			)}
			<Group gap={2} wrap="nowrap" className={classes.frameActions}>
				{node.kind === "row" && (
					<FieldPalettePopover
						accepts={(template) => canContain(node, template)}
						onSelect={(template) =>
							onInsert(template, node.id, node.children.length)
						}
					>
						{(toggle) => (
							<Tooltip label="Add to row" withArrow>
								<ActionIcon
									variant="subtle"
									color="gray"
									size="sm"
									aria-label={`Add to ${label}`}
									onClick={toggle}
								>
									<IconPlus size={14} stroke={1.5} />
								</ActionIcon>
							</Tooltip>
						)}
					</FieldPalettePopover>
				)}
				<Tooltip label="Drag to move" withArrow>
					<ActionIcon
						variant="subtle"
						color="gray"
						size="sm"
						aria-label={`Move ${label}`}
						className={classes.frameHandle}
						{...handle}
					>
						<IconGripVertical size={14} stroke={1.5} />
					</ActionIcon>
				</Tooltip>
				<Tooltip label="Duplicate" withArrow>
					<ActionIcon
						variant="subtle"
						color="gray"
						size="sm"
						aria-label={`Duplicate ${label}`}
						onClick={() => onDuplicate(node.id)}
					>
						<IconCopy size={14} stroke={1.5} />
					</ActionIcon>
				</Tooltip>
				<Tooltip label="Delete" withArrow>
					<ActionIcon
						variant="subtle"
						color="red"
						size="sm"
						aria-label={`Delete ${label}`}
						onClick={() => onDelete(node.id)}
					>
						<IconTrash size={14} stroke={1.5} />
					</ActionIcon>
				</Tooltip>
			</Group>
		</div>
	);
}

function NodeContent({ node }: { node: BuilderNode }) {
	const { settings, onInsert } = useCanvas();

	switch (node.kind) {
		case "field":
			return (
				<StaticField
					key={`${JSON.stringify(node)}:${settings.size}`}
					field={node}
				/>
			);
		case "content":
			return <PreviewContent node={node} />;
		case "row":
			return <RowContent row={node} />;
		default: {
			const { disabled: _disabled, ...props } = node.props;

			return (
				<Fieldset {...props}>
					<NodeList parent={node} />
					<FieldPalettePopover
						accepts={(template) => canContain(node, template)}
						onSelect={(template) =>
							onInsert(template, node.id, node.children.length)
						}
					>
						{(toggle) => (
							<Button
								variant="subtle"
								size="compact-xs"
								leftSection={<IconPlus size={12} />}
								className={classes.containerAdd}
								onClick={toggle}
							>
								Add to {getNodeLabel(node)}
							</Button>
						)}
					</FieldPalettePopover>
				</Fieldset>
			);
		}
	}
}

function RowContent({ row }: { row: RowNode }) {
	const { setNodeRef } = useDroppable({
		id: zoneId(row.id),
		data: { type: "zone", containerId: row.id } satisfies DropData,
	});

	return (
		<SortableContext
			items={row.children.map((child) => child.id)}
			strategy={rectSortingStrategy}
		>
			<div ref={setNodeRef} className={classes.rowZone}>
				{row.children.length === 0 ? (
					<Text size="sm" c="dimmed" ta="center" className={classes.rowEmpty}>
						Drag fields here, or use the + button above
					</Text>
				) : (
					<Grid {...row.props}>
						{row.children.map((child) => (
							<SortableNode key={child.id} id={child.id} parentId={row.id}>
								{({ ref, style, handle, isDragging }) => (
									<Grid.Col ref={ref} style={style} span={getColSpan(child)}>
										<NodeFrame
											node={child}
											handle={handle}
											isDragging={isDragging}
										>
											<NodeContent node={child} />
										</NodeFrame>
									</Grid.Col>
								)}
							</SortableNode>
						))}
					</Grid>
				)}
			</div>
		</SortableContext>
	);
}

function NodeList({ parent }: { parent: ContainerNode | null }) {
	const { nodes, settings } = useCanvas();
	const children = parent ? parent.children : nodes;
	const { setNodeRef } = useDroppable({
		id: parent ? zoneId(parent.id) : ROOT_ZONE,
		data: { type: "zone", containerId: parent?.id ?? null } satisfies DropData,
	});

	return (
		<SortableContext
			items={children.map((child) => child.id)}
			strategy={verticalListSortingStrategy}
		>
			<div
				ref={setNodeRef}
				className={classes.nodeList}
				style={
					{
						"--list-gap": `var(--mantine-spacing-${settings.gap})`,
					} as CSSProperties
				}
			>
				{children.map((child, index) => (
					<SortableNode
						key={child.id}
						id={child.id}
						parentId={parent?.id ?? null}
					>
						{({ ref, style, handle, isDragging }) => (
							<div ref={ref} style={style}>
								<NodeFrame node={child} handle={handle} isDragging={isDragging}>
									<NodeContent node={child} />
								</NodeFrame>
								{index < children.length - 1 && (
									<InsertPoint
										parent={parent}
										index={index + 1}
										label={`Insert after ${getNodeLabel(child)}`}
									/>
								)}
							</div>
						)}
					</SortableNode>
				))}
			</div>
		</SortableContext>
	);
}

function isAfter(active: Active, over: Over, horizontal: boolean) {
	const rect = active.rect.current.translated;

	if (!rect) {
		return false;
	}

	return horizontal
		? rect.left + rect.width / 2 > over.rect.left + over.rect.width / 2
		: rect.top + rect.height / 2 > over.rect.top + over.rect.height / 2;
}

function DragPreview({ node }: { node: BuilderNode }) {
	const Icon = getNodeIcon(node);

	return (
		<Paper shadow="md" radius="md" withBorder className={classes.dragPreview}>
			<Group gap="sm" wrap="nowrap">
				<ThemeIcon variant="light" size="md" radius="sm">
					<Icon size={16} stroke={1.5} />
				</ThemeIcon>
				<div>
					<Text size="sm" fw={500} truncate>
						{getNodeLabel(node)}
					</Text>
					<Text size="xs" c="dimmed">
						{getTypeLabel(node)}
					</Text>
				</div>
			</Group>
		</Paper>
	);
}

interface FormCanvasProps extends CanvasContextValue {
	/** Receives the final tree once a drag ends. Moves during the drag stay local so nothing is persisted mid-drag. */
	onDrop: (nodes: BuilderNode[]) => void;
}

interface DragState {
	dragged: BuilderNode;
	/** The dragged container's own zones and descendants, which it cannot be dropped into. */
	inside: Set<string>;
	/** Container kinds never change mid-drag, so this lookup stays valid while nodes move. */
	containers: Map<string, ContainerNode>;
}

export const FormCanvas = memo(function FormCanvas({
	nodes: savedNodes,
	settings,
	fieldKeys,
	selectedId,
	onSelect,
	onInsert,
	onDuplicate,
	onDelete,
	onMove,
	onDrop,
}: FormCanvasProps) {
	const dndId = useId();
	const [activeId, setActiveId] = useState<string | null>(null);
	const [dragNodes, setDragNodes] = useState<BuilderNode[] | null>(null);
	const nodes = dragNodes ?? savedNodes;
	const nodesRef = useRef(nodes);
	nodesRef.current = nodes;
	const drag = useRef<DragState | null>(null);
	const movedContainer = useRef(false);
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
	);
	const activeNode = activeId ? findNode(nodes, activeId) : null;
	const context = useMemo(
		() => ({
			nodes,
			settings,
			fieldKeys,
			selectedId,
			onSelect,
			onInsert,
			onDuplicate,
			onDelete,
			onMove,
		}),
		[
			nodes,
			settings,
			fieldKeys,
			selectedId,
			onSelect,
			onInsert,
			onDuplicate,
			onDelete,
			onMove,
		],
	);

	const collisionDetection: CollisionDetection = (args) => {
		const state = drag.current;

		if (!state) {
			return closestCenter(args);
		}

		if (movedContainer.current) {
			return [{ id: args.active.id }];
		}

		const droppableContainers = args.droppableContainers.filter((droppable) => {
			const data = droppable.data.current as DropData | undefined;

			if (!data || state.inside.has(String(droppable.id))) {
				return false;
			}

			const targetId = data.type === "zone" ? data.containerId : data.parentId;
			const target = targetId ? (state.containers.get(targetId) ?? null) : null;

			return canContain(target, state.dragged);
		});
		const hits = pointerWithin({ ...args, droppableContainers });

		if (hits.length === 0) {
			return closestCenter({ ...args, droppableContainers });
		}

		const area = (id: string | number) => {
			const rect = args.droppableRects.get(id);
			return rect ? rect.width * rect.height : Number.POSITIVE_INFINITY;
		};

		return [...hits].sort((a, b) => area(a.id) - area(b.id)).slice(0, 1);
	};

	const moveDragged = (id: string, parentId: string | null, index: number) => {
		if ((getParent(nodesRef.current, id)?.id ?? null) !== parentId) {
			movedContainer.current = true;
			requestAnimationFrame(() => {
				movedContainer.current = false;
			});
		}

		const next = moveNode(nodesRef.current, id, parentId, index);
		nodesRef.current = next;
		setDragNodes(next);
	};

	const endDrag = () => {
		drag.current = null;
		movedContainer.current = false;
		setActiveId(null);
		setDragNodes(null);
	};

	const handleDragStart = ({ active }: DragStartEvent) => {
		const id = String(active.id);
		const dragged = findNode(nodes, id);

		if (!dragged) {
			return;
		}

		const all = flattenNodes(nodes);
		drag.current = {
			dragged,
			inside: new Set(
				isContainer(dragged)
					? [
							zoneId(dragged.id),
							...flattenNodes(dragged.children).flatMap((node) => [
								node.id,
								zoneId(node.id),
							]),
						]
					: [],
			),
			containers: new Map(
				all.filter(isContainer).map((node) => [node.id, node] as const),
			),
		};
		setActiveId(id);
	};

	const handleDragOver = ({ active, over }: DragOverEvent) => {
		if (!over || over.id === active.id) {
			return;
		}

		const current = nodesRef.current;
		const id = String(active.id);
		const fromParent = getParent(current, id)?.id ?? null;
		const data = over.data.current as DropData | undefined;

		if (!data) {
			return;
		}

		if (data.type === "zone") {
			if (data.containerId !== fromParent) {
				moveDragged(
					id,
					data.containerId,
					getSiblings(current, data.containerId).length,
				);
			}

			return;
		}

		if (data.parentId === fromParent) {
			return;
		}

		const target = data.parentId ? findNode(current, data.parentId) : null;
		const siblings = getSiblings(current, data.parentId);
		const overIndex = siblings.findIndex((node) => node.id === over.id);
		const after = isAfter(active, over, target?.kind === "row");
		moveDragged(id, data.parentId, overIndex + (after ? 1 : 0));
	};

	const handleDragEnd = ({ active, over }: DragEndEvent) => {
		const current = nodesRef.current;
		const id = String(active.id);
		const data = over?.data.current as DropData | undefined;

		if (over && data?.type === "item" && over.id !== active.id) {
			const { parentId, siblings } = getLocation(current, id);

			if (data.parentId === parentId) {
				moveDragged(
					id,
					parentId,
					siblings.findIndex((node) => node.id === over.id),
				);
			}
		}

		const final = nodesRef.current;
		endDrag();

		if (final !== savedNodes) {
			onDrop(final);
		}
	};

	if (nodes.length === 0) {
		return (
			<Stack gap="md">
				<div>
					<Text fw={600}>Start your form</Text>
					<Text size="sm" c="dimmed">
						Pick a component to add your first field or layout block.
					</Text>
				</div>
				<FieldPalette onSelect={(template) => onInsert(template, null, 0)} />
			</Stack>
		);
	}

	return (
		<CanvasContext value={context}>
			<DndContext
				id={dndId}
				sensors={sensors}
				collisionDetection={collisionDetection}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
				onDragCancel={endDrag}
			>
				<div
					data-drag-active={activeId ? true : undefined}
					className={classes.canvasRoot}
				>
					<NodeList parent={null} />
				</div>
				<DragOverlay dropAnimation={null}>
					{activeNode ? <DragPreview node={activeNode} /> : null}
				</DragOverlay>
			</DndContext>

			<FieldPalettePopover
				onSelect={(template) => onInsert(template, null, nodes.length)}
			>
				{(toggle) => (
					<Button
						fullWidth
						variant="default"
						leftSection={<IconPlus size={16} />}
						className={classes.addField}
						onClick={toggle}
					>
						Add field or layout
					</Button>
				)}
			</FieldPalettePopover>

			<div inert>
				<SubmitRow settings={settings} />
			</div>
		</CanvasContext>
	);
});
