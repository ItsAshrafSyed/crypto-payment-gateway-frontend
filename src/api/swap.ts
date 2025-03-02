import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const JUPITER_SWAP_API = "https://quote-api.jup.ag/v6/swap";
const USDC_MINT = process.env.USDC_MINT as string;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const { wallet, inputMint, amount } = req.body;
		if (!wallet || !inputMint || !amount)
			return res.status(400).json({ error: "Missing parameters" });

		const response = await axios.post(JUPITER_SWAP_API, {
			userPublicKey: wallet,
			inputMint,
			outputMint: USDC_MINT,
			amount,
			slippageBps: 50,
		});

		res.json({ success: true, swapTransaction: response.data });
	} catch (error) {
		console.error("Error processing swap:", error);
		res.status(500).json({ success: false, error: "Failed to process swap" });
	}
}
