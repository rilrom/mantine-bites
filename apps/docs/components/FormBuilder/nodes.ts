import { randomId } from "@mantine/hooks";
import {
	type BuilderField,
	FIELD_TYPES,
	type FieldType,
	getDefaultOptions,
} from "./fieldTypes";
import {
	alignProp,
	colorProp,
	disabledProp,
	type PropDef,
	type PropValues,
	radiusProp,
	SIZES,
	textColorProp,
} from "./props";

export type ContentType = "title" | "text" | "divider" | "space" | "alert";

export type ContainerKind = "row" | "fieldset";

export interface ContentNode {
	kind: "content";
	id: string;
	type: ContentType;
	props: PropValues;
	span?: number;
}

export type LeafNode = BuilderField | ContentNode;

export interface RowNode {
	kind: "row";
	id: string;
	props: PropValues;
	children: LeafNode[];
}

export interface FieldsetNode {
	kind: "fieldset";
	id: string;
	props: PropValues;
	children: (RowNode | LeafNode)[];
}

export type ContainerNode = RowNode | FieldsetNode;

export type BuilderNode = LeafNode | ContainerNode;

interface NodeDefinition {
	label: string;
	component: string;
	props: PropDef[];
	initialProps: PropValues;
}

/** The `children` prop is printed as the element's text content instead of an attribute. */
export const TEXT_CHILD = "children";

export const CONTENT_TYPES: Record<ContentType, NodeDefinition> = {
	title: {
		label: "Title",
		component: "Title",
		props: [
			{ name: TEXT_CHILD, label: "Text", control: { type: "text" } },
			{
				name: "order",
				label: "Heading level",
				control: { type: "number", min: 1, max: 6 },
				default: 1,
			},
			alignProp,
			textColorProp,
		],
		initialProps: { children: "Section title", order: 4 },
	},
	text: {
		label: "Text",
		component: "Text",
		props: [
			{ name: TEXT_CHILD, label: "Text", control: { type: "textarea" } },
			{
				name: "size",
				label: "Size",
				control: { type: "radio", data: SIZES },
				default: "md",
			},
			textColorProp,
			alignProp,
		],
		initialProps: {
			children: "Add some helpful text here.",
			size: "sm",
			c: "dimmed",
		},
	},
	divider: {
		label: "Divider",
		component: "Divider",
		props: [
			{ name: "label", label: "Label", control: { type: "text" } },
			{
				name: "labelPosition",
				label: "Label position",
				control: { type: "radio", data: ["left", "center", "right"] },
				default: "center",
			},
			{
				name: "variant",
				label: "Variant",
				control: { type: "radio", data: ["solid", "dashed", "dotted"] },
				default: "solid",
			},
			{
				name: "my",
				label: "Vertical margin",
				control: { type: "radio", data: SIZES },
			},
		],
		initialProps: {},
	},
	space: {
		label: "Space",
		component: "Space",
		props: [
			{
				name: "h",
				label: "Height",
				control: { type: "radio", data: SIZES },
			},
		],
		initialProps: { h: "md" },
	},
	alert: {
		label: "Alert",
		component: "Alert",
		props: [
			{ name: "title", label: "Title", control: { type: "text" } },
			{ name: TEXT_CHILD, label: "Message", control: { type: "textarea" } },
			colorProp(),
			{
				name: "variant",
				label: "Variant",
				control: {
					type: "radio",
					data: ["light", "filled", "outline", "default"],
				},
				default: "light",
			},
			radiusProp,
		],
		initialProps: {
			title: "Heads up",
			children: "Explain something important about this form.",
		},
	},
};

