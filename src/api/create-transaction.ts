import { NextApiRequest, NextApiResponse } from "next";
import {
	Connection,
	PublicKey,
	Transaction,
	SystemProgram,
} from "@solana/web3.js";

const SOLANA_RPC = process.env.SOLANA_RPC as string;
const MERCHANT_WALLET = new PublicKey(process.env.MERCHANT_WALLET as string);
const USDC_MINT = process.env.USDC_MINT as string;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const { wallet, amount, tokenMint } = req.body;
		if (!wallet || !amount || !tokenMint)
			return res.status(400).json({ error: "Missing parameters" });

		const connection = new Connection(SOLANA_RPC, "confirmed");
		const walletPubkey = new PublicKey(wallet);
		const transaction = new Transaction();

		if (tokenMint === USDC_MINT) {
			// Direct USDC transfer
			const transferInstruction = SystemProgram.transfer({
				fromPubkey: walletPubkey,
				toPubkey: MERCHANT_WALLET,
				lamports: amount,
			});

			transaction.add(transferInstruction);
		} else {
			// Handle swapping logic separately
			return res.status(400).json({ error: "Swap needed before sending" });
		}

		res.json({ success: true, transaction });
	} catch (error) {
		console.error("Error creating transaction:", error);
		res
			.status(500)
			.json({ success: false, error: "Failed to create transaction" });
	}
}
