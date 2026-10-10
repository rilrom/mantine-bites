import {
	ActionIcon,
	Button,
	CloseButton,
	CopyButton,
	Drawer,
	Group,
	Menu,
	Modal,
	Paper,
	SegmentedControl,
	Stack,
	Text,
	Title,
	useMatches,
} from "@mantine/core";
import {
	useIsomorphicEffect,
	useLocalStorage,
	useMounted,
} from "@mantine/hooks";
import {
	IconArrowBackUp,
	IconCheck,
	IconCode,
	IconCopy,
	IconDots,
	IconEye,
	IconRefresh,
	IconSettings,
	IconTrash,
} from "@tabler/icons-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { CodeView } from "./CodeView";
import {
	DEFAULT_DOCUMENT,
	DEFAULT_SETTINGS,
	type FormDocument,
	type FormSettings,
} from "./defaults";
import classes from "./FormBuilder.module.css";
import { FormCanvas } from "./FormCanvas";
import { FormPreview } from "./FormPreview";
import { getFieldKeys } from "./fieldTypes";
import { generateCode } from "./generateCode";
import { Inspector } from "./Inspector";
import {
	type BuilderNode,
	cloneNode,
	createNode,
	flattenFields,
	getFallbackId,
	getLocation,
	getNodeLabel,
	getPath,
	insertNode,
	moveNode,
	type NodeTemplate,
	removeNode,
	updateNode,
} from "./nodes";

type Panel = "node" | "form";

const STORAGE_KEY = "mantine-bites-form-builder";

function deserialize(value: string | undefined): FormDocument {
	if (!value) {
		return DEFAULT_DOCUMENT;
	}

	try {
		const parsed: Partial<FormDocument> = JSON.parse(value);

		return {
			settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
			nodes: parsed.nodes ?? [],
		};
	} catch {
		return DEFAULT_DOCUMENT;
	}
}

/** Keeps one identity across renders while always calling the latest handler, so the memoized canvas only re-renders when its data changes. */
function useStableHandler<Args extends unknown[]>(
	handler: (...args: Args) => void,
) {
	const ref = useRef(handler);

	useIsomorphicEffect(() => {
		ref.current = handler;
	});

	return useCallback((...args: Args) => ref.current(...args), []);
}

interface UndoState {
	document: FormDocument;
	message: string;
}