export const CONTAINER_TYPES: Record<ContainerKind, NodeDefinition> = {
	row: {
		label: "Row",
		component: "Grid",
		props: [
			{
				name: "gap",
				label: "Gap",
				control: { type: "radio", data: SIZES },
				default: "md",
			},
			{
				name: "align",
				label: "Vertical alignment",
				control: {
					type: "select",
					data: ["stretch", "flex-start", "center", "flex-end"],
				},
				default: "stretch",
			},
		],
		initialProps: {},
	},
	fieldset: {
		label: "Fieldset",
		component: "Fieldset",
		props: [
			{ name: "legend", label: "Legend", control: { type: "text" } },
			{
				name: "variant",
				label: "Variant",
				control: {
					type: "radio",
					data: ["default", "filled", "unstyled"],
				},
				default: "default",
			},
			radiusProp,
			{
				...disabledProp,
				description: "Disables every input inside the fieldset",
			},
		],
		initialProps: { legend: "Details" },
	},
};

export const SPANS = [3, 4, 5, 6, 7, 8, 9];

export type NodeTemplate =
	| { kind: "field"; type: FieldType }
	| { kind: "content"; type: ContentType }
	| { kind: ContainerKind };

function createId(prefix: string) {
	return randomId(`${prefix}-`);
}

function createField(type: FieldType): BuilderField {
	return {
		kind: "field",
		id: createId("field"),
		label: FIELD_TYPES[type].label,
		type,
		options: getDefaultOptions(type),
		rules: {},
		props: {},
	};
}

export function createNode(template: NodeTemplate): BuilderNode {
	switch (template.kind) {
		case "field":
			return createField(template.type);
		case "content":
			return {
				kind: "content",
				id: createId("content"),
				type: template.type,
				props: { ...CONTENT_TYPES[template.type].initialProps },
			};
		default:
			return {
				kind: template.kind,
				id: createId(template.kind),
				props: { ...CONTAINER_TYPES[template.kind].initialProps },
				children: [],
			};
	}
}

export function isContainer(node: BuilderNode): node is ContainerNode {
	return node.kind === "row" || node.kind === "fieldset";
}

/** Rows hold only leaves and fieldsets cannot nest, which caps the tree at root, fieldset, row, leaf. */
export function canContain(
	parent: ContainerNode | null,
	child: BuilderNode | NodeTemplate,
) {
	if (!parent) {
		return true;
	}

	if (parent.kind === "row") {
		return child.kind === "field" || child.kind === "content";
	}

	return child.kind !== "fieldset";
}

export function getNodeLabel(node: BuilderNode) {
	switch (node.kind) {
		case "field":
			return node.label.trim() || "Untitled";
		case "content": {
			const text = node.props.children ?? node.props.label ?? node.props.title;
			return typeof text === "string" && text.trim()
				? text.trim()
				: CONTENT_TYPES[node.type].label;
		}
		case "fieldset": {
			const legend = node.props.legend;
			return typeof legend === "string" && legend.trim()
				? legend.trim()
				: "Fieldset";
		}
		default:
			return "Row";
	}
}

export function getTypeLabel(node: BuilderNode) {
	switch (node.kind) {
		case "field":
			return `${FIELD_TYPES[node.type].label} field`;
		case "content":
			return CONTENT_TYPES[node.type].label;
		default:
			return CONTAINER_TYPES[node.kind].label;
	}
}

export function getPropDefs(node: BuilderNode) {
	switch (node.kind) {
		case "field":
			return FIELD_TYPES[node.type].props;
		case "content":
			return CONTENT_TYPES[node.type].props;
		default:
			return CONTAINER_TYPES[node.kind].props;
	}
}

export function flattenFields(nodes: BuilderNode[]): BuilderField[] {
	return nodes.flatMap((node) => {
		if (node.kind === "field") {
			return [node];
		}

		return isContainer(node) ? flattenFields(node.children) : [];
	});
}

export function flattenNodes(nodes: BuilderNode[]): BuilderNode[] {
	return nodes.flatMap((node) =>
		isContainer(node) ? [node, ...flattenNodes(node.children)] : [node],
	);
}

