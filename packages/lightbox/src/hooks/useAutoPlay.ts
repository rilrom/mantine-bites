import type { EmblaCarouselType } from "embla-carousel";
import type { AutoplayType } from "embla-carousel-autoplay";
import { useCallback, useRef, useState } from "react";

interface UseAutoPlayOutput {
	canAutoPlay: boolean;
	isPlaying: boolean;
	toggleAutoPlay: () => void;
	notifyAutoPlayInteraction: () => void;
	handleEmblaApiForAutoPlay: (embla: EmblaCarouselType) => void;
}

export function useAutoPlay(): UseAutoPlayOutput {
	const autoplayPluginRef = useRef<AutoplayType | null>(null);
	const emblaInstanceRef = useRef<EmblaCarouselType | null>(null);
	const autoplayShouldRunRef = useRef(false);

	const [canAutoPlay, setCanAutoPlay] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);

	const onAutoPlayPlay = useCallback(() => {
		setIsPlaying(true);
	}, []);

	const onAutoPlayStop = useCallback(() => setIsPlaying(false), []);

	const onEmblaPointerUp = useCallback(() => {
		if (!autoplayShouldRunRef.current) {
			autoplayPluginRef.current?.stop();
		}
	}, []);

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
				prevEmbla.off("pointerUp", onEmblaPointerUp);
			}

			emblaInstanceRef.current = embla;
			autoplayPluginRef.current = plugin;

			embla.on("autoplay:play", onAutoPlayPlay);
			embla.on("autoplay:stop", onAutoPlayStop);
			embla.on("pointerUp", onEmblaPointerUp);

			const playing = plugin.isPlaying();
			setCanAutoPlay(true);
			setIsPlaying(playing);
			autoplayShouldRunRef.current = playing;
		},
		[onAutoPlayPlay, onAutoPlayStop, onEmblaPointerUp],
	);

	const toggleAutoPlay = useCallback(() => {
		const plugin = autoplayPluginRef.current;

		if (!plugin) {
			return;
		}

		if (isPlaying) {
			autoplayShouldRunRef.current = false;
			plugin.stop();
		} else {
			autoplayShouldRunRef.current = true;
			plugin.play();
		}
	}, [isPlaying]);

	const notifyAutoPlayInteraction = useCallback(() => {
		const embla = emblaInstanceRef.current;
		const plugin = autoplayPluginRef.current;

		if (!embla || !plugin?.isPlaying()) {
			return;
		}

		embla.emit("pointerDown");
		embla.emit("pointerUp");
	}, []);

	return {
		canAutoPlay,
		isPlaying,
		toggleAutoPlay,
		notifyAutoPlayInteraction,
		handleEmblaApiForAutoPlay,
	};
}
