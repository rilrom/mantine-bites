import { render, screen } from "@mantine-tests/core";
import { Lightbox, type LightboxProps } from "../index.js";

const sampleImages = [
	{ src: "/photo-1.jpg", alt: "Forest" },
	{ src: "/photo-2.jpg", alt: "Mountain" },
	{ src: "/photo-3.jpg", alt: "Ocean" },
];

const defaultProps: LightboxProps = {
	opened: true,
	onClose: () => {},
	images: sampleImages,
};

describe("@mantine-bites/lightbox/Lightbox simple API", () => {
	it("should expose compound static members on Lightbox", () => {
		expect(Lightbox.Root).toBeDefined();
		expect(Lightbox.Toolbar).toBeDefined();
		expect(Lightbox.Counter).toBeDefined();
		expect(Lightbox.Controls).toBeDefined();
		expect(Lightbox.Slides).toBeDefined();
		expect(Lightbox.Slide).toBeDefined();
		expect(Lightbox.Thumbnails).toBeDefined();
		expect(Lightbox.Thumbnail).toBeDefined();
	});

	it("should render all image slides", () => {
		render(<Lightbox {...defaultProps} />);
		// Each image appears in both the slide and the thumbnail strip
		expect(screen.getAllByAltText("Forest")[0]).toBeInTheDocument();
		expect(screen.getAllByAltText("Mountain")[0]).toBeInTheDocument();
		expect(screen.getAllByAltText("Ocean")[0]).toBeInTheDocument();
	});

	it("should render thumbnails by default", () => {
		render(<Lightbox {...defaultProps} />);
		expect(screen.getByLabelText("Go to slide 1")).toBeInTheDocument();
	});

	it("should hide thumbnails when withThumbnails is false", () => {
		render(<Lightbox {...defaultProps} withThumbnails={false} />);
		expect(screen.queryByLabelText("Go to slide 1")).not.toBeInTheDocument();
	});

	it("should render counter by default", () => {
		render(<Lightbox {...defaultProps} />);
		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should hide counter when withCounter is false", () => {
		render(<Lightbox {...defaultProps} withCounter={false} />);
		expect(screen.queryByText("1 / 3")).not.toBeInTheDocument();
	});

	it("should render toolbar by default", () => {
		render(<Lightbox {...defaultProps} />);
		expect(screen.getByLabelText("Close lightbox")).toBeInTheDocument();
	});

	it("should hide toolbar when withToolbar is false", () => {
		render(<Lightbox {...defaultProps} withToolbar={false} />);
		expect(screen.queryByLabelText("Close lightbox")).not.toBeInTheDocument();
	});

	it("should render prev/next controls by default", () => {
		render(<Lightbox {...defaultProps} />);
		expect(screen.getByLabelText("Previous slide")).toBeInTheDocument();
		expect(screen.getByLabelText("Next slide")).toBeInTheDocument();
	});

	it("should hide controls when withControls is false", () => {
		render(<Lightbox {...defaultProps} withControls={false} />);
		expect(screen.queryByLabelText("Previous slide")).not.toBeInTheDocument();
		expect(screen.queryByLabelText("Next slide")).not.toBeInTheDocument();
	});

	it("should not render content when closed", () => {
		render(<Lightbox {...defaultProps} opened={false} />);
		expect(screen.queryByAltText("Forest")).not.toBeInTheDocument();
	});

	it("should render at the slide specified by slidesProps.initialSlide", async () => {
		render(<Lightbox {...defaultProps} slidesProps={{ initialSlide: 2 }} />);
		expect(await screen.findByText("3 / 3")).toBeInTheDocument();
	});

	it("should accept slidesProps.emblaOptions without error", () => {
		render(
			<Lightbox
				{...defaultProps}
				slidesProps={{ emblaOptions: { loop: true } }}
			/>,
		);
		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should accept thumbnailsProps.emblaOptions without error", () => {
		render(
			<Lightbox
				{...defaultProps}
				thumbnailsProps={{ emblaOptions: { dragFree: false } }}
			/>,
		);
		expect(screen.getByLabelText("Go to slide 1")).toBeInTheDocument();
	});

	it("should apply counterProps.formatter", () => {
		render(
			<Lightbox
				{...defaultProps}
				counterProps={{ formatter: (i, t) => `Slide ${i + 1} of ${t}` }}
			/>,
		);
		expect(screen.getByText("Slide 1 of 3")).toBeInTheDocument();
	});

	it("should accept controlsProps.size without error", () => {
		render(<Lightbox {...defaultProps} controlsProps={{ size: 48 }} />);
		expect(screen.getByLabelText("Previous slide")).toBeInTheDocument();
	});

	it("should apply width and height from image data to slide and thumbnail images", () => {
		render(
			<Lightbox
				opened
				onClose={() => {}}
				images={[
					{ src: "/photo-1.jpg", alt: "Forest", width: 1200, height: 800 },
				]}
			/>,
		);
		const imgs = screen.getAllByAltText("Forest");
		for (const img of imgs) {
			expect(img).toHaveAttribute("width", "1200");
			expect(img).toHaveAttribute("height", "800");
		}
	});

	it("should render with fallbackSrc without crashing", () => {
		render(
			<Lightbox
				opened
				onClose={() => {}}
				images={[
					{ src: "/photo-1.jpg", alt: "Forest", fallbackSrc: "/fallback.jpg" },
				]}
			/>,
		);
		expect(screen.getAllByAltText("Forest")[0]).toBeInTheDocument();
	});

	it("should render with fallbackThumbnailSrc without crashing", () => {
		render(
			<Lightbox
				opened
				onClose={() => {}}
				images={[
					{
						src: "/photo-1.jpg",
						alt: "Forest",
						fallbackThumbnailSrc: "/fallback-thumb.jpg",
					},
				]}
			/>,
		);
		expect(screen.getAllByAltText("Forest")[0]).toBeInTheDocument();
	});

	it("should forward slideImageProps to slide images", () => {
		render(
			<Lightbox
				{...defaultProps}
				slideImageProps={{ "data-testid": "slide-img" } as any}
			/>,
		);
		expect(screen.getAllByTestId("slide-img").length).toBeGreaterThan(0);
	});

	it("should forward thumbnailImageProps to thumbnail images", () => {
		render(
			<Lightbox
				{...defaultProps}
				thumbnailImageProps={{ "data-testid": "thumb-img" } as any}
			/>,
		);
		expect(screen.getAllByTestId("thumb-img").length).toBeGreaterThan(0);
	});

	it("should render slide images with a custom component via slideImageProps.renderRoot", () => {
		render(
			<Lightbox
				{...defaultProps}
				slideImageProps={{
					renderRoot: (props: any) => (
						<span data-testid="custom-slide-root" {...props} />
					),
				}}
			/>,
		);
		expect(screen.getAllByTestId("custom-slide-root").length).toBeGreaterThan(
			0,
		);
	});

	it("should render thumbnail images with a custom component via thumbnailImageProps.renderRoot", () => {
		render(
			<Lightbox
				{...defaultProps}
				thumbnailImageProps={{
					renderRoot: (props: any) => (
						<span data-testid="custom-thumb-root" {...props} />
					),
				}}
			/>,
		);
		expect(screen.getAllByTestId("custom-thumb-root").length).toBeGreaterThan(
			0,
		);
	});

	it("should use thumbnailSrc and thumbnailAlt for thumbnail images", () => {
		render(
			<Lightbox
				opened
				onClose={() => {}}
				images={[
					{
						src: "/photo-1.jpg",
						alt: "Forest",
						thumbnailSrc: "/thumb-1.jpg",
						thumbnailAlt: "Forest thumbnail",
					},
				]}
			/>,
		);

		expect(screen.getByAltText("Forest")).toHaveAttribute(
			"src",
			"/photo-1.jpg",
		);

		expect(screen.getByAltText("Forest thumbnail")).toHaveAttribute(
			"src",
			"/thumb-1.jpg",
		);
	});
});