/** Returns the node with its ancestors, outermost first, or an empty array when the id is unknown. */
export function getPath(nodes: BuilderNode[], id: string): BuilderNode[] {
	for (const node of nodes) {
		if (node.id === id) {
			return [node];
		}

		if (isContainer(node)) {
			const path = getPath(node.children, id);

			if (path.length > 0) {
				return [node, ...path];
			}
		}
	}

	return [];
}

export function findNode(nodes: BuilderNode[], id: string) {
	return getPath(nodes, id).at(-1) ?? null;
}

export function getSiblings(nodes: BuilderNode[], parentId: string | null) {
	if (parentId === null) {
		return nodes;
	}

	const parent = findNode(nodes, parentId);

	return parent && isContainer(parent) ? parent.children : [];
}

export function getLocation(nodes: BuilderNode[], id: string) {
	const path = getPath(nodes, id);
	const ancestor = path.at(-2);
	const parent = ancestor && isContainer(ancestor) ? ancestor : null;
	const siblings: BuilderNode[] = parent ? parent.children : nodes;

	return {
		parent,
		parentId: parent?.id ?? null,
		siblings,
		index: siblings.findIndex((node) => node.id === id),
	};
}

/** Picks what to select after a node is removed. The next sibling wins, then the previous one, then the parent. */
export function getFallbackId({
	parent,
	siblings,
	index,
}: ReturnType<typeof getLocation>) {
	return (siblings[index + 1] ?? siblings[index - 1] ?? parent)?.id ?? null;
}

function withChildren(node: ContainerNode, children: BuilderNode[]) {
	return children === node.children
		? node
		: ({ ...node, children } as ContainerNode);
}

function mapNodes(
	nodes: BuilderNode[],
	map: (node: BuilderNode) => BuilderNode,
): BuilderNode[] {
	const next = nodes.map(map);
	return next.every((node, index) => node === nodes[index]) ? nodes : next;
}

function mapChildren(
	nodes: BuilderNode[],
	parentId: string | null,
	update: (children: BuilderNode[]) => BuilderNode[],
): BuilderNode[] {
	if (parentId === null) {
		return update(nodes);
	}

	return mapNodes(nodes, (node) => {
		if (!isContainer(node)) {
			return node;
		}

		if (node.id === parentId) {
			return withChildren(node, update(node.children));
		}

		return withChildren(node, mapChildren(node.children, parentId, update));
	});
}

export function updateNode(
	nodes: BuilderNode[],
	id: string,
	update: (node: BuilderNode) => BuilderNode,
): BuilderNode[] {
	return mapNodes(nodes, (node) => {
		if (node.id === id) {
			return update(node);
		}

		return isContainer(node)
			? withChildren(node, updateNode(node.children, id, update))
			: node;
	});
}

export function insertNode(
	nodes: BuilderNode[],
	parentId: string | null,
	index: number,
	node: BuilderNode,
) {
	return mapChildren(nodes, parentId, (children) => [
		...children.slice(0, index),
		node,
		...children.slice(index),
	]);
}

export function removeNode(nodes: BuilderNode[], id: string): BuilderNode[] {
	if (nodes.some((node) => node.id === id)) {
		return nodes.filter((node) => node.id !== id);
	}

	return mapNodes(nodes, (node) =>
		isContainer(node)
			? withChildren(node, removeNode(node.children, id))
			: node,
	);
}

export function moveNode(
	nodes: BuilderNode[],
	id: string,
	parentId: string | null,
	index: number,
) {
	const node = findNode(nodes, id);

	if (!node) {
		return nodes;
	}

	return insertNode(removeNode(nodes, id), parentId, index, node);
}

export function cloneNode(node: BuilderNode): BuilderNode {
	if (isContainer(node)) {
		return {
			...node,
			id: createId(node.kind),
			children: node.children.map(cloneNode),
		} as ContainerNode;
	}

	return { ...node, id: createId(node.kind) };
}
