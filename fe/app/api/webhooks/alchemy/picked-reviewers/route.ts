import { NetworkSchema } from "@/app/_schemas/wallet"
import { startReviewersAgent } from "@/lib/langchain/review/start-agent"
import { waitUntil } from "@vercel/functions"
import { createHmac } from "node:crypto"
import { decodeEventLog, parseAbi } from "viem"

const abi = parseAbi([
	"event BioVerify_Agent_PickedReviewers(uint256 indexed publicationId, string rootCid, address[] reviewers, address seniorReviewer, uint256 minValidReviewsCount)",
])

const SEPOLIA_SK = process.env.ALCHEMY_ETH_SEPOLIA_Agent_PickedReviewers_WEBHOOK_SK
const SEI_SK = process.env.ALCHEMY_SEI_TESTNET_Agent_PickedReviewers_WEBHOOK_SK

export async function POST(req: Request) {
	if (!SEPOLIA_SK && !SEI_SK) {
		console.error("❌ Critical: Webhook secrets are missing.")
		return new Response("Configuration Error", { status: 500 })
	}

	try {
		const signature = req.headers.get("x-alchemy-signature")
		const rawBody = await req.text()

		if (!signature) return new Response("Missing signature", { status: 401 })

		// 1. Signature Verification
		const isSepolia = SEPOLIA_SK &&
			createHmac("sha256", SEPOLIA_SK).update(rawBody).digest("hex") === signature

		const isSei = SEI_SK &&
			createHmac("sha256", SEI_SK).update(rawBody).digest("hex") === signature

		if (!isSepolia && !isSei) {
			console.error("❌ Unauthorized: Signature Mismatch")
			return new Response("Unauthorized", { status: 401 })
		}

		// 2. Parse Alchemy Payload
		const body = JSON.parse(rawBody)
		const log = body.event?.data?.block?.logs?.[0]

		if (!log) {
			console.warn("⚠️ Webhook received but no log found in payload.")
			return new Response("No logs found", { status: 200 })
		}

		// 3. Decode On-Chain Event
		const decoded = decodeEventLog({
			abi,
			data: log.data,
			topics: log.topics,
		})

		const { publicationId, rootCid, reviewers, seniorReviewer, minValidReviewsCount } = decoded.args as {
			publicationId: bigint
			rootCid: string
			reviewers: string[]
			seniorReviewer: string
			minValidReviewsCount: bigint
		}

		const pubIdStr = publicationId.toString()
		const network = isSepolia ? NetworkSchema.enum.sepolia : NetworkSchema.enum.sei_testnet

		console.log(`🚀 [${network.toUpperCase()}] Reviewers Picked for Pub #${pubIdStr}`, {
			reviewers,
			seniorReviewer,
			rootCid
		})

		// 4. Trigger the Agent (Non-blocking)
		// waitUntil ensures the Vercel function stays alive to start the Reviewers Graph
		waitUntil(
			startReviewersAgent({
				network,
				publicationId: pubIdStr,
				rootCid,
				reviewers,
				seniorReviewer,
				minValidReviewsCount: Number(minValidReviewsCount)
			}).then(() => {
				console.log(`✅ Reviewers Agent Settlement Complete for Pub #${pubIdStr}`)
			}).catch(err => {
				console.error(`❌ Reviewers Agent failure for Pub #${pubIdStr}:`, err)
			})
		)

		// 5. Respond 202 immediately to Alchemy to avoid timeouts
		return new Response("Accepted", { status: 202 })

	} catch (err) {
		console.error("💥 Reviewers Webhook Internal Error:", err)
		return new Response("Internal Error", { status: 500 })
	}
}