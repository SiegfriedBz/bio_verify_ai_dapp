'server-only'

import { NetworkT } from "@/app/_schemas/wallet"
import { sendTelegramNotification } from "../notifications/telegram"
import { getAgentClient } from "./viem-client"

type BaseParams = {
  network: NetworkT
  publicationId: string
}

type slashPublisherParams = BaseParams & {
  reason: string
}
export const slashPublisher = async (params: slashPublisherParams) => {
  const { network, publicationId, reason } = params
  console.log(`[STUB - PROTOCOL] 🔨 Slashing Publisher for Publication #${publicationId}`)

  //TODO 1. Viem Logic for slashing
  const client = getAgentClient(network)

  // 2. Notify the community immediately
  await sendTelegramNotification(
    `🚨 *BioVerify Alert: Slash Executed*\n\n` +
    `Publication: #${publicationId}\n` +
    `Verdict: Plagiarism Detected\n` +
    `Evidence: ${reason.slice(0, 100)}...`
  )
}

export const pickReviewers = async (params: BaseParams) => {
  const { network, publicationId } = params
  console.log(`[STUB - PROTOCOL] 🎲 Triggering VRF for Publication #${publicationId}`)

  //TODO 1. Viem Logic for Chainlink VRF 
  const client = getAgentClient(network)

  await sendTelegramNotification(
    `✅ *BioVerify Alert: Review Phase Started*\n\n` +
    `Publication: #${publicationId} passed AI validation.\n` +
    `Status: Selecting 5 random reviewers via Chainlink VRF.`
  )
}