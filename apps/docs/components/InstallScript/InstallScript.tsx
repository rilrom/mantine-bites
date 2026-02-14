import { MdxNpmScript } from "./MdxNpmScript";

interface MdxInstallScriptProps {
	packages: string;
	dev?: boolean;
}

export function InstallScript({ packages, dev }: MdxInstallScriptProps) {
	return (
		<MdxNpmScript
			yarnScript={`yarn add ${dev ? "--dev " : ""}${packages}`}
			npmScript={`npm install ${dev ? "--save-dev " : ""}${packages}`}
			pnpmScript={`pnpm add ${dev ? "--dev " : ""}${packages}`}
		/>
	);
}
