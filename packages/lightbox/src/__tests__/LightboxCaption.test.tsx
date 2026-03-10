import { render, screen } from "@mantine-tests/core";
import { Lightbox, LightboxCaption } from "../index.js";

// LightboxCaption needs to render inside LightboxRoot > LightboxSlides > LightboxSlide
// to have access to the lightbox context (getStyles).
function renderCaption(caption: string) {
	return render(
		<Lightbox.Root opened onClose={() => {}}>
			<Lightbox.Slides>
				<Lightbox.Slide>
					<img src="/photo.jpg" alt="A forest scene" />
					<LightboxCaption>{caption}</LightboxCaption>
				</Lightbox.Slide>
			</Lightbox.Slides>
		</Lightbox.Root>,
	);
}

describe("@mantine-bites/lightbox/LightboxCaption", () => {
	it("renders caption text", () => {
		renderCaption("A beautiful forest");
		expect(screen.getByText("A beautiful forest")).toBeInTheDocument();
	});

	it("has correct displayName", () => {
		expect(LightboxCaption.displayName).toBe("LightboxCaption");
	});

	it("has classes property", () => {
		expect(LightboxCaption.classes).toBeDefined();
	});

	it("is exposed as Lightbox.Caption static", () => {
		expect(Lightbox.Caption).toBeDefined();
		expect(Lightbox.Caption).toBe(LightboxCaption);
	});

	it("is exposed as Lightbox.Root.Caption static", () => {
		expect(Lightbox.Root.Caption).toBeDefined();
		expect(Lightbox.Root.Caption).toBe(LightboxCaption);
	});
});
