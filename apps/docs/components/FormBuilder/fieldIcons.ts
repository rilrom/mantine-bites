import {
	type Icon,
	IconAdjustmentsHorizontal,
	IconAlertCircle,
	IconAlignLeft,
	IconAt,
	IconBorderOuter,
	IconBraces,
	IconCalendar,
	IconCalendarMonth,
	IconCalendarTime,
	IconChecklist,
	IconCircleDot,
	IconClock,
	IconCursorText,
	IconDialpad,
	IconFileUpload,
	IconHeading,
	IconLayoutColumns,
	IconLayoutDistributeHorizontal,
	IconLink,
	IconList,
	IconListCheck,
	IconListDetails,
	IconListSearch,
	IconLock,
	IconMask,
	IconNumber,
	IconPalette,
	IconPhone,
	IconSelector,
	IconSeparator,
	IconSpacingVertical,
	IconSquareCheck,
	IconStar,
	IconTags,
	IconTagsFilled,
	IconTextCaption,
	IconToggleLeft,
	IconToggleRight,
} from "@tabler/icons-react";
import type { FieldType } from "./fieldTypes";
import type { BuilderNode, ContainerKind, ContentType } from "./nodes";

export const FIELD_ICONS: Record<FieldType, Icon> = {
	text: IconCursorText,
	email: IconAt,
	password: IconLock,
	tel: IconPhone,
	url: IconLink,
	mask: IconMask,
	textarea: IconAlignLeft,
	json: IconBraces,
	number: IconNumber,
	slider: IconAdjustmentsHorizontal,
	rating: IconStar,
	pin: IconDialpad,
	select: IconSelector,
	multiselect: IconListCheck,
	autocomplete: IconListSearch,
	tags: IconTags,
	nativeselect: IconList,
	segmented: IconLayoutDistributeHorizontal,
	radio: IconCircleDot,
	chips: IconToggleRight,
	multichips: IconTagsFilled,
	checkbox: IconSquareCheck,
	checkboxgroup: IconChecklist,
	switch: IconToggleLeft,
	switchgroup: IconListDetails,
	color: IconPalette,
	file: IconFileUpload,
	date: IconCalendar,
	datetime: IconCalendarTime,
	time: IconClock,
	month: IconCalendarMonth,
};

export const CONTENT_ICONS: Record<ContentType, Icon> = {
	title: IconHeading,
	text: IconTextCaption,
	divider: IconSeparator,
	space: IconSpacingVertical,
	alert: IconAlertCircle,
};

export const CONTAINER_ICONS: Record<ContainerKind, Icon> = {
	row: IconLayoutColumns,
	fieldset: IconBorderOuter,
};

export function getNodeIcon(node: BuilderNode) {
	switch (node.kind) {
		case "field":
			return FIELD_ICONS[node.type];
		case "content":
			return CONTENT_ICONS[node.type];
		default:
			return CONTAINER_ICONS[node.kind];
	}
}
