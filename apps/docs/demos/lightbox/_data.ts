import bg1 from "../../assets/bg-1.png";
import bg2 from "../../assets/bg-2.png";
import bg3 from "../../assets/bg-3.png";
import bg4 from "../../assets/bg-4.png";
import bg5 from "../../assets/bg-5.png";
import bg6 from "../../assets/bg-6.png";

export { bg1, bg2, bg3, bg4, bg5, bg6 };

export interface DemoImage {
	src: string;
	alt: string;
	caption?: string;
	width?: number;
	height?: number;
}

export const IMAGES: DemoImage[] = [
	{
		src: bg1.src,
		alt: "Desert",
		caption: "A desert landscape at sunset",
		width: 2400,
		height: 1600,
	},
	{
		src: bg2.src,
		alt: "Forest",
		caption: "Sunlight through the forest trees",
		width: 1200,
		height: 800,
	},
	{
		src: bg3.src,
		alt: "Torii Gate",
		caption: "A traditional Japanese torii gate on water",
		width: 2400,
		height: 1600,
	},
	{
		src: bg4.src,
		alt: "Mountain",
		caption: "Cherry blossoms near Mount Fuji",
		width: 1200,
		height: 800,
	},
	{
		src: bg5.src,
		alt: "Night Lake",
		caption: "A quiet lake under the full moon",
		width: 2400,
		height: 1600,
	},
	{
		src: bg6.src,
		alt: "Lighthouse",
		caption: "A lighthouse guiding ships at night",
		width: 1200,
		height: 800,
	},
];
