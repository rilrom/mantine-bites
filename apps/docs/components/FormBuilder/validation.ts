import {
	hasLength,
	isEmail,
	isInRange,
	isNotEmpty,
	matches,
} from "@mantine/form";
import type { ReactNode } from "react";
import { type BuilderField, FIELD_TYPES, type FieldRules } from "./fieldTypes";
import { quote } from "./print";

type Validator = (value: unknown) => ReactNode;

export interface ValidatorSpec {
	name: "isNotEmpty" | "isEmail" | "hasLength" | "isInRange" | "matches";
	args: string;
	validate: Validator;
}

interface Bounds {
	min?: number;
	max?: number;
}

function hasBounds({ min, max }: Bounds) {
	return min !== undefined || max !== undefined;
}

function printBounds({ min, max }: Bounds) {
	const entries = [
		min !== undefined && `min: ${min}`,
		max !== undefined && `max: ${max}`,
	].filter(Boolean);

	return `{ ${entries.join(", ")} }`;
}

function boundsMessage(label: string, { min, max }: Bounds, unit: string) {
	if (min !== undefined && max !== undefined) {
		return `${label} must be between ${min} and ${max}${unit}`;
	}

	if (min !== undefined) {
		return `${label} must be at least ${min}${unit}`;
	}

	return `${label} must be at most ${max}${unit}`;
}

export function getValidators(field: BuilderField): ValidatorSpec[] {
	const { label } = field;
	const allowed = FIELD_TYPES[field.type].rules;
	const rules: FieldRules = Object.fromEntries(
		Object.entries(field.rules).filter(([name]) =>
			allowed.includes(name as keyof FieldRules),
		),
	);
	const validators: ValidatorSpec[] = [];

	if (rules.required) {
		const message = `${label} is required`;
		validators.push({
			name: "isNotEmpty",
			args: quote(message),
			validate: isNotEmpty(message),
		});
	}

	if (rules.email) {
		const message = "Invalid email";
		validators.push({
			name: "isEmail",
			args: quote(message),
			validate: isEmail(message),
		});
	}

	const length = { min: rules.minLength, max: rules.maxLength };

	if (hasBounds(length)) {
		const message = boundsMessage(label, length, " characters");
		validators.push({
			name: "hasLength",
			args: `${printBounds(length)}, ${quote(message)}`,
			validate: hasLength(length, message),
		});
	}

	const range = { min: rules.min, max: rules.max };

	if (hasBounds(range)) {
		const message = boundsMessage(label, range, "");
		validators.push({
			name: "isInRange",
			args: `${printBounds(range)}, ${quote(message)}`,
			validate: isInRange(range, message),
		});
	}

	if (rules.pattern && isValidPattern(rules.pattern)) {
		const regexp = new RegExp(rules.pattern);
		const message = `${label} has an invalid format`;
		validators.push({
			name: "matches",
			args: `${regexp.toString()}, ${quote(message)}`,
			validate: matches(regexp, message),
		});
	}

	return validators;
}

export function composeValidators(validators: ValidatorSpec[]): Validator {
	return (value) => {
		for (const validator of validators) {
			const error = validator.validate(value);

			if (error) {
				return error;
			}
		}

		return null;
	};
}

export function isValidPattern(pattern: string) {
	try {
		new RegExp(pattern);
		return true;
	} catch {
		return false;
	}
}
