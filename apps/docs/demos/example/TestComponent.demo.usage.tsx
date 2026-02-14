import { TestComponent } from "@mantine-bites/example";
import type { MantineDemo } from "@mantinex/demo";

const code = `
import { TestComponent } from '@mantine-bites/example';

function Demo() {
  return <TestComponent label="Test component usage demo" />;
}
`;

function Demo() {
	return <TestComponent label="Test component usage demo" />;
}

export const usage: MantineDemo = {
	type: "code",
	component: Demo,
	code,
	centered: true,
};
