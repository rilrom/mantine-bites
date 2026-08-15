import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import remarkSlug from "remark-slug";

const withMDX = createMDX({
	options: {
		remarkPlugins: [remarkGfm, remarkSlug],
	},
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	output: "export",
	trailingSlash: true,
	basePath:
		process.env.NODE_ENV === "production" ? "/mantine-bites" : undefined,
	pageExtensions: ["ts", "tsx", "mdx"],
	eslint: {
		ignoreDuringBuilds: true,
	},
	images: {
		unoptimized: true,
	},
};

export default withMDX(nextConfig);
