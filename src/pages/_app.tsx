import "../styles/globals.css";
import type { AppProps } from "next/app";
import { WalletContextProvider } from "../contexts/WalletContextProvider";
import { WorkspaceProvider } from "@/contexts/WorkspaceProvider";

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<WalletContextProvider>
			{/* <WorkspaceProvider> */}
			<Component {...pageProps} />
			{/* </WorkspaceProvider> */}
		</WalletContextProvider>
	);
}

export default MyApp;
