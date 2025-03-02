import {
	FC,
	ReactNode,
	createContext,
	useContext,
	useMemo,
	useState,
	useEffect,
} from "react";
import { Program, AnchorProvider, Idl, setProvider } from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import {
	AnchorWallet,
	useAnchorWallet,
	useConnection,
} from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";

const WorkspaceContext = createContext({});

export interface Workspace {
	connection?: Connection;
	provider?: AnchorProvider;
	wallet?: AnchorWallet;
	publicKey?: string;
	solBalance?: number;
}

const WorkspaceProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const wallet = useAnchorWallet();
	const { connection } = useConnection();
	const [solBalance, setSolBalance] = useState<number | undefined>(undefined);

	const provider = new AnchorProvider(connection, wallet ?? MockWallet, {});
	setProvider(provider);

	const publicKey = useMemo(() => {
		return wallet ? wallet.publicKey.toBase58() : null;
	}, [wallet]);

	useEffect(() => {
		let subscriptionId: number;

		const fetchBalance = async () => {
			if (wallet && wallet.publicKey) {
				const lamports = await connection.getBalance(wallet.publicKey);
				const solBalance = (lamports / 1e9).toFixed(2);
				setSolBalance(Number(solBalance));
			} else {
				setSolBalance(undefined);
			}
		};
		if (wallet && wallet.publicKey) {
			// Fetch the initial balance
			fetchBalance();
			// Set up account change listener
			subscriptionId = connection.onAccountChange(
				wallet.publicKey,
				async () => {
					await fetchBalance();
				}
			);
		}
		// Clean up subscription on unmount or when dependencies change
		return () => {
			if (subscriptionId) {
				connection.removeAccountChangeListener(subscriptionId);
			}
		};
	}, [wallet, connection]);

	const workspace = {
		connection,
		provider,
		wallet,
		publicKey,
		solBalance,
	};

	return (
		<WorkspaceContext.Provider value={workspace}>
			{children}
		</WorkspaceContext.Provider>
	);
};

const useWorkspace = (): Workspace => {
	return useContext(WorkspaceContext);
};

const MockWallet = {
	publicKey: Keypair.generate().publicKey,
	signTransaction: () => Promise.reject(),
	signAllTransactions: () => Promise.reject(),
};

export { WorkspaceProvider, useWorkspace };
