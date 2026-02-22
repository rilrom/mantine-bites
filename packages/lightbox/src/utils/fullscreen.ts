const getBrowserDocument = () =>
	typeof document === "undefined" ? null : document;

/**
 * Returns `true` if the browser supports the Fullscreen API and fullscreen
 * can be requested on the document element.
 */
export const canToggleBrowserFullscreen = () => {
	const browserDocument = getBrowserDocument();

	return Boolean(
		browserDocument &&
			typeof browserDocument.documentElement.requestFullscreen === "function",
	);
};

/**
 * Returns `true` if the document root element is currently in fullscreen mode.
 */
export const isBrowserFullscreen = () => {
	const browserDocument = getBrowserDocument();

	return Boolean(
		browserDocument &&
			browserDocument.fullscreenElement === browserDocument.documentElement,
	);
};

/**
 * Toggles the browser's fullscreen mode on the document root element.
 * Exits fullscreen if it is currently active, otherwise requests it.
 * No-ops in environments where the Fullscreen API is unavailable.
 */
export const toggleBrowserFullscreen = async () => {
	const browserDocument = getBrowserDocument();

	if (
		!browserDocument ||
		typeof browserDocument.documentElement.requestFullscreen !== "function"
	) {
		return;
	}

	if (browserDocument.fullscreenElement === browserDocument.documentElement) {
		if (typeof browserDocument.exitFullscreen === "function") {
			await browserDocument.exitFullscreen();
		}

		return;
	}

	await browserDocument.documentElement.requestFullscreen();
};

/**
 * Exits fullscreen only if the document root element currently owns fullscreen.
 * Avoids interfering with other fullscreen targets (e.g. `<video>` elements).
 */
export const exitBrowserFullscreenIfActive = async () => {
	const browserDocument = getBrowserDocument();

	if (
		browserDocument &&
		browserDocument.fullscreenElement === browserDocument.documentElement &&
		typeof browserDocument.exitFullscreen === "function"
	) {
		await browserDocument.exitFullscreen();
	}
};