export function FormBuilder() {
	const [document, setDocument] = useLocalStorage<FormDocument>({
		key: STORAGE_KEY,
		defaultValue: DEFAULT_DOCUMENT,
		deserialize,
	});
	const [previewOpened, setPreviewOpened] = useState(false);
	const [panel, setPanel] = useState<Panel>("node");
	const [codeOpened, setCodeOpened] = useState(false);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [justAddedId, setJustAddedId] = useState<string | null>(null);
	const [undo, setUndo] = useState<UndoState | null>(null);
	const [drawerOpened, setDrawerOpened] = useState(false);
	const isStacked = useMatches({ base: true, md: false });
	const isPhone = useMatches({ base: true, sm: false });
	const mounted = useMounted();

	const { nodes, settings } = document;
	const fieldKeys = useMemo(() => getFieldKeys(flattenFields(nodes)), [nodes]);
	const code = useMemo(() => generateCode(document), [document]);
	const path = selectedId ? getPath(nodes, selectedId) : [];
	const selected = path.at(-1) ?? null;

	const select = (id: string | null) => {
		setSelectedId(id);
		setJustAddedId(null);

		if (id !== null) {
			setPanel("node");
		}
	};

	const openInspector = () => {
		if (isStacked) {
			setDrawerOpened(true);
		}
	};

	const replaceDocument = (next: FormDocument, message?: string) => {
		setUndo(message ? { document, message } : null);
		setDocument(next);
	};

	const replaceNodes = (next: BuilderNode[], message?: string) =>
		replaceDocument({ ...document, nodes: next }, message);

	const handleInsert = (
		template: NodeTemplate,
		parentId: string | null,
		index: number,
	) => {
		const node = createNode(template);
		replaceNodes(insertNode(nodes, parentId, index, node));
		setSelectedId(node.id);
		setJustAddedId(node.kind === "field" ? node.id : null);
		setPanel("node");
		openInspector();
	};

	const handleChange = (node: BuilderNode) => {
		replaceNodes(updateNode(nodes, node.id, () => node));
	};

	const handleDuplicate = (id: string) => {
		const { parentId, siblings, index } = getLocation(nodes, id);
		const source = siblings[index];

		if (!source) {
			return;
		}

		const copy = cloneNode(source);

		if (copy.kind === "field") {
			copy.label = `${copy.label} copy`;
		}

		replaceNodes(insertNode(nodes, parentId, index + 1, copy));
		select(copy.id);
	};

	const handleDelete = (id: string) => {
		const location = getLocation(nodes, id);
		const deleted = location.siblings[location.index];

		if (!deleted) {
			return;
		}

		replaceNodes(removeNode(nodes, id), `Deleted "${getNodeLabel(deleted)}"`);

		if (path.some((node) => node.id === id)) {
			select(getFallbackId(location));
		}
	};

	const handleMove = (id: string, parentId: string | null, index: number) => {
		replaceNodes(moveNode(nodes, id, parentId, index));
	};

	const handleUndo = () => {
		if (undo) {
			setDocument(undo.document);
			setUndo(null);
		}
	};

	const canvasSelect = useStableHandler((id: string | null) => {
		select(id);
		openInspector();
	});
	const canvasInsert = useStableHandler(handleInsert);
	const canvasDuplicate = useStableHandler(handleDuplicate);
	const canvasDelete = useStableHandler(handleDelete);
	const canvasMove = useStableHandler(handleMove);
	const canvasDrop = useStableHandler((next: BuilderNode[]) =>
		replaceNodes(next),
	);

	const inspector = (
		<Stack gap="lg">
			<SegmentedControl
				fullWidth
				size="xs"
				value={panel}
				onChange={(value) => setPanel(value as Panel)}
				data={[
					{ value: "node", label: "Selection" },
					{ value: "form", label: "Form settings" },
				]}
			/>
			<Inspector
				view={panel}
				path={path}
				fieldKeys={fieldKeys}
				settings={settings}
				autoFocusLabel={selected !== null && selected.id === justAddedId}
				onSelect={select}
				onChange={handleChange}
				onSettingsChange={(next: FormSettings) =>
					replaceDocument({ ...document, settings: next })
				}
			/>
		</Stack>
	);

	return (
		<div className={classes.workspace}>
			<header className={classes.toolbar}>
				<div className={classes.heading}>
					<Title order={1} className={classes.title}>
						Form Builder
					</Title>
					<Text size="sm" c="dimmed" className={classes.description}>
						Build a form with Mantine components and copy the{" "}
						<Text span inherit c="var(--mantine-primary-color-filled)">
							@mantine/form
						</Text>{" "}
						code.
					</Text>
				</div>

				<div className={classes.primaryActions}>
					<Button
						variant="default"
						leftSection={<IconEye size={16} />}
						classNames={{ section: classes.actionIcon }}
						onClick={() => setPreviewOpened(true)}
					>
						Preview
					</Button>

					<Button
						variant="default"
						leftSection={<IconCode size={16} />}
						classNames={{ section: classes.actionIcon }}
						onClick={() => setCodeOpened(true)}
					>
						View code
					</Button>

					<CopyButton value={code}>
						{({ copied, copy }) => (
							<Button
								color={copied ? "teal" : undefined}
								classNames={{ section: classes.actionIcon }}
								leftSection={
									copied ? <IconCheck size={16} /> : <IconCopy size={16} />
								}
								onClick={copy}
							>
								{copied ? "Copied" : "Copy code"}
							</Button>
						)}
					</CopyButton>
				</div>

				<Group gap="xs" wrap="nowrap" className={classes.secondaryActions}>
					{isStacked && (
						<ActionIcon
							variant="default"
							size="lg"
							aria-label="Form settings"
							onClick={() => {
								setPanel("form");
								setDrawerOpened(true);
							}}
						>
							<IconSettings size={16} />
						</ActionIcon>
					)}

					<Menu position="bottom-end" shadow="md" withArrow>
						<Menu.Target>
							<ActionIcon
								variant="default"
								size="lg"
								aria-label="More form actions"
							>
								<IconDots size={16} />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item
								leftSection={<IconRefresh size={14} />}
								onClick={() => {
									replaceDocument(DEFAULT_DOCUMENT, "Loaded the example form");
									select(null);
								}}
							>
								Load example form
							</Menu.Item>
							<Menu.Item
								color="red"
								leftSection={<IconTrash size={14} />}
								disabled={nodes.length === 0}
								onClick={() => {
									replaceNodes([], "Cleared the form");
									select(null);
								}}
							>
								Clear form
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			</header>

			{mounted && (
				<div className={classes.body}>
					<>
						<div className={classes.canvasFrame}>
							<main className={classes.canvas}>
								<Paper withBorder radius="md" className={classes.sheet}>
									<FormCanvas
										nodes={nodes}
										settings={settings}
										fieldKeys={fieldKeys}
										selectedId={selected?.id ?? null}
										onSelect={canvasSelect}
										onInsert={canvasInsert}
										onDuplicate={canvasDuplicate}
										onDelete={canvasDelete}
										onMove={canvasMove}
										onDrop={canvasDrop}
									/>
								</Paper>
							</main>

							{undo && (
								<Paper shadow="md" radius="md" className={classes.undo}>
									<Text size="sm" className={classes.undoMessage}>
										{undo.message}
									</Text>
									<Group gap={4} wrap="nowrap">
										<Button
											size="compact-sm"
											variant="subtle"
											leftSection={<IconArrowBackUp size={14} />}
											onClick={handleUndo}
										>
											Undo
										</Button>
										<CloseButton
											size="sm"
											aria-label="Dismiss"
											onClick={() => setUndo(null)}
										/>
									</Group>
								</Paper>
							)}
						</div>

						{isStacked ? (
							<Drawer
								opened={drawerOpened}
								onClose={() => setDrawerOpened(false)}
								position="bottom"
								size="80%"
								title="Edit form"
							>
								{inspector}
							</Drawer>
						) : (
							<aside className={classes.inspector} aria-label="Properties">
								{inspector}
							</aside>
						)}
					</>
				</div>
			)}

			<Modal
				opened={previewOpened}
				onClose={() => setPreviewOpened(false)}
				title="Preview"
				size="40rem"
				fullScreen={isPhone}
			>
				<FormPreview document={document} />
			</Modal>

			<Modal
				opened={codeOpened}
				onClose={() => setCodeOpened(false)}
				title="Code"
				size="72rem"
				fullScreen={isPhone}
			>
				<CodeView document={document} />
			</Modal>
		</div>
	);
}
