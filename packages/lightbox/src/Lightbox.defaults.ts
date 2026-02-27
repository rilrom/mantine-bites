export const LIGHTBOX_DEFAULT_PROPS = {
	modalProps: {
		closeOnClickOutside: true,
		keepMounted: false,
		trapFocus: true,
		lockScroll: true,
		returnFocus: true,
	},
	portalProps: {
		withinPortal: true,
	},
	slideCarouselProps: {
		controlSize: 36,
	},
	thumbnailCarouselProps: {
		emblaOptions: {
			dragFree: true,
		},
	},
	overlayProps: {
		fixed: true,
		backgroundOpacity: 0.9,
		color: "#18181B",
		zIndex: 200,
	},
	transitionProps: {
		transition: "fade",
		duration: 250,
	},
} as const;
