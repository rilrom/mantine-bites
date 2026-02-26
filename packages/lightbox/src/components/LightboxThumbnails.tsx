import { Box, UnstyledButton } from "@mantine/core";
import { useThumbnails } from "../hooks/useThumbnails.js";
import { useLightboxContext } from "../Lightbox.context.js";
import { QuestionMark } from "./QuestionMark.js";

export function LightboxThumbnails() {
	const ctx = useLightboxContext();

	const { setViewportRef, containerRef, hasOverflow } = useThumbnails({
		emblaOptions: ctx.emblaOptions,
		onEmblaApi: ctx.onEmblaApi,
	});

	return (
		<Box {...ctx.getStyles("thumbnails")}>
			<Box ref={setViewportRef} {...ctx.getStyles("thumbnailsViewport")}>
				<Box
					ref={containerRef}
					{...ctx.getStyles("thumbnailsContainer")}
					data-overflow={hasOverflow || undefined}
				>
					{ctx.slides.map((slide, i) => {
						const { thumbnail } = slide.props;

						return (
							<Box {...ctx.getStyles("thumbnailSlide")} key={slide.key ?? i}>
								<UnstyledButton
									onClick={() => ctx.onThumbnailClick(i)}
									aria-label={`Go to slide ${i + 1}`}
									aria-current={i === ctx.currentIndex ? "true" : undefined}
									data-active={i === ctx.currentIndex || undefined}
									{...ctx.getStyles("thumbnailButton")}
								>
									{thumbnail ?? (
										<Box {...ctx.getStyles("thumbnailPlaceholder")}>
											<QuestionMark />
										</Box>
									)}
								</UnstyledButton>
							</Box>
						);
					})}
				</Box>
			</Box>
		</Box>
	);
}
