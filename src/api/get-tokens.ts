import { NextApiRequest, NextApiResponse } from "next";
import { Connection, PublicKey } from "@solana/web3.js";

const SOLANA_RPC = process.env.SOLANA_RPC as string;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const { wallet } = req.query;
		if (!wallet)
			return res.status(400).json({ error: "Wallet address required" });

		const connection = new Connection(SOLANA_RPC, "confirmed");
		const walletPubkey = new PublicKey(wallet);

		// Fetch token accounts
		const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
			walletPubkey,
			{
				programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
			}
		);

		const tokens = tokenAccounts.value
			.map((account) => {
				const info = account.account.data.parsed.info;
				return {
					mint: info.mint,
					balance: parseFloat(info.tokenAmount.uiAmountString),
					symbol: "Unknown Token", // Replace with actual token metadata API later
				};
			})
			.filter((token) => token.balance > 0); // Only keep non-zero balances

		res.json({ success: true, tokens });
	} catch (error) {
		console.error("Error fetching tokens:", error);
		res.status(500).json({ success: false, error: "Failed to fetch tokens" });
	}
}
