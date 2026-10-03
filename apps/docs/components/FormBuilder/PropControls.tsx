import {
	Input,
	NumberInput,
	SegmentedControl,
	Select,
	Stack,
	Switch,
	Textarea,
	TextInput,
} from "@mantine/core";
import type { PropDef, PropValue, PropValues } from "./props";

interface PropControlProps {
	def: PropDef;
	value: PropValue | undefined;
	onChange: (value: PropValue | undefined) => void;
}

function PropControl({ def, value, onChange }: PropControlProps) {
	const { control, label, description } = def;
	const fallback = def.default === undefined ? undefined : String(def.default);

	switch (control.type) {
		case "text":
			return (
				<TextInput
					label={label}
					description={description}
					placeholder={control.placeholder ?? fallback}
					value={typeof value === "string" ? value : ""}
					onChange={(event) => onChange(event.currentTarget.value)}
				/>
			);
		case "textarea":
			return (
				<Textarea
					label={label}
					description={description}
					autosize
					minRows={2}
					value={typeof value === "string" ? value : ""}
					onChange={(event) => onChange(event.currentTarget.value)}
				/>
			);
		case "number":
			return (
				<NumberInput
					label={label}
					description={description}
					placeholder={fallback}
					min={control.min}
					max={control.max}
					step={control.step}
					value={typeof value === "number" ? value : ""}
					onChange={(next) =>
						onChange(typeof next === "number" ? next : undefined)
					}
				/>
			);
		case "switch":
			return (
				<Switch
					label={label}
					description={description}
					checked={Boolean(value ?? def.default)}
					onChange={(event) => onChange(event.currentTarget.checked)}
				/>
			);
		case "select":
			return (
				<Select
					label={label}
					description={description}
					data={control.data}
					placeholder={fallback ?? "Default"}
					clearable={def.default === undefined}
					allowDeselect={false}
					value={value === undefined ? (fallback ?? null) : String(value)}
					onChange={(next) => onChange(next ?? undefined)}
				/>
			);
		default: {
			const data =
				def.default === undefined
					? [{ value: "", label: "none" }, ...control.data]
					: control.data;

			return (
				<Input.Wrapper label={label} description={description}>
					<SegmentedControl
						fullWidth
						size="xs"
						mt={4}
						data={data}
						value={value === undefined ? (fallback ?? "") : String(value)}
						onChange={onChange}
					/>
				</Input.Wrapper>
			);
		}
	}
}

interface PropControlsProps {
	defs: PropDef[];
	values: PropValues;
	onChange: (def: PropDef, value: PropValue | undefined) => void;
}

export function PropControls({ defs, values, onChange }: PropControlsProps) {
	return (
		<Stack gap="sm">
			{defs.map((def) => (
				<PropControl
					key={def.name}
					def={def}
					value={values[def.name]}
					onChange={(value) => onChange(def, value)}
				/>
			))}
		</Stack>
	);
}
