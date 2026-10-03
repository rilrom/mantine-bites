import { CodeHighlight } from "@mantine/code-highlight";
import { Button, Code, CopyButton, Group, Stack, Text } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useMemo } from "react";
import { InstallScript } from "../InstallScript/InstallScript";
import type { FormDocument } from "./defaults";
import { usesDates } from "./fieldTypes";
import { generateCode } from "./generateCode";
import { flattenFields } from "./nodes";

interface CodeViewProps {
	document: FormDocument;
}

export function CodeView({ document }: CodeViewProps) {
	const code = useMemo(() => generateCode(document), [document]);
	const withDates = usesDates(flattenFields(document.nodes));

	return (
		<Stack gap="lg">
			<Stack gap="xs">
				<Text fw={600}>1. Install dependencies</Text>
				<Text size="sm" c="dimmed">
					Assumes <Code>@mantine/core</Code> is already set up.
				</Text>
				<InstallScript
					packages={
						withDates ? "@mantine/form @mantine/dates dayjs" : "@mantine/form"
					}
				/>
				{withDates && (
					<Text size="sm" c="dimmed">
						Date fields also need{" "}
						<Code>import '@mantine/dates/styles.css'</Code> at the root of your
						app.
					</Text>
				)}
			</Stack>

			<Stack gap="xs">
				<Group justify="space-between">
					<Text fw={600}>2. Copy the component</Text>
					<CopyButton value={code}>
						{({ copied, copy }) => (
							<Button
								size="xs"
								color={copied ? "teal" : undefined}
								leftSection={
									copied ? <IconCheck size={14} /> : <IconCopy size={14} />
								}
								onClick={copy}
							>
								{copied ? "Copied" : "Copy code"}
							</Button>
						)}
					</CopyButton>
				</Group>
				<CodeHighlight
					code={code}
					language="tsx"
					radius="md"
					withCopyButton={false}
				/>
			</Stack>
		</Stack>
	);
}
