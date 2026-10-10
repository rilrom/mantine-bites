import type { FormSettings } from "./defaults";
import { type BuilderField, FIELD_TYPES, getPlaceholder } from "./fieldTypes";
import { type BuilderNode, getPropDefs, TEXT_CHILD } from "./nodes";
import { type ElementProps, type PropValues, pickProps } from "./props";
import { getValidators, type ValidatorSpec } from "./validation";

/** Merges the form-wide input size, derived props, and the field's own props. Later sources win. */
function resolveFieldProps(
	field: BuilderField,
	settings: FormSettings,
): PropValues {
	const definition = FIELD_TYPES[field.type];
	const sizable = definition.props.some((prop) => prop.name === "size");
	const size: PropValues =
		sizable && settings.size !== "sm" ? { size: settings.size } : {};

	return {
		...size,
		...definition.derivedProps?.(field),
		...pickProps(field.props, definition.props),
	};
}

export function splitTextChild(node: BuilderNode) {
	const { [TEXT_CHILD]: text, ...props } = pickProps(
		node.props,
		getPropDefs(node),
	);

	return {
		text: typeof text === "string" && text ? text : undefined,
		props,
	};
}

export function getColSpan(node: BuilderNode) {
	const span =
		node.kind === "field" || node.kind === "content" ? node.span : undefined;

	return { base: 12, sm: span ?? "auto" } as const;
}

export interface OptionItem {
	props: ElementProps;
	text?: string;
}

/** Everything needed to render or print a field, minus the form bindings. */
export interface FieldDescription {
	component: string;
	props: ElementProps;
	/** Props for the `Input.Wrapper`, or `null` when the component has its own label. */
	wrapper: ElementProps | null;
	options: {
		component: string;
		layout: { component: "Group" | "Stack"; props: ElementProps };
		items: OptionItem[];
	} | null;
	checkbox: boolean;
	validators: ValidatorSpec[];
}

const VERTICAL_OPTIONS: ElementProps = { gap: "xs", mt: "xs" };

const OPTIONS_ERROR: PropValues = { mt: "xs" };

function compact(values: Record<string, ElementProps[string] | undefined>) {
	return Object.fromEntries(
		Object.entries(values).filter(([, value]) => value !== undefined),
	) as ElementProps;
}

export function describeField(
	field: BuilderField,
	settings: FormSettings,
): FieldDescription {
	const definition = FIELD_TYPES[field.type];
	const validators = getValidators(field);
	const checkbox = Boolean(definition.checkbox);
	const label = {
		label: field.label,
		description: field.description || undefined,
	};
	const withAsterisk =
		!checkbox && validators.some((validator) => validator.name === "isNotEmpty")
			? true
			: undefined;
	const { orientation, ...resolved } = resolveFieldProps(field, settings);
	const render = definition.options;
	const options =
		render && render !== "data"
			? {
					component: render.component,
					layout:
						orientation === "vertical"
							? { component: "Stack" as const, props: VERTICAL_OPTIONS }
							: { component: "Group" as const, props: render.groupProps },
					items: field.options.map((option) =>
						render.labelAs === "prop"
							? { props: { value: option, label: option, ...resolved } }
							: { props: { value: option, ...resolved }, text: option },
					),
				}
			: null;
	// Input.Wrapper only offsets the error below a real input, so a group of options would sit flush against it.
	const errorProps =
		options && validators.length > 0 ? { errorProps: OPTIONS_ERROR } : {};
	const own = definition.wrapped
		? {}
		: {
				...label,
				placeholder: getPlaceholder(field),
				type: definition.inputType,
			};

	return {
		component: definition.component,
		props: compact({
			...own,
			data: render === "data" ? field.options : undefined,
			...definition.componentProps,
			...(options ? {} : resolved),
			withAsterisk: definition.wrapped ? undefined : withAsterisk,
			...(definition.wrapped ? {} : errorProps),
		}),
		wrapper: definition.wrapped
			? compact({ ...label, withAsterisk, ...errorProps })
			: null,
		options,
		checkbox,
		validators,
	};
}
