import type { EmblaCarouselType } from "embla-carousel";
import type { RefObject } from "react";
import { useEffect } from "react";

interface UseKeyboardNavigationInput {
	opened: boolean;
	emblaRef: RefObject<EmblaCarouselType | null>;
}

export function useKeyboardNavigation(props: UseKeyboardNavigationInput): void {
	const { opened, emblaRef } = props;

	useEffect(() => {
		if (!opened) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "ArrowLeft") {
				emblaRef.current?.scrollPrev();
			} else if (event.key === "ArrowRight") {
				emblaRef.current?.scrollNext();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [opened, emblaRef]);
}
