import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import axios from "axios";

const WalletMultiButton = dynamic(
	async () =>
		(await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
	{ ssr: false }
);

export default function Home() {
	const { connected, publicKey } = useWallet();
	const [merchantAmount, setMerchantAmount] = useState("");
	const [payerWallet, setPayerWallet] = useState("");
	const [merchantWallet, setMerchantWallet] = useState("");
	const [paymentLink, setPaymentLink] = useState("");

	useEffect(() => {
		if (connected && publicKey) {
			setMerchantWallet(publicKey.toBase58());
		}
	}, [connected, publicKey]);

	const generatePaymentLink = async () => {
		try {
			const response = await axios.post(
				"http://localhost:3001/create-payment",
				{
					amount: parseFloat(merchantAmount),
					payerWallet,
				}
			);

			if (response.data.success) {
				setPaymentLink(response.data.paymentLink);
			} else {
				alert("Failed to generate payment link");
			}
		} catch (error) {
			console.error("Error generating payment link:", error);
			alert("Something went wrong.");
		}
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
			<div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
				<h1 className="text-2xl font-semibold text-center text-gray-800">
					Crypto Payment Gateway
				</h1>
				<p className="text-gray-600 text-center mt-2">
					Welcome, Merchant! <br /> Connect your wallet & generate payment
					links.
				</p>

				<div className="flex flex-col items-center mt-4">
					<WalletMultiButton />
				</div>

				{connected && (
					<div className="mt-6">
						<label className="block text-sm font-medium text-gray-700">
							Merchant Wallet
						</label>
						<input
							type="text"
							value={merchantWallet}
							readOnly
							className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100"
						/>

						<label className="block text-sm font-medium text-gray-700 mt-4">
							Payer Wallet Address
						</label>
						<input
							type="text"
							value={payerWallet}
							onChange={(e) => setPayerWallet(e.target.value)}
							className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
							placeholder="Enter Payer's Wallet Address"
						/>

						<label className="block text-sm font-medium text-gray-700 mt-4">
							USDC Amount
						</label>
						<input
							type="number"
							value={merchantAmount}
							onChange={(e) => setMerchantAmount(e.target.value)}
							className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
							placeholder="Enter amount in USDC"
						/>

						<button
							onClick={generatePaymentLink}
							className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
						>
							Generate Payment Link
						</button>
					</div>
				)}

				{paymentLink && (
					<div className="mt-4 p-4 bg-green-100 border border-green-400 rounded-md">
						<p className="text-green-700 font-medium">Payment Link:</p>
						<a href={paymentLink} target="_blank" rel="noopener noreferrer">
							{paymentLink}
						</a>
					</div>
				)}
			</div>
		</div>
	);
}
