import { render, screen } from "@mantine-tests/core";
import { waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Lightbox, type LightboxProps } from "./index.js";

const defaultProps: LightboxProps = {
	opened: true,
	onClose: () => {},
	carouselOptions: {
		previousControlProps: { "aria-label": "Previous image" },
		nextControlProps: { "aria-label": "Next image" },
	},
	children: [
		<Lightbox.Slide
			key="1"
			thumbnail={
				<img src="/photo-1-thumb.jpg" alt="Forest landscape thumbnail" />
			}
		>
			<img src="/photo-1.jpg" alt="Forest landscape" />
		</Lightbox.Slide>,
		<Lightbox.Slide
			key="2"
			thumbnail={<img src="/photo-2-thumb.jpg" alt="Mountain view thumbnail" />}
		>
			<img src="/photo-2.jpg" alt="Mountain view" />
		</Lightbox.Slide>,
		<Lightbox.Slide
			key="3"
			thumbnail={<img src="/photo-3-thumb.jpg" alt="Ocean sunset thumbnail" />}
		>
			<img src="/photo-3.jpg" alt="Ocean sunset" />
		</Lightbox.Slide>,
	],
};

describe("@mantine-bites/lightbox/Lightbox", () => {
	it("should have correct displayName", () => {
		expect(Lightbox.displayName).toBe("Lightbox");
	});

	it("should have static classes", () => {
		expect(Lightbox.classes).toBeDefined();
	});

	it("should have static extend function", () => {
		expect(Lightbox.extend).toBeDefined();
	});

	it("should support ref", () => {
		const ref = { current: null as HTMLDivElement | null };

		render(<Lightbox {...defaultProps} ref={ref} />);

		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});

	it("should not render when closed", () => {
		render(<Lightbox {...defaultProps} opened={false} />);

		expect(screen.queryByLabelText("Close lightbox")).not.toBeInTheDocument();
	});

	it("should always render close button", () => {
		render(<Lightbox {...defaultProps} />);

		expect(screen.getByLabelText("Close lightbox")).toBeInTheDocument();
	});

	it("should call onClose when close button is clicked", async () => {
		const onClose = jest.fn();

		render(<Lightbox {...defaultProps} onClose={onClose} />);

		await userEvent.click(screen.getByLabelText("Close lightbox"));

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("should render first slide by default", () => {
		render(<Lightbox {...defaultProps} />);

		expect(screen.getByAltText("Forest landscape")).toBeInTheDocument();
	});

	it("should render at initialSlide position", () => {
		render(
			<Lightbox {...defaultProps} carouselOptions={{ initialSlide: 2 }} />,
		);

		expect(screen.getByAltText("Ocean sunset")).toBeInTheDocument();
	});

	it("should accept onSlideChange callback via carouselOptions without error", () => {
		const onSlideChange = jest.fn();

		render(
			<Lightbox
				{...defaultProps}
				carouselOptions={{
					...defaultProps.carouselOptions,
					onSlideChange,
				}}
			/>,
		);

		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should render controls by default", () => {
		render(<Lightbox {...defaultProps} />);

		expect(screen.getByLabelText("Previous image")).toBeInTheDocument();

		expect(screen.getByLabelText("Next image")).toBeInTheDocument();
	});

	it("should hide controls when withControls={false}", () => {
		render(
			<Lightbox {...defaultProps} carouselOptions={{ withControls: false }} />,
		);

		expect(screen.queryByLabelText("Previous image")).not.toBeInTheDocument();

		expect(screen.queryByLabelText("Next image")).not.toBeInTheDocument();
	});

	it("should mark prev control inactive at first slide when loop={false}", () => {
		render(
			<Lightbox
				{...defaultProps}
				carouselOptions={{
					...defaultProps.carouselOptions,
					emblaOptions: { loop: false },
				}}
			/>,
		);

		expect(screen.getByLabelText("Previous image")).toHaveAttribute(
			"data-inactive",
			"true",
		);
	});

	it("should mark next control inactive at last slide when loop={false}", () => {
		render(
			<Lightbox
				{...defaultProps}
				carouselOptions={{
					...defaultProps.carouselOptions,
					initialSlide: 2,
					emblaOptions: { loop: false },
				}}
			/>,
		);

		expect(screen.getByLabelText("Next image")).toHaveAttribute(
			"data-inactive",
			"true",
		);
	});

	it("should not mark controls inactive when loop={true}", () => {
		render(
			<Lightbox
				{...defaultProps}
				carouselOptions={{
					...defaultProps.carouselOptions,
					emblaOptions: { loop: true },
				}}
			/>,
		);

		expect(screen.getByLabelText("Previous image")).not.toHaveAttribute(
			"data-inactive",
		);
	});

	it("should keep prev control active with loop={true} and initialSlide at last slide", () => {
		render(
			<Lightbox
				{...defaultProps}
				carouselOptions={{
					...defaultProps.carouselOptions,
					initialSlide: 2,
					emblaOptions: { loop: true },
				}}
			/>,
		);

		expect(screen.getByLabelText("Previous image")).not.toHaveAttribute(
			"data-inactive",
		);
	});

	it("should render controls with loop={true} and a single slide", () => {
		render(
			<Lightbox
				opened
				onClose={() => {}}
				carouselOptions={{
					previousControlProps: { "aria-label": "Previous image" },
					nextControlProps: { "aria-label": "Next image" },
					emblaOptions: { loop: true },
				}}
			>
				<Lightbox.Slide>
					<img src="/only.jpg" alt="Only slide" />
				</Lightbox.Slide>
			</Lightbox>,
		);

		expect(screen.getByLabelText("Previous image")).toBeInTheDocument();

		expect(screen.getByLabelText("Next image")).toBeInTheDocument();
	});

	it("should render counter by default", () => {
		render(<Lightbox {...defaultProps} />);

		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should hide counter when withCounter={false}", () => {
		render(<Lightbox {...defaultProps} withCounter={false} />);

		expect(screen.queryByText("1 / 3")).not.toBeInTheDocument();
	});

	it("should use custom counterFormatter", () => {
		render(
			<Lightbox
				{...defaultProps}
				withCounter
				counterFormatter={(i, t) => `${i + 1} of ${t}`}
			/>,
		);

		expect(screen.getByText("1 of 3")).toBeInTheDocument();
	});

	it("should show correct counter value when initialSlide is set", () => {
		render(
			<Lightbox {...defaultProps} carouselOptions={{ initialSlide: 2 }} />,
		);

		expect(screen.getByText("3 / 3")).toBeInTheDocument();
	});

	it("should show correct counter value when initialSlide is 1", () => {
		render(
			<Lightbox {...defaultProps} carouselOptions={{ initialSlide: 1 }} />,
		);

		expect(screen.getByText("2 / 3")).toBeInTheDocument();
	});

	it("should not crash on ArrowRight keydown", async () => {
		render(<Lightbox {...defaultProps} />);

		await userEvent.keyboard("{ArrowRight}");

		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should not crash on ArrowLeft keydown", async () => {
		render(
			<Lightbox {...defaultProps} carouselOptions={{ initialSlide: 2 }} />,
		);

		await userEvent.keyboard("{ArrowLeft}");

		expect(screen.getByText("3 / 3")).toBeInTheDocument();
	});

	it("should ignore keyboard events when lightbox is closed", async () => {
		render(<Lightbox {...defaultProps} opened={false} />);

		await userEvent.keyboard("{ArrowRight}");

		await userEvent.keyboard("{ArrowLeft}");

		expect(screen.queryByText("1 / 3")).not.toBeInTheDocument();
	});

	it("should render thumbnails by default", () => {
		render(<Lightbox {...defaultProps} />);

		expect(screen.getByLabelText("Go to slide 1")).toBeInTheDocument();

		expect(screen.getByLabelText("Go to slide 2")).toBeInTheDocument();

		expect(screen.getByLabelText("Go to slide 3")).toBeInTheDocument();
	});

	it("should hide thumbnails when withThumbnails={false}", () => {
		render(<Lightbox {...defaultProps} withThumbnails={false} />);

		expect(screen.queryByLabelText("Go to slide 1")).not.toBeInTheDocument();
	});

	it("should render thumbnail ReactNode from Slide", () => {
		render(
			<Lightbox opened onClose={() => {}} withThumbnails>
				<Lightbox.Slide thumbnail={<img src="/thumb.jpg" alt="Thumb" />}>
					<div>Custom content</div>
				</Lightbox.Slide>
			</Lightbox>,
		);

		const thumb = screen.getByLabelText("Go to slide 1").querySelector("img");

		expect(thumb).toHaveAttribute("src", "/thumb.jpg");
	});

	it("should render placeholder thumbnail when thumbnail is omitted", () => {
		render(
			<Lightbox opened onClose={() => {}} withThumbnails>
				<Lightbox.Slide>
					<div>No image</div>
				</Lightbox.Slide>
			</Lightbox>,
		);

		const button = screen.getByLabelText("Go to slide 1");

		expect(button.querySelector("img")).not.toBeInTheDocument();

		expect(button.querySelector("svg")).toBeInTheDocument();
	});

	it("should match thumbnail count to slide count", () => {
		render(<Lightbox {...defaultProps} />);

		expect(screen.getByLabelText("Go to slide 1")).toBeInTheDocument();

		expect(screen.getByLabelText("Go to slide 2")).toBeInTheDocument();

		expect(screen.getByLabelText("Go to slide 3")).toBeInTheDocument();

		expect(screen.queryByLabelText("Go to slide 4")).not.toBeInTheDocument();
	});

	it("should set data-active on thumbnail for current slide by default", () => {
		render(<Lightbox {...defaultProps} />);

		expect(screen.getByLabelText("Go to slide 1")).toHaveAttribute(
			"data-active",
			"true",
		);

		expect(screen.getByLabelText("Go to slide 2")).not.toHaveAttribute(
			"data-active",
		);

		expect(screen.getByLabelText("Go to slide 3")).not.toHaveAttribute(
			"data-active",
		);
	});

	it("should reflect initialSlide in thumbnail active state", () => {
		render(
			<Lightbox {...defaultProps} carouselOptions={{ initialSlide: 1 }} />,
		);

		expect(screen.getByLabelText("Go to slide 1")).not.toHaveAttribute(
			"data-active",
		);

		expect(screen.getByLabelText("Go to slide 2")).toHaveAttribute(
			"data-active",
			"true",
		);
	});

	it("should register keyboard listener when opened", () => {
		const addSpy = jest.spyOn(document, "addEventListener");

		render(<Lightbox {...defaultProps} />);

		expect(addSpy).toHaveBeenCalledWith("keydown", expect.any(Function));

		addSpy.mockRestore();
	});

	it("should remove keydown listener when opened changes to false", () => {
		const removeSpy = jest.spyOn(document, "removeEventListener");

		const { rerender } = render(<Lightbox {...defaultProps} />);

		rerender(<Lightbox {...defaultProps} opened={false} />);

		expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));

		removeSpy.mockRestore();
	});

	it("should remove keydown listener on unmount", () => {
		const removeSpy = jest.spyOn(document, "removeEventListener");

		const { unmount } = render(<Lightbox {...defaultProps} />);

		unmount();

		expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));

		removeSpy.mockRestore();
	});

	it("should render slide children", () => {
		render(
			<Lightbox opened onClose={() => {}}>
				<Lightbox.Slide>
					<span>Custom slide content</span>
				</Lightbox.Slide>
			</Lightbox>,
		);

		expect(screen.getByText("Custom slide content")).toBeInTheDocument();
	});

	it("should forward previousControlProps to prev button", () => {
		render(
			<Lightbox
				{...defaultProps}
				carouselOptions={{
					...defaultProps.carouselOptions,
					previousControlProps: {
						"data-testid": "prev-btn",
						"aria-label": "Previous image",
					},
				}}
			/>,
		);

		expect(screen.getByTestId("prev-btn")).toBeInTheDocument();
	});

	it("should forward nextControlProps to next button", () => {
		render(
			<Lightbox
				{...defaultProps}
				carouselOptions={{
					...defaultProps.carouselOptions,
					nextControlProps: {
						"data-testid": "next-btn",
						"aria-label": "Next image",
					},
				}}
			/>,
		);

		expect(screen.getByTestId("next-btn")).toBeInTheDocument();
	});

	it("should accept controlSize prop without error", () => {
		render(
			<Lightbox
				{...defaultProps}
				carouselOptions={{
					...defaultProps.carouselOptions,
					controlSize: 48,
				}}
			/>,
		);

		expect(screen.getByLabelText("Previous image")).toBeInTheDocument();

		expect(screen.getByLabelText("Next image")).toBeInTheDocument();
	});

	it("should call getEmblaApi with the Embla API instance after mount", async () => {
		const getEmblaApi = jest.fn();

		render(
			<Lightbox
				{...defaultProps}
				carouselOptions={{
					...defaultProps.carouselOptions,
					getEmblaApi,
				}}
			/>,
		);

		await waitFor(() =>
			expect(getEmblaApi).toHaveBeenCalledWith(
				expect.objectContaining({ scrollNext: expect.any(Function) }),
			),
		);
	});

	it("should render all slides in the DOM regardless of which is active", () => {
		render(<Lightbox {...defaultProps} />);

		expect(screen.getByAltText("Forest landscape")).toBeInTheDocument();

		expect(screen.getByAltText("Mountain view")).toBeInTheDocument();

		expect(screen.getByAltText("Ocean sunset")).toBeInTheDocument();
	});

	it("should accept startIndex without error", () => {
		// startIndex sets Embla's initial position, but the Lightbox counter
		// is initialized from carouselOptions.initialSlide, not emblaOptions.startIndex.
		// Counter shows "1 / 3" because initialSlide is not set.
		render(
			<Lightbox
				{...defaultProps}
				carouselOptions={{
					...defaultProps.carouselOptions,
					emblaOptions: { startIndex: 2 },
				}}
			/>,
		);

		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should prioritize initialSlide over emblaOptions.startIndex for the counter", () => {
		// When both are set, initialSlide drives the counter display.
		render(
			<Lightbox
				{...defaultProps}
				carouselOptions={{
					...defaultProps.carouselOptions,
					initialSlide: 1,
					emblaOptions: { startIndex: 2 },
				}}
			/>,
		);

		expect(screen.getByText("2 / 3")).toBeInTheDocument();
	});

	it("should render carousel without errors when direction is rtl", () => {
		render(
			<Lightbox
				{...defaultProps}
				carouselOptions={{
					...defaultProps.carouselOptions,
					emblaOptions: { direction: "rtl" },
				}}
			/>,
		);

		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should render without errors when active is false", () => {
		render(
			<Lightbox
				{...defaultProps}
				carouselOptions={{
					...defaultProps.carouselOptions,
					emblaOptions: { active: false, loop: false },
				}}
			/>,
		);

		// With active: false, Embla disables all scrolling.
		// Both controls should be marked inactive.
		expect(screen.getByLabelText("Previous image")).toHaveAttribute(
			"data-inactive",
			"true",
		);

		expect(screen.getByLabelText("Next image")).toHaveAttribute(
			"data-inactive",
			"true",
		);
	});

	it("should render without errors when draggable is false", () => {
		render(
			<Lightbox
				{...defaultProps}
				carouselOptions={{
					...defaultProps.carouselOptions,
					emblaOptions: { watchDrag: false },
				}}
			/>,
		);

		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should render without errors when dragFree is true", () => {
		render(
			<Lightbox
				{...defaultProps}
				carouselOptions={{
					...defaultProps.carouselOptions,
					emblaOptions: { dragFree: true },
				}}
			/>,
		);

		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should render without errors when slidesToScroll is 2", () => {
		render(
			<Lightbox
				{...defaultProps}
				carouselOptions={{
					...defaultProps.carouselOptions,
					emblaOptions: { slidesToScroll: 2 },
				}}
			/>,
		);

		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should call onClose when Escape is pressed", async () => {
		const onClose = jest.fn();

		render(<Lightbox {...defaultProps} onClose={onClose} />);

		await userEvent.keyboard("{Escape}");

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("should render slide content even when closed when keepMounted is true", () => {
		render(
			<Lightbox
				{...defaultProps}
				opened={false}
				modalOptions={{ keepMounted: true }}
			/>,
		);

		// With keepMounted, Modal keeps content in the DOM (hidden).
		// Contrast with the "does not render when closed" test which asserts
		// the close button is absent when keepMounted is not set.
		expect(screen.getByAltText("Forest landscape")).toBeInTheDocument();
	});

	it("should accept overlayProps without error", () => {
		render(
			<Lightbox
				{...defaultProps}
				modalOptions={{ overlayProps: { backgroundOpacity: 0.5 } }}
			/>,
		);

		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should accept transitionProps without error", () => {
		render(
			<Lightbox
				{...defaultProps}
				modalOptions={{ transitionProps: { duration: 0 } }}
			/>,
		);

		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should accept zIndex without error", () => {
		render(<Lightbox {...defaultProps} modalOptions={{ zIndex: 9999 }} />);

		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should accept trapFocus as false without error", () => {
		render(<Lightbox {...defaultProps} modalOptions={{ trapFocus: false }} />);

		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should accept lockScroll as false without error", () => {
		render(<Lightbox {...defaultProps} modalOptions={{ lockScroll: false }} />);

		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should not crash when clicking a thumbnail", async () => {
		render(<Lightbox {...defaultProps} />);

		await userEvent.click(screen.getByLabelText("Go to slide 3"));

		// Counter stays at "1 / 3" because Embla doesn't fire onSelect in JSDOM
		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should render a mix of custom and placeholder thumbnails", () => {
		render(
			<Lightbox opened onClose={() => {}} withThumbnails>
				<Lightbox.Slide thumbnail={<img src="/thumb1.jpg" alt="Thumb 1" />}>
					<div>Slide 1</div>
				</Lightbox.Slide>
				<Lightbox.Slide>
					<div>Slide 2 (no thumbnail)</div>
				</Lightbox.Slide>
				<Lightbox.Slide thumbnail={<img src="/thumb3.jpg" alt="Thumb 3" />}>
					<div>Slide 3</div>
				</Lightbox.Slide>
			</Lightbox>,
		);

		expect(
			screen.getByLabelText("Go to slide 1").querySelector("img"),
		).toHaveAttribute("src", "/thumb1.jpg");

		expect(
			screen.getByLabelText("Go to slide 2").querySelector("svg"),
		).toBeInTheDocument();

		expect(
			screen.getByLabelText("Go to slide 3").querySelector("img"),
		).toHaveAttribute("src", "/thumb3.jpg");
	});

	it("should render with a single slide without crashing", () => {
		render(
			<Lightbox opened onClose={() => {}}>
				<Lightbox.Slide>
					<img src="/one.jpg" alt="Only slide" />
				</Lightbox.Slide>
			</Lightbox>,
		);

		expect(screen.getByText("1 / 1")).toBeInTheDocument();

		expect(screen.getByAltText("Only slide")).toBeInTheDocument();
	});

	it("should render with many slides without crashing", () => {
		const slideIds = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

		const slides = slideIds.map((id) => (
			<Lightbox.Slide key={id}>
				<img src={`/slide-${id}.jpg`} alt={`Slide ${id}`} />
			</Lightbox.Slide>
		));

		render(
			<Lightbox opened onClose={() => {}}>
				{slides}
			</Lightbox>,
		);

		expect(screen.getByText("1 / 10")).toBeInTheDocument();
	});

	it("should render with no slides without crashing", () => {
		render(<Lightbox opened onClose={() => {}} />);

		expect(screen.getByLabelText("Close lightbox")).toBeInTheDocument();
	});
});
