"use server";

import { decodeEventLog, parseAbi } from "viem";

// text w/ ngrok
// https://4faee39b1d42.ngrok-free.app/api/webhooks/alchemy

// ABI for the specific event
const abi = parseAbi([
	"event BioVerify_SubmittedPublication(address publisher, uint256 id, string cid)",
]);

export async function POST(req: Request) {
	const body = await req.json();

	// TODO: Check Alchemy signature

	// Alchemy webhooks logs
	const log = body.event.data.block.logs[0];
	console.log("===> WEBHOOK log", log);

	if (!log) return new Response("Alchemy - No logs found", { status: 200 });

	// Process webhook payload
	try {
		// Decode log
		const decoded = decodeEventLog({
			abi,
			data: log.data,
			topics: log.topics,
		});

		// Extract event params
		const { publisher, id, cid } = decoded.args as {
			publisher: `0x${string}`;
			id: bigint;
			cid: string;
		};

		console.log("🚀 Decoded Publication:", {
			publisher,
			id: id.toString(),
			cid,
		});

		// Trigger LangGraph AI Agent
		// TODO:Trigger LangGraph AI Agent with the cid

		return new Response("Success", { status: 200 });
	} catch (error) {
		if (error instanceof Error) {
			return new Response(`Alchemy - Webhook error: ${error.message}`, {
				status: 400,
			});
		}

		return new Response(`Alchemy - Webhook error: ${error}`, {
			status: 400,
		});
	}
}
