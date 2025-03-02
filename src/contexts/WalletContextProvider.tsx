import {
	ConnectionProvider,
	WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { LedgerWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import type { FC, ReactNode } from "react";
import { useMemo } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";

export const WalletContextProvider: FC<{ children: ReactNode }> = ({
	children,
}) => {
	const endpoint = useMemo(
		() => process.env.SOLANA_RPC ?? clusterApiUrl("devnet"),
		[]
	);
	const wallets = useMemo(() => [new LedgerWalletAdapter()], []);

	return (
		<ConnectionProvider endpoint={endpoint}>
			<WalletProvider wallets={wallets} autoConnect>
				<WalletModalProvider>{children}</WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
	);
};

export default WalletContextProvider;
