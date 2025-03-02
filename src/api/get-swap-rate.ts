import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const JUPITER_API = "https://quote-api.jup.ag/v6/quote";
const USDC_MINT = process.env.USDC_MINT as string;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const { inputMint, amount } = req.query;
		if (!inputMint || !amount)
			return res.status(400).json({ error: "Missing parameters" });

		const response = await axios.get(JUPITER_API, {
			params: {
				inputMint,
				outputMint: USDC_MINT,
				amount,
				slippageBps: 50,
			},
		});

		res.json({ success: true, swapRate: response.data });
	} catch (error) {
		console.error("Error fetching swap rate:", error);
		res
			.status(500)
			.json({ success: false, error: "Failed to fetch swap rate" });
	}
}
