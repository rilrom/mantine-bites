import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import {
	type RefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

interface UseThumbnailsProps {
	emblaOptions: EmblaOptionsType | undefined;
	thumbnailsEmblaRef: RefObject<EmblaCarouselType | null>;
	initialIndex: number;
	orientation: "horizontal" | "vertical";
}

interface UseThumbnailsReturn {
	setViewportRef: (node: HTMLDivElement | null) => void;
	containerRef: RefObject<HTMLDivElement | null>;
	hasOverflow: boolean;
}

export function useThumbnails(props: UseThumbnailsProps): UseThumbnailsReturn {
	const { emblaOptions, thumbnailsEmblaRef, initialIndex, orientation } = props;

	const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions);

	const viewportRef = useRef<HTMLDivElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const initialIndexRef = useRef(initialIndex);

	const [hasOverflow, setHasOverflow] = useState(false);

	const setViewportRef = useCallback(
		(node: HTMLDivElement | null) => {
			viewportRef.current = node;

			emblaRef(node);
		},
		[emblaRef],
	);

	useEffect(() => {
		if (!emblaApi) {
			return;
		}

		thumbnailsEmblaRef.current = emblaApi;

		emblaApi.scrollTo(initialIndexRef.current);
	}, [emblaApi, thumbnailsEmblaRef]);

	useEffect(() => {
		const updateOverflow = () => {
			const viewport = viewportRef.current;
			const container = containerRef.current;

			if (!viewport || !container) {
				return;
			}

			if (orientation === "vertical") {
				setHasOverflow(container.scrollHeight > viewport.clientHeight + 1);
			} else {
				setHasOverflow(container.scrollWidth > viewport.clientWidth + 1);
			}
		};

		updateOverflow();

		if (typeof ResizeObserver === "undefined") {
			window.addEventListener("resize", updateOverflow);

			return () => window.removeEventListener("resize", updateOverflow);
		}

		const observer = new ResizeObserver(updateOverflow);

		const viewport = viewportRef.current;

		const container = containerRef.current;

		if (viewport) {
			observer.observe(viewport);
		}

		if (container) {
			observer.observe(container);
		}

		return () => observer.disconnect();
	}, [orientation]);

	return {
		setViewportRef,
		containerRef,
		hasOverflow,
	};
}
