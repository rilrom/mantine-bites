import { useCallback, useEffect, useState } from "react";
import {
	canToggleBrowserFullscreen,
	exitBrowserFullscreenIfActive,
	isBrowserFullscreen,
	toggleBrowserFullscreen,
} from "../utils/fullscreen.js";

interface UseFullscreenInput {
	opened: boolean;
}

interface UseFullscreenOutput {
	isFullscreen: boolean;
	canUseFullscreen: boolean;
	toggleFullscreen: () => void;
}

export function useFullscreen(props: UseFullscreenInput): UseFullscreenOutput {
	const { opened } = props;

	const [isFullscreen, setIsFullscreen] = useState(isBrowserFullscreen);

	const canUseFullscreen = canToggleBrowserFullscreen();

	const toggleFullscreen = useCallback(async () => {
		if (!canUseFullscreen) {
			return;
		}

		await toggleBrowserFullscreen();
	}, [canUseFullscreen]);

	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreen(isBrowserFullscreen());
		};

		document.addEventListener("fullscreenchange", handleFullscreenChange);

		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
		};
	}, []);

	useEffect(() => {
		if (!opened) {
			void exitBrowserFullscreenIfActive();
		}
	}, [opened]);

	return {
		isFullscreen,
		canUseFullscreen,
		toggleFullscreen,
	};
}
