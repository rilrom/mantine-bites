import {
	createVarsResolver,
	factory,
	OptionalPortal,
	RemoveScroll,
	Transition,
	useProps,
	useStyles,
} from "@mantine/core";
import { useLightbox } from "../hooks/useLightbox.js";
import { LightboxProvider } from "../Lightbox.context.js";
import { LIGHTBOX_DEFAULT_PROPS } from "../Lightbox.defaults.js";
import type { LightboxFactory, LightboxProps } from "../Lightbox.js";
import classes from "../Lightbox.module.css";

const defaultProps: Partial<LightboxProps> = LIGHTBOX_DEFAULT_PROPS;

const varsResolver = createVarsResolver<LightboxFactory>(
	(_, { overlayProps }) => ({
		root: {
			"--lightbox-z-index": String(
				overlayProps?.zIndex ?? LIGHTBOX_DEFAULT_PROPS.overlayProps.zIndex,
			),
		},
		overlay: {
			"--lightbox-z-index": String(
				overlayProps?.zIndex ?? LIGHTBOX_DEFAULT_PROPS.overlayProps.zIndex,
			),
			"--overlay-z-index": "var(--lightbox-z-index)",
		},
	}),
);

export const LightboxRoot = factory<LightboxFactory>((_props, ref) => {
	const props = useProps("Lightbox", defaultProps, _props);

	const {
		opened,
		onClose,
		closeOnClickOutside,
		classNames,
		className,
		style,
		styles,
		unstyled,
		vars,
		children,
		initialSlide,
		counterFormatter,
		carouselOptions,
		thumbnailEmblaOptions,
		overlayProps,
		transitionProps,
		keepMounted,
		trapFocus,
		lockScroll,
		returnFocus,
		withinPortal,
		portalProps,
	} = props;

	const getStyles = useStyles<LightboxFactory>({
		name: "Lightbox",
		classes,
		props,
		varsResolver,
		className,
		style,
		classNames,
		styles,
		unstyled,
		vars,
	});

	const mergedOptions = {
		overlayProps: {
			...LIGHTBOX_DEFAULT_PROPS.overlayProps,
			...overlayProps,
		},
		transitionProps: {
			...LIGHTBOX_DEFAULT_PROPS.transitionProps,
			...transitionProps,
		},
	};

	const {
		mergedRef,
		currentIndex,
		counterText,
		handleEmblaApi,
		handleThumbnailsEmblaApi,
		handleThumbnailClick,
		handleOutsideClick,
		mergedCarouselOptions,
		mergedThumbnailEmblaOptions,
	} = useLightbox({
		ref,
		opened,
		onClose,
		closeOnClickOutside,
		trapFocus,
		returnFocus,
		initialSlide,
		carouselOptions,
		thumbnailEmblaOptions,
		counterFormatter,
	});

	return (
		<OptionalPortal {...portalProps} withinPortal={withinPortal}>
			<Transition
				{...mergedOptions.transitionProps}
				mounted={opened}
				keepMounted={keepMounted}
			>
				{(transitionStyles) => (
					<RemoveScroll enabled={lockScroll}>
						<LightboxProvider
							value={{
								getStyles,
								transitionStyles,
								overlayProps: mergedOptions.overlayProps,
								mergedRef,
								mergedCarouselOptions,
								onCarouselEmblaApi: handleEmblaApi,
								currentIndex,
								counterText,
								emblaOptions: mergedThumbnailEmblaOptions,
								onEmblaApi: handleThumbnailsEmblaApi,
								onClose,
								handleOutsideClick,
								onThumbnailClick: handleThumbnailClick,
							}}
						>
							{children}
						</LightboxProvider>
					</RemoveScroll>
				)}
			</Transition>
		</OptionalPortal>
	);
});

LightboxRoot.displayName = "LightboxRoot";

LightboxRoot.classes = classes;
