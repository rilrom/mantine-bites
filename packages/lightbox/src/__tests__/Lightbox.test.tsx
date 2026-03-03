import { render, screen } from "@mantine-tests/core";
import { fireEvent, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import Autoplay from "embla-carousel-autoplay";
import type { ReactNode } from "react";
import { LightboxAutoplayButton } from "../components/LightboxAutoplayButton.js";
import { LightboxCloseButton } from "../components/LightboxCloseButton.js";
import type { LightboxControlsProps } from "../components/LightboxControls.js";
import type { LightboxCounterProps } from "../components/LightboxCounter.js";
import { LightboxFullscreenButton } from "../components/LightboxFullscreenButton.js";
import type { LightboxSlidesProps } from "../components/LightboxSlides.js";
import type { LightboxThumbnailsProps } from "../components/LightboxThumbnails.js";
import { LightboxZoomButton } from "../components/LightboxZoomButton.js";
import {
	Lightbox,
	type LightboxRootProps,
	useLightboxContext,
} from "../index.js";

const defaultRootProps: Omit<LightboxRootProps, "children"> = {
	opened: true,
	onClose: () => {},
};

const defaultSlides = [
	<Lightbox.Slide key="slide-1">
		<img src="/photo-1.jpg" alt="Forest landscape slide" />
	</Lightbox.Slide>,
	<Lightbox.Slide key="slide-2">
		<img src="/photo-2.jpg" alt="Mountain view slide" />
	</Lightbox.Slide>,
	<Lightbox.Slide key="slide-3">
		<img src="/photo-3.jpg" alt="Ocean sunset slide" />
	</Lightbox.Slide>,
];

const defaultThumbnails = [
	<Lightbox.Thumbnail key="thumbnail-1">
		<img src="/photo-1.jpg" alt="Forest landscape thumbnail" />
	</Lightbox.Thumbnail>,
	<Lightbox.Thumbnail key="thumbnail-2">
		<img src="/photo-2.jpg" alt="Mountain view thumbnail" />
	</Lightbox.Thumbnail>,
	<Lightbox.Thumbnail key="thumbnail-3">
		<img src="/photo-3.jpg" alt="Ocean sunset thumbnail" />
	</Lightbox.Thumbnail>,
];

interface RenderLightboxOptions {
	rootProps?: Partial<LightboxRootProps>;
	slidesProps?: Partial<LightboxSlidesProps>;
	thumbnailsProps?: Partial<LightboxThumbnailsProps>;
	controlsProps?: Partial<LightboxControlsProps>;
	counterProps?: Partial<LightboxCounterProps>;
	slides?: ReactNode;
	thumbnails?: ReactNode;
	withToolbar?: boolean;
	withCounter?: boolean;
	withControls?: boolean;
	withThumbnails?: boolean;
}

function renderLightbox({
	rootProps,
	slidesProps,
	thumbnailsProps,
	controlsProps,
	counterProps,
	slides = defaultSlides,
	thumbnails = defaultThumbnails,
	withToolbar = true,
	withCounter = true,
	withControls = true,
	withThumbnails = true,
}: RenderLightboxOptions = {}) {
	const mergedRootProps = { ...defaultRootProps, ...rootProps };

	return render(
		<Lightbox.Root {...mergedRootProps}>
			{withToolbar && <Lightbox.Toolbar />}
			{withCounter && <Lightbox.Counter {...counterProps} />}
			<Lightbox.Slides {...slidesProps}>{slides}</Lightbox.Slides>
			{withControls && <Lightbox.Controls {...controlsProps} />}
			{withThumbnails && (
				<Lightbox.Thumbnails {...thumbnailsProps}>
					{thumbnails}
				</Lightbox.Thumbnails>
			)}
		</Lightbox.Root>,
	);
}

describe("@mantine-bites/lightbox/Lightbox compound API", () => {
	let fullscreenElement: Element | null = null;

	const emitFullscreenChange = () => {
		fireEvent(
			document.documentElement,
			new Event("fullscreenchange", { bubbles: true }),
		);
	};

	const requestFullscreenMock = jest.fn(async function (this: Element) {
		fullscreenElement = this;
		emitFullscreenChange();
	});

	const exitFullscreenMock = jest.fn(async () => {
		fullscreenElement = null;
	});

	beforeEach(() => {
		fullscreenElement = null;
		requestFullscreenMock.mockClear();
		exitFullscreenMock.mockClear();

		Object.defineProperty(document, "fullscreenElement", {
			configurable: true,
			get: () => fullscreenElement,
		});

		Object.defineProperty(document.documentElement, "requestFullscreen", {
			configurable: true,
			value: requestFullscreenMock,
		});

		Object.defineProperty(document, "exitFullscreen", {
			configurable: true,
			value: exitFullscreenMock,
		});
	});

	it("should expose compound static members", () => {
		expect(Lightbox.Root).toBeDefined();
		expect(Lightbox.Toolbar).toBeDefined();
		expect(Lightbox.Counter).toBeDefined();
		expect(Lightbox.Controls).toBeDefined();
		expect(Lightbox.Slides).toBeDefined();
		expect(Lightbox.Thumbnails).toBeDefined();
		expect(Lightbox.Thumbnail).toBeDefined();
		expect(Lightbox.Slide).toBeDefined();
	});

	it("should expose button static members on Lightbox", () => {
		expect(Lightbox.CloseButton).toBeDefined();
		expect(Lightbox.ZoomButton).toBeDefined();
		expect(Lightbox.FullscreenButton).toBeDefined();
		expect(Lightbox.AutoplayButton).toBeDefined();
	});

	it("should export useLightboxContext", () => {
		expect(typeof useLightboxContext).toBe("function");
	});

	it("should have static classes and extend function", () => {
		expect(Lightbox.Root.classes).toBeDefined();
		expect(Lightbox.extend).toBeDefined();
	});

	it("should not render content when closed", () => {
		renderLightbox({ rootProps: { opened: false } });

		expect(screen.queryByLabelText("Close lightbox")).not.toBeInTheDocument();
	});

	it("should keep slide content mounted when keepMounted is true", () => {
		renderLightbox({
			rootProps: { opened: false, keepMounted: true },
		});

		expect(screen.getByAltText("Forest landscape slide")).toBeInTheDocument();
	});

	it("should allow composition to hide counter", () => {
		renderLightbox({ withCounter: false });

		expect(screen.queryByText("1 / 3")).not.toBeInTheDocument();
	});

	it("should allow composition to hide thumbnails", () => {
		renderLightbox({ withThumbnails: false });

		expect(screen.queryByLabelText("Go to slide 1")).not.toBeInTheDocument();
	});

	it("should call onClose when close button is clicked", async () => {
		const onClose = jest.fn();

		renderLightbox({ rootProps: { onClose } });

		await userEvent.click(screen.getByLabelText("Close lightbox"));

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("should respect closeOnClickOutside=false", () => {
		const onClose = jest.fn();

		renderLightbox({
			rootProps: { onClose, closeOnClickOutside: false },
		});

		const image = screen.getByAltText("Forest landscape slide");

		const activeSlide = image.closest("[aria-current='true']");

		if (!activeSlide) {
			return;
		}

		fireEvent.pointerDown(activeSlide, {
			pointerId: 1,
			clientX: 24,
			clientY: 24,
		});

		fireEvent.pointerUp(activeSlide, {
			pointerId: 1,
			clientX: 24,
			clientY: 24,
		});

		expect(onClose).not.toHaveBeenCalled();
	});

	it("should call onClose when Escape is pressed", async () => {
		const onClose = jest.fn();

		renderLightbox({ rootProps: { onClose } });

		await userEvent.keyboard("{Escape}");

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("should render at initialSlide position", async () => {
		renderLightbox({ slidesProps: { initialSlide: 2 } });

		expect(await screen.findByText("3 / 3")).toBeInTheDocument();

		expect(await screen.findByLabelText("Go to slide 3")).toHaveAttribute(
			"aria-current",
			"true",
		);
	});

	it("should reset current index when closed and reopened", () => {
		const { rerender } = renderLightbox({
			rootProps: { opened: true },
			slidesProps: { initialSlide: 1 },
		});

		expect(screen.getByText("2 / 3")).toBeInTheDocument();

		rerender(
			<Lightbox.Root {...defaultRootProps} opened={false}>
				<Lightbox.Toolbar />
				<Lightbox.Counter />
				<Lightbox.Slides initialSlide={0}>{defaultSlides}</Lightbox.Slides>
				<Lightbox.Thumbnails />
			</Lightbox.Root>,
		);

		rerender(
			<Lightbox.Root {...defaultRootProps} opened>
				<Lightbox.Toolbar />
				<Lightbox.Counter />
				<Lightbox.Slides initialSlide={0}>{defaultSlides}</Lightbox.Slides>
				<Lightbox.Thumbnails />
			</Lightbox.Root>,
		);

		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should accept overlayProps", () => {
		renderLightbox({ rootProps: { overlayProps: { backgroundOpacity: 0.5 } } });

		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should accept emblaOptions on thumbnails", () => {
		renderLightbox({
			thumbnailsProps: {
				emblaOptions: { dragFree: false, containScroll: "keepSnaps" },
			},
		});

		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should render prev and next controls", () => {
		renderLightbox();

		expect(screen.getByLabelText("Previous slide")).toBeInTheDocument();

		expect(screen.getByLabelText("Next slide")).toBeInTheDocument();
	});

	it("should allow composition to hide controls", () => {
		renderLightbox({ withControls: false });

		expect(screen.queryByLabelText("Previous slide")).not.toBeInTheDocument();

		expect(screen.queryByLabelText("Next slide")).not.toBeInTheDocument();
	});

	it("should accept custom counter formatter", () => {
		renderLightbox({
			counterProps: { formatter: (i, t) => `Image ${i + 1} of ${t}` },
		});

		expect(screen.getByText("Image 1 of 3")).toBeInTheDocument();
	});

	it("should set data-orientation='horizontal' by default", () => {
		renderLightbox();

		expect(document.querySelector("[data-orientation]")).toHaveAttribute(
			"data-orientation",
			"horizontal",
		);
	});

	it("should set data-orientation='vertical' when orientation is vertical", () => {
		renderLightbox({ rootProps: { orientation: "vertical" } });

		expect(document.querySelector("[data-orientation]")).toHaveAttribute(
			"data-orientation",
			"vertical",
		);
	});

	it("should render up and down chevrons when orientation is vertical", () => {
		renderLightbox({ rootProps: { orientation: "vertical" } });

		const prevButton = screen.getByLabelText("Previous slide");

		const nextButton = screen.getByLabelText("Next slide");

		expect(prevButton.querySelector("svg")).toHaveStyle({
			transform: "rotate(-180deg)",
		});

		expect(nextButton.querySelector("svg")).toHaveStyle({
			transform: "rotate(0deg)",
		});
	});

	it("should render zoom button by default", () => {
		renderLightbox();

		expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
	});

	it("should not render zoom button when withZoom is false", () => {
		renderLightbox({ rootProps: { withZoom: false } });

		expect(screen.queryByLabelText("Zoom in")).not.toBeInTheDocument();
		expect(screen.queryByLabelText("Zoom out")).not.toBeInTheDocument();
	});

	it("should show Zoom in label when not zoomed", () => {
		renderLightbox();

		expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
		expect(screen.queryByLabelText("Zoom out")).not.toBeInTheDocument();
	});

	it("should mark active slide as non-zoomable when withZoom={false}", () => {
		renderLightbox({ rootProps: { withZoom: false } });

		const image = screen.getByAltText("Forest landscape slide");
		const activeSlide = image.closest("[aria-current='true']");
		const zoomContainer = activeSlide?.querySelector("[data-can-zoom]");

		expect(zoomContainer).toHaveAttribute("data-can-zoom", "false");
	});

	it("should disable zoom button when active slide has no image", async () => {
		render(
			<Lightbox.Root opened onClose={() => {}}>
				<Lightbox.Toolbar />
				<Lightbox.Slides>
					<Lightbox.Slide>
						<div>No image content</div>
					</Lightbox.Slide>
				</Lightbox.Slides>
			</Lightbox.Root>,
		);

		await waitFor(() =>
			expect(screen.getByLabelText("Zoom in")).toBeDisabled(),
		);
	});

	it("should keep zoom enabled when image is downscaled even if container-height fill is 1", async () => {
		renderLightbox();

		const zoomButton = screen.getByLabelText("Zoom in");
		const image = screen.getByAltText("Forest landscape slide");
		const activeSlide = image.closest("[aria-current='true']");
		const activeZoomContainer = activeSlide?.querySelector(
			"[data-zoom-enabled]",
		);

		expect(activeZoomContainer).not.toBeNull();

		Object.defineProperty(image, "naturalWidth", {
			configurable: true,
			value: 1500,
		});
		Object.defineProperty(image, "naturalHeight", {
			configurable: true,
			value: 1000,
		});
		Object.defineProperty(image, "getBoundingClientRect", {
			configurable: true,
			value: () => ({
				x: 0,
				y: 0,
				width: 1000,
				height: 667,
				top: 0,
				left: 0,
				right: 1000,
				bottom: 667,
				toJSON: () => ({}),
			}),
		});
		Object.defineProperty(activeZoomContainer, "getBoundingClientRect", {
			configurable: true,
			value: () => ({
				x: 0,
				y: 0,
				width: 1000,
				height: 667,
				top: 0,
				left: 0,
				right: 1000,
				bottom: 667,
				toJSON: () => ({}),
			}),
		});

		fireEvent.load(image);

		await waitFor(() => expect(zoomButton).toBeEnabled());
	});

	it("should disable zoom when image has no natural resolution headroom", async () => {
		renderLightbox();

		const zoomButton = screen.getByLabelText("Zoom in");
		const image = screen.getByAltText("Forest landscape slide");

		Object.defineProperty(image, "naturalWidth", {
			configurable: true,
			value: 1000,
		});
		Object.defineProperty(image, "naturalHeight", {
			configurable: true,
			value: 667,
		});
		Object.defineProperty(image, "getBoundingClientRect", {
			configurable: true,
			value: () => ({
				x: 0,
				y: 0,
				width: 1000,
				height: 667,
				top: 0,
				left: 0,
				right: 1000,
				bottom: 667,
				toJSON: () => ({}),
			}),
		});

		fireEvent.load(image);

		await waitFor(() => expect(zoomButton).toBeDisabled());
	});

	it("should toggle zoom state from toolbar button", async () => {
		renderLightbox();

		const image = screen.getByAltText("Forest landscape slide");
		fireEvent.load(image);

		const zoomButton = screen.getByLabelText("Zoom in");
		await waitFor(() => expect(zoomButton).toBeEnabled());

		await userEvent.click(zoomButton);
		expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();

		await userEvent.click(screen.getByLabelText("Zoom out"));
		expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
	});

	it("should keep carousel controls enabled when zoomed", async () => {
		renderLightbox();

		const image = screen.getByAltText("Forest landscape slide");
		fireEvent.load(image);

		await waitFor(() => expect(screen.getByLabelText("Zoom in")).toBeEnabled());
		await userEvent.click(screen.getByLabelText("Zoom in"));

		expect(screen.getByLabelText("Previous slide")).toBeEnabled();
		expect(screen.getByLabelText("Next slide")).toBeEnabled();
	});

	it("should toggle zoom when clicking active slide image", async () => {
		renderLightbox();

		const image = screen.getByAltText("Forest landscape slide");
		fireEvent.load(image);

		await waitFor(() => expect(screen.getByLabelText("Zoom in")).toBeEnabled());

		await userEvent.click(image);
		expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();

		await userEvent.click(image);
		expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
	});

	it("should not toggle zoom when clicking active slide image and withZoom={false}", async () => {
		renderLightbox({ rootProps: { withZoom: false } });

		await userEvent.click(screen.getByAltText("Forest landscape slide"));

		expect(screen.queryByLabelText("Zoom out")).not.toBeInTheDocument();
		expect(screen.queryByLabelText("Zoom in")).not.toBeInTheDocument();
	});

	it("should reset zoom when thumbnail is clicked", async () => {
		renderLightbox();

		const image = screen.getByAltText("Forest landscape slide");
		fireEvent.load(image);

		await waitFor(() => expect(screen.getByLabelText("Zoom in")).toBeEnabled());
		await userEvent.click(screen.getByLabelText("Zoom in"));
		await userEvent.click(screen.getByLabelText("Go to slide 2"));

		expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
	});

	it("should render fullscreen button by default", () => {
		renderLightbox();
		expect(screen.getByLabelText("Enter fullscreen")).toBeInTheDocument();
	});

	it("should hide fullscreen button when withFullscreen={false}", () => {
		renderLightbox({ rootProps: { withFullscreen: false } });
		expect(screen.queryByLabelText("Enter fullscreen")).not.toBeInTheDocument();
	});

	it("should render fullscreen button before close button", () => {
		renderLightbox();
		const fullscreenButton = screen.getByLabelText("Enter fullscreen");
		const closeButton = screen.getByLabelText("Close lightbox");
		expect(
			Boolean(
				fullscreenButton.compareDocumentPosition(closeButton) &
					Node.DOCUMENT_POSITION_FOLLOWING,
			),
		).toBe(true);
	});

	it("should request browser fullscreen when fullscreen button is clicked", async () => {
		renderLightbox();
		await userEvent.click(screen.getByLabelText("Enter fullscreen"));
		expect(requestFullscreenMock).toHaveBeenCalledTimes(1);
	});

	it("should exit browser fullscreen when fullscreen button is clicked in fullscreen mode", async () => {
		renderLightbox();
		await userEvent.click(screen.getByLabelText("Enter fullscreen"));
		await userEvent.click(screen.getByLabelText("Exit fullscreen"));
		expect(exitFullscreenMock).toHaveBeenCalledTimes(1);
	});

	it("should exit browser fullscreen when lightbox closes", async () => {
		const { rerender } = renderLightbox({ rootProps: { opened: true } });

		await userEvent.click(screen.getByLabelText("Enter fullscreen"));

		await waitFor(() =>
			expect(screen.getByLabelText("Exit fullscreen")).toBeInTheDocument(),
		);

		rerender(
			<Lightbox.Root {...defaultRootProps} opened={false}>
				<Lightbox.Toolbar />
				<Lightbox.Counter />
				<Lightbox.Slides>{defaultSlides}</Lightbox.Slides>
				<Lightbox.Controls />
				<Lightbox.Thumbnails>{defaultThumbnails}</Lightbox.Thumbnails>
			</Lightbox.Root>,
		);

		await waitFor(() => expect(exitFullscreenMock).toHaveBeenCalledTimes(1));
	});

	it("should not render autoplay button when no autoplay plugin is configured", () => {
		renderLightbox();

		expect(screen.queryByLabelText("Pause autoplay")).not.toBeInTheDocument();
		expect(screen.queryByLabelText("Play autoplay")).not.toBeInTheDocument();
	});

	it("should stop autoplay when zoom toolbar button is clicked and stopOnInteraction is true", async () => {
		renderLightbox({
			slidesProps: {
				emblaPlugins: [Autoplay({ delay: 2000, stopOnInteraction: true })],
				emblaOptions: { loop: true },
			},
		});

		await waitFor(() =>
			expect(screen.getByLabelText("Pause autoplay")).toBeInTheDocument(),
		);

		await userEvent.click(screen.getByLabelText("Zoom in"));

		await waitFor(() =>
			expect(screen.getByLabelText("Play autoplay")).toBeInTheDocument(),
		);
	});

	it("should keep autoplay running when zoom toolbar button is clicked and stopOnInteraction is false", async () => {
		renderLightbox({
			slidesProps: {
				emblaPlugins: [Autoplay({ delay: 2000, stopOnInteraction: false })],
				emblaOptions: { loop: true },
			},
		});

		const initialAutoplayLabel = screen.queryByLabelText("Pause autoplay")
			? "Pause autoplay"
			: "Play autoplay";

		await userEvent.click(screen.getByLabelText("Zoom in"));

		expect(screen.getByLabelText(initialAutoplayLabel)).toBeInTheDocument();
	});

	it("should stop autoplay when prev control is clicked and stopOnInteraction is true", async () => {
		renderLightbox({
			slidesProps: {
				emblaPlugins: [Autoplay({ delay: 2000, stopOnInteraction: true })],
				emblaOptions: { loop: true },
			},
		});

		await waitFor(() =>
			expect(screen.getByLabelText("Pause autoplay")).toBeInTheDocument(),
		);

		await userEvent.click(screen.getByLabelText("Previous slide"));

		await waitFor(() =>
			expect(screen.getByLabelText("Play autoplay")).toBeInTheDocument(),
		);
	});

	it("should stop autoplay when next control is clicked and stopOnInteraction is true", async () => {
		renderLightbox({
			slidesProps: {
				emblaPlugins: [Autoplay({ delay: 2000, stopOnInteraction: true })],
				emblaOptions: { loop: true },
			},
		});

		await waitFor(() =>
			expect(screen.getByLabelText("Pause autoplay")).toBeInTheDocument(),
		);

		await userEvent.click(screen.getByLabelText("Next slide"));

		await waitFor(() =>
			expect(screen.getByLabelText("Play autoplay")).toBeInTheDocument(),
		);
	});

	it("should stop autoplay when thumbnail is clicked and stopOnInteraction is true", async () => {
		renderLightbox({
			slidesProps: {
				emblaPlugins: [Autoplay({ delay: 2000, stopOnInteraction: true })],
				emblaOptions: { loop: true },
			},
		});

		await waitFor(() =>
			expect(screen.getByLabelText("Pause autoplay")).toBeInTheDocument(),
		);

		await userEvent.click(screen.getByLabelText("Go to slide 2"));

		await waitFor(() =>
			expect(screen.getByLabelText("Play autoplay")).toBeInTheDocument(),
		);
	});

	it("should render custom children inside toolbar when provided", () => {
		render(
			<Lightbox.Root opened onClose={() => {}}>
				<Lightbox.Toolbar>
					<button type="button">Custom button</button>
				</Lightbox.Toolbar>
				<Lightbox.Slides>{defaultSlides}</Lightbox.Slides>
			</Lightbox.Root>,
		);
		expect(screen.getByText("Custom button")).toBeInTheDocument();
		// Default buttons should NOT render when children are provided
		expect(screen.queryByLabelText("Close lightbox")).not.toBeInTheDocument();
	});

	it("should render default buttons when toolbar has no children", () => {
		renderLightbox();
		expect(screen.getByLabelText("Close lightbox")).toBeInTheDocument();
	});
});

describe("@mantine-bites/lightbox/LightboxAutoplayButton", () => {
	it("renders nothing without an autoplay plugin", () => {
		render(
			<Lightbox.Root opened onClose={() => {}}>
				<Lightbox.Slides>{defaultSlides}</Lightbox.Slides>
				<LightboxAutoplayButton />
			</Lightbox.Root>,
		);
		expect(screen.queryByLabelText("Pause autoplay")).not.toBeInTheDocument();
		expect(screen.queryByLabelText("Play autoplay")).not.toBeInTheDocument();
	});

	it("renders autoplay button when autoplay plugin is active", async () => {
		render(
			<Lightbox.Root opened onClose={() => {}}>
				<Lightbox.Slides
					emblaPlugins={[Autoplay({ delay: 2000 })]}
					emblaOptions={{ loop: true }}
				>
					{defaultSlides}
				</Lightbox.Slides>
				<LightboxAutoplayButton />
			</Lightbox.Root>,
		);
		await waitFor(() =>
			expect(screen.getByLabelText("Pause autoplay")).toBeInTheDocument(),
		);
	});
});

describe("@mantine-bites/lightbox/LightboxZoomButton", () => {
	it("renders zoom button inside LightboxRoot", () => {
		render(
			<Lightbox.Root opened onClose={() => {}}>
				<Lightbox.Slides>{defaultSlides}</Lightbox.Slides>
				<LightboxZoomButton />
			</Lightbox.Root>,
		);
		expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
	});

	it("renders nothing when withZoom=false", () => {
		render(
			<Lightbox.Root opened onClose={() => {}} withZoom={false}>
				<Lightbox.Slides>{defaultSlides}</Lightbox.Slides>
				<LightboxZoomButton />
			</Lightbox.Root>,
		);
		expect(screen.queryByLabelText("Zoom in")).not.toBeInTheDocument();
	});
});

describe("@mantine-bites/lightbox/LightboxFullscreenButton", () => {
	it("renders fullscreen button inside LightboxRoot", () => {
		render(
			<Lightbox.Root opened onClose={() => {}}>
				<Lightbox.Slides>{defaultSlides}</Lightbox.Slides>
				<LightboxFullscreenButton />
			</Lightbox.Root>,
		);
		expect(screen.getByLabelText("Enter fullscreen")).toBeInTheDocument();
	});

	it("renders nothing when withFullscreen=false", () => {
		render(
			<Lightbox.Root opened onClose={() => {}} withFullscreen={false}>
				<Lightbox.Slides>{defaultSlides}</Lightbox.Slides>
				<LightboxFullscreenButton />
			</Lightbox.Root>,
		);
		expect(screen.queryByLabelText("Enter fullscreen")).not.toBeInTheDocument();
	});
});

describe("@mantine-bites/lightbox/LightboxCloseButton", () => {
	it("renders inside LightboxRoot", () => {
		render(
			<Lightbox.Root opened onClose={() => {}}>
				<Lightbox.Slides>{defaultSlides}</Lightbox.Slides>
				<LightboxCloseButton />
			</Lightbox.Root>,
		);
		expect(screen.getByLabelText("Close lightbox")).toBeInTheDocument();
	});

	it("calls onClose when clicked", async () => {
		const onClose = jest.fn();
		render(
			<Lightbox.Root opened onClose={onClose}>
				<Lightbox.Slides>{defaultSlides}</Lightbox.Slides>
				<LightboxCloseButton />
			</Lightbox.Root>,
		);
		await userEvent.click(screen.getByLabelText("Close lightbox"));
		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
