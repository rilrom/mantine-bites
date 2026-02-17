import { render, screen } from "@mantine-tests/core";
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
	it("has correct displayName", () => {
		expect(Lightbox.displayName).toBe("Lightbox");
	});

	it("has static classes", () => {
		expect(Lightbox.classes).toBeDefined();
	});

	it("has static extend function", () => {
		expect(Lightbox.extend).toBeDefined();
	});

	it("supports ref", () => {
		const ref = { current: null as HTMLDivElement | null };
		render(<Lightbox {...defaultProps} ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});

	it("does not render when closed", () => {
		render(<Lightbox {...defaultProps} opened={false} />);
		expect(screen.queryByLabelText("Close lightbox")).not.toBeInTheDocument();
	});

	it("always renders close button", () => {
		render(<Lightbox {...defaultProps} />);
		expect(screen.getByLabelText("Close lightbox")).toBeInTheDocument();
	});

	it("calls onClose when close button is clicked", async () => {
		const onClose = jest.fn();
		render(<Lightbox {...defaultProps} onClose={onClose} />);
		await userEvent.click(screen.getByLabelText("Close lightbox"));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("renders first slide by default", () => {
		render(<Lightbox {...defaultProps} />);
		expect(screen.getByAltText("Forest landscape")).toBeInTheDocument();
	});

	it("renders at initialSlide position", () => {
		render(
			<Lightbox {...defaultProps} carouselOptions={{ initialSlide: 2 }} />,
		);
		expect(screen.getByAltText("Ocean sunset")).toBeInTheDocument();
	});

	it("accepts onSlideChange callback via carouselOptions", () => {
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

	it("renders controls by default", () => {
		render(<Lightbox {...defaultProps} />);
		expect(screen.getByLabelText("Previous image")).toBeInTheDocument();
		expect(screen.getByLabelText("Next image")).toBeInTheDocument();
	});

	it("hides controls when withControls={false}", () => {
		render(
			<Lightbox {...defaultProps} carouselOptions={{ withControls: false }} />,
		);
		expect(screen.queryByLabelText("Previous image")).not.toBeInTheDocument();
		expect(screen.queryByLabelText("Next image")).not.toBeInTheDocument();
	});

	it("marks prev control inactive at first slide when loop={false}", () => {
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

	it("marks next control inactive at last slide when loop={false}", () => {
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

	it("does not mark controls inactive when loop={true}", () => {
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

	it("renders counter by default", () => {
		render(<Lightbox {...defaultProps} />);
		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("hides counter when withCounter={false}", () => {
		render(<Lightbox {...defaultProps} withCounter={false} />);
		expect(screen.queryByText("1 / 3")).not.toBeInTheDocument();
	});

	it("uses custom counterFormatter", () => {
		render(
			<Lightbox
				{...defaultProps}
				withCounter
				counterFormatter={(i, t) => `${i + 1} of ${t}`}
			/>,
		);
		expect(screen.getByText("1 of 3")).toBeInTheDocument();
	});

	it("renders thumbnails by default", () => {
		render(<Lightbox {...defaultProps} />);
		expect(screen.getByLabelText("Go to slide 1")).toBeInTheDocument();
		expect(screen.getByLabelText("Go to slide 2")).toBeInTheDocument();
		expect(screen.getByLabelText("Go to slide 3")).toBeInTheDocument();
	});

	it("hides thumbnails when withThumbnails={false}", () => {
		render(<Lightbox {...defaultProps} withThumbnails={false} />);
		expect(screen.queryByLabelText("Go to slide 1")).not.toBeInTheDocument();
	});

	it("renders thumbnail ReactNode from Slide", () => {
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

	it("renders placeholder thumbnail when thumbnail is omitted", () => {
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

	it("registers keyboard listener when opened", () => {
		const addSpy = jest.spyOn(document, "addEventListener");
		render(<Lightbox {...defaultProps} />);
		expect(addSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
		addSpy.mockRestore();
	});

	it("renders slide children", () => {
		render(
			<Lightbox opened onClose={() => {}}>
				<Lightbox.Slide>
					<span>Custom slide content</span>
				</Lightbox.Slide>
			</Lightbox>,
		);
		expect(screen.getByText("Custom slide content")).toBeInTheDocument();
	});
});
