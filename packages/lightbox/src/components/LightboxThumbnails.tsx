import { Box, UnstyledButton } from "@mantine/core";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import { useThumbnails } from "../hooks/useThumbnails.js";
import { useLightboxContext } from "../Lightbox.context.js";
import { QuestionMark } from "./QuestionMark.js";

interface LightboxThumbnailsProps {
	emblaOptions: EmblaOptionsType | undefined;
	onEmblaApi: (embla: EmblaCarouselType) => void;
}

export function LightboxThumbnails(props: LightboxThumbnailsProps) {
	const { emblaOptions, onEmblaApi } = props;

	const { getStyles, slides, currentIndex, onThumbnailClick } =
		useLightboxContext();

	const { setViewportRef, containerRef, hasOverflow } = useThumbnails({
		emblaOptions,
		onEmblaApi,
	});

	return (
		<Box {...getStyles("thumbnails")}>
			<Box ref={setViewportRef} {...getStyles("thumbnailsViewport")}>
				<Box
					ref={containerRef}
					{...getStyles("thumbnailsContainer")}
					data-overflow={hasOverflow || undefined}
				>
					{slides.map((slide, i) => {
						const { thumbnail } = slide.props;

						return (
							<Box {...getStyles("thumbnailSlide")} key={slide.key ?? i}>
								<UnstyledButton
									onClick={() => onThumbnailClick(i)}
									aria-label={`Go to slide ${i + 1}`}
									aria-current={i === currentIndex ? "true" : undefined}
									data-active={i === currentIndex || undefined}
									{...getStyles("thumbnailButton")}
								>
									{thumbnail ?? (
										<Box {...getStyles("thumbnailPlaceholder")}>
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
