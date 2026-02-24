import type { EmblaCarouselType } from "embla-carousel";
import type { AutoplayType } from "embla-carousel-autoplay";
import { useCallback, useRef, useState } from "react";

interface UseAutoPlayOutput {
	canUseAutoPlay: boolean;
	isPlaying: boolean;
	toggleAutoPlay: () => void;
	notifyAutoPlayInteraction: () => void;
	handleEmblaApiForAutoPlay: (embla: EmblaCarouselType) => void;
}

export function useAutoPlay(): UseAutoPlayOutput {
	const autoplayPluginRef = useRef<AutoplayType | null>(null);
	const emblaInstanceRef = useRef<EmblaCarouselType | null>(null);

	const [canUseAutoPlay, setCanUseAutoPlay] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);

	const onAutoPlayPlay = useCallback(() => setIsPlaying(true), []);
	const onAutoPlayStop = useCallback(() => setIsPlaying(false), []);

	const handleEmblaApiForAutoPlay = useCallback(
		(embla: EmblaCarouselType) => {
			const plugin = embla.plugins()?.autoplay;

			if (
				!plugin ||
				typeof plugin !== "object" ||
				typeof plugin.play !== "function"
			) {
				return;
			}

			const prevEmbla = emblaInstanceRef.current;

			if (prevEmbla) {
				prevEmbla.off("autoplay:play", onAutoPlayPlay);

				prevEmbla.off("autoplay:stop", onAutoPlayStop);
			}

			emblaInstanceRef.current = embla;

			autoplayPluginRef.current = plugin;

			embla.on("autoplay:play", onAutoPlayPlay);

			embla.on("autoplay:stop", onAutoPlayStop);

			setCanUseAutoPlay(true);

			setIsPlaying(plugin.isPlaying());
		},
		[onAutoPlayPlay, onAutoPlayStop],
	);

	const toggleAutoPlay = useCallback(() => {
		const plugin = autoplayPluginRef.current;

		if (!plugin) {
			return;
		}

		if (isPlaying) {
			plugin.stop();
		} else {
			plugin.play();
		}
	}, [isPlaying]);

	const notifyAutoPlayInteraction = useCallback(() => {
		const embla = emblaInstanceRef.current;

		if (!embla) {
			return;
		}

		embla.emit("pointerDown");
		embla.emit("pointerUp");
	}, []);

	return {
		canUseAutoPlay,
		isPlaying,
		toggleAutoPlay,
		notifyAutoPlayInteraction,
		handleEmblaApiForAutoPlay,
	};
}
