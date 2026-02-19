const getBrowserDocument = () =>
	typeof document === "undefined" ? null : document;

export const canToggleBrowserFullscreen = () => {
	const browserDocument = getBrowserDocument();

	return Boolean(
		browserDocument &&
			typeof browserDocument.documentElement.requestFullscreen === "function",
	);
};

export const isBrowserFullscreen = () => {
	const browserDocument = getBrowserDocument();

	return Boolean(
		browserDocument &&
			browserDocument.fullscreenElement === browserDocument.documentElement,
	);
};

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

export const exitBrowserFullscreenIfActive = async () => {
	const browserDocument = getBrowserDocument();

	// Only exit if the page root owns fullscreen, avoid interfering with other fullscreen targets.
	if (
		browserDocument &&
		browserDocument.fullscreenElement === browserDocument.documentElement &&
		typeof browserDocument.exitFullscreen === "function"
	) {
		await browserDocument.exitFullscreen();
	}
};
