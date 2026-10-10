import {
	type Active,
	type CollisionDetection,
	closestCenter,
	DndContext,
	type DragEndEvent,
	type DragMoveEvent,
	DragOverlay,
	type DragStartEvent,
	type Modifier,
	type Over,
	PointerSensor,
	pointerWithin,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	type SortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { type Coordinates, CSS, getEventCoordinates } from "@dnd-kit/utilities";
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
import { useReducedMotion } from "@mantine/hooks";
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
	type Ref,
	use,
	useId,
	useLayoutEffect,
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

/** Nodes stay in place while dragging, and the drop indicator shows where the dragged node will land. */
const keepInPlace: SortingStrategy = () => null;

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

interface DropTarget {
	parentId: string | null;
	/** Position among the target's children once the dragged node is removed, as `moveNode` expects. */
	index: number;
	/** Whether the target's siblings sit side by side, so the indicator runs vertically between them. */
	horizontal: boolean;
}

interface CanvasState extends CanvasContextValue {
	activeId: string | null;
	dropTarget: DropTarget | null;
}

const CanvasContext = createContext<CanvasState | null>(null);

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
			data-frame-id={node.id}
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

function useDropSlots(parentId: string | null, children: BuilderNode[]) {
	const { activeId, dropTarget } = useCanvas();

	if (dropTarget?.parentId !== parentId) {
		return { targeted: false, horizontal: false, getSlot: () => undefined };
	}

	const remaining = children.filter((child) => child.id !== activeId);
	const before = remaining[dropTarget.index]?.id;
	const after = before ? undefined : remaining.at(-1)?.id;

	return {
		targeted: true,
		horizontal: dropTarget.horizontal,
		getSlot: (id: string) =>
			id === before ? "before" : id === after ? "after" : undefined,
	};
}

function RowContent({ row }: { row: RowNode }) {
	const { targeted, horizontal, getSlot } = useDropSlots(row.id, row.children);
	const { setNodeRef } = useDroppable({
		id: zoneId(row.id),
		data: { type: "zone", containerId: row.id } satisfies DropData,
	});

	return (
		<SortableContext
			items={row.children.map((child) => child.id)}
			strategy={keepInPlace}
		>
			<div
				ref={setNodeRef}
				className={classes.rowZone}
				data-drop-target={targeted || undefined}
			>
				{row.children.length === 0 ? (
					<Text size="sm" c="dimmed" ta="center" className={classes.rowEmpty}>
						Drag fields here, or use the + button above
					</Text>
				) : (
					<Grid {...row.props}>
						{row.children.map((child) => (
							<SortableNode key={child.id} id={child.id} parentId={row.id}>
								{({ ref, style, handle, isDragging }) => (
									<Grid.Col
										ref={ref}
										style={style}
										span={getColSpan(child)}
										className={classes.columnSlot}
										data-drop={getSlot(child.id)}
										data-stacked={!horizontal || undefined}
									>
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
	const { targeted, getSlot } = useDropSlots(parent?.id ?? null, children);
	const { setNodeRef } = useDroppable({
		id: parent ? zoneId(parent.id) : ROOT_ZONE,
		data: { type: "zone", containerId: parent?.id ?? null } satisfies DropData,
	});

	return (
		<SortableContext
			items={children.map((child) => child.id)}
			strategy={keepInPlace}
		>
			<div
				ref={setNodeRef}
				className={classes.nodeList}
				data-drop-target={(parent && targeted) || undefined}
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
							<div
								ref={ref}
								style={style}
								className={classes.listSlot}
								data-drop={getSlot(child.id)}
							>
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

function getDragStart(activatorEvent: Event | null) {
	return activatorEvent ? getEventCoordinates(activatorEvent) : null;
}

function getPointer({
	activatorEvent,
	delta,
}: DragMoveEvent): Coordinates | null {
	const start = getDragStart(activatorEvent);

	return start ? { x: start.x + delta.x, y: start.y + delta.y } : null;
}

/** Row columns wrap onto their own lines on narrow screens, so this checks the rendered layout rather than the row's spans. */
function sharesLine(id: string) {
	const column = document.querySelector(
		`[data-frame-id="${id}"]`,
	)?.parentElement;

	if (!column?.parentElement) {
		return false;
	}

	const top = column.getBoundingClientRect().top;
	const columns = column.parentElement.querySelectorAll(
		`:scope > .${classes.columnSlot}`,
	);

	return Array.from(columns).some(
		(other) =>
			other !== column &&
			Math.abs(other.getBoundingClientRect().top - top) < 1,
	);
}

function isAfter(pointer: Coordinates | null, over: Over, horizontal: boolean) {
	if (!pointer) {
		return false;
	}

	return horizontal
		? pointer.x > over.rect.left + over.rect.width / 2
		: pointer.y > over.rect.top + over.rect.height / 2;
}

interface DragPreviewProps {
	node: BuilderNode;
	ref: Ref<HTMLDivElement>;
}

function DragPreview({ node, ref }: DragPreviewProps) {
	const Icon = getNodeIcon(node);

	return (
		<Paper
			ref={ref}
			shadow="md"
			radius="md"
			withBorder
			className={classes.dragPreview}
		>
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

/** Keeps the drag preview beside the cursor, since it would otherwise sit at the source node's top left corner, which is far away for wide fields. */
const followCursor: Modifier = ({
	activatorEvent,
	draggingNodeRect,
	transform,
}) => {
	const start = getDragStart(activatorEvent);

	if (!draggingNodeRect || !start) {
		return transform;
	}

	return {
		...transform,
		x: transform.x + start.x - draggingNodeRect.left - 12,
		y: transform.y + start.y - draggingNodeRect.top - 20,
	};
};

const MOVE_TIMING: KeyframeAnimationOptions = { duration: 200, easing: "ease" };

/** Grows the dropped node out of the drag preview's box rather than scaling it, so its contents never look squashed. */
function growFromPreview(frame: HTMLElement, preview: DOMRect, rect: DOMRect) {
	const radius = getComputedStyle(frame).borderRadius;
	const right = Math.max(0, rect.width - preview.width);
	const bottom = Math.max(0, rect.height - preview.height);

	frame.animate(
		[
			{
				transform: `translate(${preview.left - rect.left}px, ${preview.top - rect.top}px)`,
				clipPath: `inset(0 ${right}px ${bottom}px 0 round ${radius})`,
				opacity: 0.6,
			},
			{
				transform: "none",
				clipPath: `inset(0 0 0 0 round ${radius})`,
				opacity: 1,
			},
		],
		MOVE_TIMING,
	);
}

function measureFrames(root: HTMLElement) {
	const frames = new Map<string, { frame: HTMLElement; rect: DOMRect }>();

	for (const frame of root.querySelectorAll<HTMLElement>("[data-frame-id]")) {
		if (frame.dataset.frameId) {
			frames.set(frame.dataset.frameId, {
				frame,
				rect: frame.getBoundingClientRect(),
			});
		}
	}

	return frames;
}

interface FormCanvasProps extends CanvasContextValue {
	/** Receives the final tree once a drag ends. */
	onDrop: (nodes: BuilderNode[]) => void;
}

interface DragState {
	dragged: BuilderNode;
	/** The dragged container's own zones and descendants, which it cannot be dropped into. */
	inside: Set<string>;
	containers: Map<string, ContainerNode>;
}

function getDropTarget(
	nodes: BuilderNode[],
	active: Active,
	over: Over | null,
	pointer: Coordinates | null,
): DropTarget | null {
	const data = over?.data.current as DropData | undefined;

	if (!over || !data || over.id === active.id) {
		return null;
	}

	const id = String(active.id);
	const from = getLocation(nodes, id);

	if (data.type === "zone") {
		if (data.containerId === from.parentId) {
			return null;
		}

		const children = getSiblings(nodes, data.containerId);
		const last = children.at(-1);

		return {
			parentId: data.containerId,
			index: children.length,
			horizontal: last ? sharesLine(last.id) : false,
		};
	}

	const siblings = getSiblings(nodes, data.parentId);
	const parent = data.parentId ? findNode(nodes, data.parentId) : null;
	const remaining = siblings.filter((node) => node.id !== id);
	const overIndex = remaining.findIndex((node) => node.id === over.id);
	const horizontal = parent?.kind === "row" && sharesLine(String(over.id));
	const index = overIndex + (isAfter(pointer, over, horizontal) ? 1 : 0);

	if (data.parentId === from.parentId && from.index === index) {
		return null;
	}

	return { parentId: data.parentId, index, horizontal };
}

export const FormCanvas = memo(function FormCanvas({
	nodes,
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
	const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
	const drag = useRef<DragState | null>(null);
	const rootRef = useRef<HTMLDivElement>(null);
	const previewRef = useRef<HTMLDivElement>(null);
	const pendingMove = useRef<{
		id: string;
		frames: ReturnType<typeof measureFrames>;
		preview: DOMRect | undefined;
	}>(null);
	const reduceMotion = useReducedMotion();
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
			activeId,
			dropTarget,
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
			activeId,
			dropTarget,
		],
	);

	const collisionDetection: CollisionDetection = (args) => {
		const state = drag.current;

		if (!state) {
			return closestCenter(args);
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
			return closestCenter({
				...args,
				droppableContainers: droppableContainers.filter((droppable) => {
					const data = droppable.data.current as DropData | undefined;
					return data?.type === "item" && data.parentId === null;
				}),
			});
		}

		const area = (id: string | number) => {
			const rect = args.droppableRects.get(id);
			return rect ? rect.width * rect.height : Number.POSITIVE_INFINITY;
		};

		return [...hits].sort((a, b) => area(a.id) - area(b.id)).slice(0, 1);
	};

	const endDrag = () => {
		drag.current = null;
		setActiveId(null);
		setDropTarget(null);
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

	const handleDragMove = (event: DragMoveEvent) => {
		const next = getDropTarget(
			nodes,
			event.active,
			event.over,
			getPointer(event),
		);

		setDropTarget((current) =>
			current?.parentId === next?.parentId &&
			current?.index === next?.index &&
			current?.horizontal === next?.horizontal
				? current
				: next,
		);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		const id = String(active.id);
		const target = getDropTarget(nodes, active, over, getPointer(event));
		const final = target
			? moveNode(nodes, id, target.parentId, target.index)
			: nodes;

		if (rootRef.current && !reduceMotion) {
			pendingMove.current = {
				id,
				frames: measureFrames(rootRef.current),
				preview: previewRef.current?.getBoundingClientRect(),
			};
		}

		endDrag();

		if (final !== nodes) {
			onDrop(final);
		}
	};

	// The tree changes as soon as the pointer is released, so every block, including the dropped one, slides from where it was drawn to its new slot.
	useLayoutEffect(() => {
		const move = pendingMove.current;
		pendingMove.current = null;

		if (!move || !rootRef.current) {
			return;
		}

		for (const [nodeId, { frame, rect }] of measureFrames(rootRef.current)) {
			const before = move.frames.get(nodeId)?.rect;

			if (nodeId === move.id) {
				if (move.preview) {
					growFromPreview(frame, move.preview, rect);
				}

				continue;
			}

			if (!before) {
				continue;
			}

			const x = before.left - rect.left;
			const y = before.top - rect.top;

			if (Math.abs(x) >= 1 || Math.abs(y) >= 1) {
				frame.animate(
					[{ transform: `translate(${x}px, ${y}px)` }, { transform: "none" }],
					MOVE_TIMING,
				);
			}
		}
	});

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
				onDragOver={handleDragMove}
				onDragMove={handleDragMove}
				onDragEnd={handleDragEnd}
				onDragCancel={endDrag}
			>
				<div
					ref={rootRef}
					data-drag-active={activeId ? true : undefined}
					className={classes.canvasRoot}
				>
					<NodeList parent={null} />
				</div>
				<DragOverlay dropAnimation={null} modifiers={[followCursor]}>
					{activeNode ? (
						<DragPreview node={activeNode} ref={previewRef} />
					) : null}
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
