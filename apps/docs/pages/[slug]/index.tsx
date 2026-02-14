import type { GetStaticPaths, GetStaticProps } from "next";
import dynamic from "next/dynamic";
import { DocsTabs } from "../../components/DocsTabs";
import { PageHeader } from "../../components/PageHeader";
import { Shell } from "../../components/Shell";
import { PACKAGES_DATA } from "../../data";
import docgen from "../../docgen.json";

const MDX_CONTENT: Record<string, React.ComponentType> = {
	example: dynamic(() => import("../../docs/example.mdx")),
};

const STYLES_API: Record<string, any> = {
	example: require("../../styles-api/example").STYLES_API_DATA,
};

interface PackagePageProps {
	slug: string;
}

export const getStaticPaths: GetStaticPaths = () => {
	return {
		paths: Object.keys(PACKAGES_DATA).map((slug) => ({ params: { slug } })),
		fallback: false,
	};
};

export const getStaticProps: GetStaticProps<PackagePageProps> = ({
	params,
}) => {
	return { props: { slug: params?.slug as string } };
};

export default function PackagePage({ slug }: PackagePageProps) {
	const data = PACKAGES_DATA[slug];
	const Docs = MDX_CONTENT[slug];
	const stylesApiData = STYLES_API[slug];

	if (!data || !Docs) {
		throw new Error("Data is missing");
	}

	return (
		<Shell>
			<PageHeader data={data} />
			<DocsTabs
				docgen={docgen}
				componentsProps={data.componentsProps}
				componentsStyles={data.componentsStyles}
				stylesApiData={stylesApiData}
			>
				<Docs />
			</DocsTabs>
		</Shell>
	);
}
