import { DocsTabs } from "../components/DocsTabs";
import { PageHeader } from "../components/PageHeader";
import { Shell } from "../components/Shell";
import { PACKAGES_DATA } from "../data";
import docgen from "../docgen.json";

import Docs from "../docs/lightbox.mdx";
import { STYLES_API_DATA } from "../styles-api/lightbox";

export default function LightboxPackagePage() {
	const slug = "lightbox";
	const data = PACKAGES_DATA[slug];

	if (!data) {
		throw new Error("Data is missing");
	}

	return (
		<Shell>
			<PageHeader data={data} />
			<DocsTabs
				docgen={docgen}
				componentsProps={data.componentsProps}
				componentsStyles={data.componentsStyles}
				stylesApiData={STYLES_API_DATA}
			>
				<Docs />
			</DocsTabs>
		</Shell>
	);
}
