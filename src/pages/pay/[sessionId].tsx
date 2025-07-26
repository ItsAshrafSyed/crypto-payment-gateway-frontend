import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useState, useEffect } from "react"
import { PublicKey } from "@solana/web3.js"
import axios from "axios"

const USDC_MINT = process.env.USDC_MINT as string

interface Token {
	mint: string
	symbol: string
	balance: number
}

const PaymentPage = ({ sessionId }: { sessionId: string }) => {
	const { connection } = useConnection()
	const { publicKey, sendTransaction } = useWallet()
	const [tokens, setTokens] = useState<Token[]>([])
	const [selectedToken, setSelectedToken] = useState<string | null>(null)
	const [amountInUSDC, setAmountInUSDC] = useState<number | null>(null)

	useEffect(() => {
		if (!publicKey) return

		const fetchTokens = async () => {
			try {
				const response = await axios.get(`/api/get-tokens?wallet=${publicKey.toBase58()}`)
				setTokens(response.data.tokens)
			} catch (error) {
				console.error("Error fetching tokens:", error)
			}
		}

		fetchTokens()
	}, [publicKey])

	const handleTokenSelect = async (token: string) => {
		setSelectedToken(token)

		if (token !== USDC_MINT) {
			try {
				const response = await axios.get(`/api/get-swap-rate?token=${token}&usdc=1`)
				setAmountInUSDC(response.data.equivalentAmount)
			} catch (error) {
				console.error("Error fetching swap rate:", error)
			}
		} else {
			setAmountInUSDC(null)
		}
	}

	const handlePayment = async () => {
		if (!publicKey || !selectedToken) return

		try {
			if (selectedToken === USDC_MINT) {
				// Direct USDC payment
				const tx = await axios.post("/api/create-transaction", {
					payer: publicKey.toBase58(),
					amount: amountInUSDC,
					token: USDC_MINT,
				})

				const transaction = tx.data.transaction
				await sendTransaction(transaction, connection)
			} else {
				// Swap + Payment
				const swapResponse = await axios.post("/api/swap", {
					payer: publicKey.toBase58(),
					inputToken: selectedToken,
					outputToken: USDC_MINT,
					amount: amountInUSDC,
				})

				const swapTx = swapResponse.data.transaction
				await sendTransaction(swapTx, connection)

				// Send USDC to merchant
				const usdcTx = await axios.post("/api/create-transaction", {
					payer: publicKey.toBase58(),
					amount: amountInUSDC,
					token: USDC_MINT,
				})

				const usdcTransaction = usdcTx.data.transaction
				await sendTransaction(usdcTransaction, connection)
			}
		} catch (error) {
			console.error("Error processing payment:", error)
		}
	}

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold">Pay for Session {sessionId}</h1>
			<button onClick={() => handleTokenSelect(USDC_MINT)}>Pay with USDC</button>
			{tokens.map((token) => (
				<button key={token.mint} onClick={() => handleTokenSelect(token.mint)}>
					{token.symbol} ({token.balance})
				</button>
			))}
			<button onClick={handlePayment} disabled={!selectedToken}>
				Confirm Payment
			</button>
		</div>
	)
}

export default PaymentPage
