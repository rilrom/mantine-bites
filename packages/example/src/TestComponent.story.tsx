import { TestComponent } from "./TestComponent.js";

export default { title: "TestComponent" };

export function Usage() {
	return (
		<div style={{ padding: 40 }}>
			<TestComponent label="test" />
		</div>
	);
}
