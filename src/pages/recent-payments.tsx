import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";

interface Payment {
	payerWallet: string;
	amount: number;
	status: string;
}

export default function RecentPayments() {
	const { connected, publicKey } = useWallet();
	const [payments, setPayments] = useState<Payment[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (connected && publicKey) {
			fetchRecentPayments(publicKey.toBase58());
		}
	}, [connected, publicKey]);

	const fetchRecentPayments = async (walletAddress: string) => {
		setLoading(true);
		try {
			const response = await axios.get(
				`http://localhost:3001/recent-payments/${walletAddress}`
			);

			if (response.data.success) {
				setPayments(response.data.payments);
			} else {
				alert("Error fetching payment details.");
			}
		} catch (error) {
			console.error("Error fetching payments:", error);
			alert("Something went wrong.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
			<div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl">
				<h1 className="text-2xl font-semibold text-center text-gray-800">
					Recent Payments
				</h1>

				{loading ? (
					<p className="text-center text-gray-600 mt-4">Loading payments...</p>
				) : (
					<div className="mt-4 overflow-auto">
						<table className="w-full border-collapse">
							<thead>
								<tr className="bg-gray-200">
									<th className="border p-3 text-left">Payer</th>
									<th className="border p-3 text-left">Amount</th>
									<th className="border p-3 text-left">Status</th>
								</tr>
							</thead>
							<tbody>
								{payments.length > 0 ? (
									payments.map((payment, index) => (
										<tr key={index} className="text-gray-700">
											<td className="border p-3 break-words">
												{payment.payerWallet}
											</td>
											<td className="border p-3">{payment.amount} USDC</td>
											<td className="border p-3">
												<span
													className={`px-2 py-1 rounded text-white ${
														payment.status === "Completed"
															? "bg-green-500"
															: "bg-yellow-500"
													}`}
												>
													{payment.status}
												</span>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td
											colSpan={3}
											className="border p-3 text-center text-gray-500"
										>
											No payments found.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
