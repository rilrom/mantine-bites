import {
	ActionIcon,
	Button,
	Center,
	CloseButton,
	Drawer,
	Group,
	Menu,
	Paper,
	SegmentedControl,
	Text,
	Title,
	Tooltip,
	useMatches,
} from "@mantine/core";
import {
	useIsomorphicEffect,
	useLocalStorage,
	useMounted,
} from "@mantine/hooks";
import {
	IconArrowBackUp,
	IconCode,
	IconDots,
	IconPencil,
	IconPlayerPlay,
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

type Mode = "build" | "test" | "code";

const MODES: { value: Mode; label: string; icon: typeof IconPencil }[] = [
	{ value: "build", label: "Build", icon: IconPencil },
	{ value: "test", label: "Test", icon: IconPlayerPlay },
	{ value: "code", label: "Code", icon: IconCode },
];

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
	const [mode, setMode] = useState<Mode>("build");
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [justAddedId, setJustAddedId] = useState<string | null>(null);
	const [undo, setUndo] = useState<UndoState | null>(null);
	const [drawerOpened, setDrawerOpened] = useState(false);
	const isStacked = useMatches({ base: true, md: false });
	const mounted = useMounted();

	const { nodes, settings } = document;
	const fieldKeys = useMemo(() => getFieldKeys(flattenFields(nodes)), [nodes]);
	const path = selectedId ? getPath(nodes, selectedId) : [];
	const selected = path.at(-1) ?? null;

	const select = (id: string | null) => {
		setSelectedId(id);
		setJustAddedId(null);
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
		<Inspector
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

				<SegmentedControl
					value={mode}
					onChange={(value) => setMode(value as Mode)}
					className={classes.modes}
					data={MODES.map(({ value, label, icon: Icon }) => ({
						value,
						label: (
							<Center style={{ gap: 6 }}>
								<Icon size={16} stroke={1.5} />
								<span>{label}</span>
							</Center>
						),
					}))}
				/>

				<Tooltip label="Form settings" withArrow>
					<ActionIcon
						variant={
							mode === "build" && selected === null ? "light" : "default"
						}
						size="lg"
						aria-label="Form settings"
						className={classes.more}
						onClick={() => {
							setMode("build");
							select(null);
							openInspector();
						}}
					>
						<IconSettings size={16} />
					</ActionIcon>
				</Tooltip>

				<Menu position="bottom-end" shadow="md" withArrow>
					<Menu.Target>
						<ActionIcon
							variant="default"
							size="lg"
							aria-label="More form actions"
							className={classes.more}
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
			</header>

			{mounted && (
				<div className={classes.body}>
					{mode === "build" && (
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
									title="Field properties"
								>
									{inspector}
								</Drawer>
							) : (
								<aside
									className={classes.inspector}
									aria-label="Field properties"
								>
									{inspector}
								</aside>
							)}
						</>
					)}

					{mode === "test" && (
						<main className={classes.canvas}>
							<Paper withBorder radius="md" className={classes.sheet}>
								<Text size="sm" c="dimmed" mb="lg">
									Fill in the form and submit it to check the validation rules.
								</Text>
								<FormPreview document={document} />
							</Paper>
						</main>
					)}

					{mode === "code" && (
						<main className={classes.code}>
							<CodeView document={document} />
						</main>
					)}
				</div>
			)}
		</div>
	);
}
