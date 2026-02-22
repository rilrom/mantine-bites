import type { EmblaCarouselType } from "embla-carousel";
import type { RefObject } from "react";
import { useMemo } from "react";
import type { LightboxCarouselOptions } from "../Lightbox.js";

interface UseCarouselOptionsInput {
	carouselOptions: LightboxCarouselOptions | undefined;
	isZoomedRef: RefObject<boolean>;
}

export type UseCarouselOptionsOutput = LightboxCarouselOptions & {
	emblaOptions: NonNullable<LightboxCarouselOptions["emblaOptions"]>;
};

/**
 * Merges consumer-supplied carousel options with lightbox-internal overrides.
 *
 * Injects a `watchDrag` guard that disables Embla's drag when the lightbox is
 * zoomed. Uses `isZoomedRef` (not `isZoomed` state) so that the returned
 * options object stays stable across zoom state changes, preventing Embla from
 * being re-initialised on every zoom toggle.
 */
export function useCarouselOptions(
	props: UseCarouselOptionsInput,
): UseCarouselOptionsOutput {
	const { carouselOptions, isZoomedRef } = props;

	return useMemo(
		() => ({
			...carouselOptions,
			emblaOptions: {
				...carouselOptions?.emblaOptions,
				watchDrag: (
					emblaApi: EmblaCarouselType,
					event: MouseEvent | TouchEvent,
				) => {
					if (isZoomedRef.current) {
						return false;
					}

					const configuredWatchDrag = carouselOptions?.emblaOptions?.watchDrag;

					if (typeof configuredWatchDrag === "function") {
						return configuredWatchDrag(emblaApi, event);
					}

					return configuredWatchDrag ?? true;
				},
			},
		}),
		[carouselOptions, isZoomedRef],
	);
}
