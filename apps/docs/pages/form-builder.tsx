import "@mantine/dates/styles.css";
import Head from "next/head";
import { FormBuilder } from "../components/FormBuilder";
import { Shell } from "../components/Shell";

export default function FormBuilderPage() {
	return (
		<Shell fluid>
			<Head>
				<title>Form Builder | Mantine Bites</title>
			</Head>
			<FormBuilder />
		</Shell>
	);
}
