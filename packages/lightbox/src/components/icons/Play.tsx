import type { SVGProps } from "react";

export const Play = (props: SVGProps<SVGSVGElement>) => (
	<svg
		aria-hidden="true"
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="currentColor"
		stroke="none"
		{...props}
	>
		<polygon points="5 3 19 12 5 21 5 3" />
	</svg>
);
