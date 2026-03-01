import { render, screen } from "@mantine-tests/core";
import { fireEvent } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type { ReactNode } from "react";
import type { LightboxControlsProps } from "./components/LightboxControls.js";
import type { LightboxCounterProps } from "./components/LightboxCounter.js";
import type { LightboxSlidesProps } from "./components/LightboxSlides.js";
import type { LightboxThumbnailsProps } from "./components/LightboxThumbnails.js";
import { Lightbox, type LightboxProps } from "./index.js";

const defaultRootProps: Omit<LightboxProps, "children"> = {
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
	rootProps?: Partial<LightboxProps>;
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

	it("should have static classes and extend function", () => {
		expect(Lightbox.classes).toBeDefined();
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
		if (!activeSlide) return;
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
		expect(prevButton.querySelector("polyline")).toHaveAttribute(
			"points",
			"18 15 12 9 6 15",
		);
		expect(nextButton.querySelector("polyline")).toHaveAttribute(
			"points",
			"6 9 12 15 18 9",
		);
	});
});
