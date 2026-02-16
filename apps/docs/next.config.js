import createMDX from "@next/mdx";
import remarkSlug from "remark-slug";

const withMDX = createMDX({
	options: {
		remarkPlugins: [remarkSlug],
	},
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	output: "export",
	basePath:
		process.env.NODE_ENV === "production" ? "/mantine-bites" : undefined,
	pageExtensions: ["ts", "tsx", "mdx"],
	eslint: {
		ignoreDuringBuilds: true,
	},
};

export default withMDX(nextConfig);
