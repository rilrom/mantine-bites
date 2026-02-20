import type { EmblaCarouselType } from "embla-carousel";
import type { RefObject } from "react";
import { useMemo } from "react";
import type { LightboxCarouselOptions } from "../Lightbox.js";

interface UseCarouselOptionsInput {
	carouselOptions: LightboxCarouselOptions | undefined;
	isZoomedRef: RefObject<boolean>;
}

export function useCarouselOptions(props: UseCarouselOptionsInput) {
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
