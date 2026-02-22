import { Box, UnstyledButton } from "@mantine/core";
import { useLightboxContext } from "../Lightbox.context.js";
import { QuestionMark } from "./QuestionMark.js";

export function LightboxThumbnails() {
	const { getStyles, slides, currentIndex, onThumbnailClick } =
		useLightboxContext();

	return (
		<Box {...getStyles("thumbnails")}>
			{slides.map((slide, i) => {
				const { thumbnail } = slide.props;

				return (
					<UnstyledButton
						key={slide.key ?? i}
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
				);
			})}
		</Box>
	);
}
