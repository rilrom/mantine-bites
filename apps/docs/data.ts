export interface PackageData {
	/** Package name as in npm, for example, `@mantine-bites/example` */
	packageName: string;

	/** Description of the package, displayed below the title in documentation */
	packageDescription: string;

	/** Link to the documentation mdx file, used in "Edit this page button" */
	mdxFileUrl: string;

	/** Link to the repository on GitHub, used in header github icon and in "View source code button" */
	repositoryUrl: string;

	/** Link to the license file */
	licenseUrl?: string;

	/** Information about the author of the package */
	author: {
		/** Package author name, for example, `John Doe` */
		name: string;

		/** Author GitHub username, for example, `johndoe` */
		githubUsername: string;
	};

	/** Component names for the props table, matching keys in docgen.json */
	componentsProps: string[];

	/** Component names for the styles API table */
	componentsStyles: string[];
}

export const REPO_URL = "https://github.com/rilrom/mantine-bites";

export const PACKAGES_DATA: Record<string, PackageData> = {
	example: {
		packageName: "@mantine-bites/example",
		packageDescription: "Example extension",
		mdxFileUrl:
			"https://github.com/rilrom/mantine-bites/blob/master/apps/docs/docs/example.mdx",
		repositoryUrl: REPO_URL,
		licenseUrl: "https://github.com/rilrom/mantine-bites/blob/master/LICENSE",
		author: {
			name: "Riley Langbein",
			githubUsername: "rilrom",
		},
		componentsProps: ["TestComponent"],
		componentsStyles: ["TestComponent"],
	},
};
