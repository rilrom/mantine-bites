import { Box, type GetStylesApi, UnstyledButton } from "@mantine/core";
import type { ReactElement, ReactNode } from "react";
import type { LightboxFactory } from "../Lightbox.js";
import { QuestionMark } from "./QuestionMark.js";

interface LightboxThumbnailsProps {
	slides: ReactElement<{ thumbnail?: ReactNode }>[];
	currentIndex: number;
	onThumbnailClick: (index: number) => void;
	getStyles: GetStylesApi<LightboxFactory>;
}

export function LightboxThumbnails(props: LightboxThumbnailsProps) {
	const { slides, currentIndex, onThumbnailClick, getStyles } = props;

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
