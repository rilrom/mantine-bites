export const LIGHTBOX_DEFAULT_PROPS = {
	closeOnClickOutside: true,
	keepMounted: false,
	trapFocus: true,
	lockScroll: true,
	returnFocus: true,
	withinPortal: true,
	carouselOptions: {
		controlSize: 36,
	},
	thumbnailEmblaOptions: {
		dragFree: true,
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
