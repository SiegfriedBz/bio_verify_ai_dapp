'server-only'

import { NetworkT } from "@/app/_schemas/wallet"
import { sendTelegramNotification } from "../notifications/telegram"
import { agentAccount, getClient, getContractConfig } from "./viem-client"

type BaseParams = {
  network: NetworkT
  publicationId: string
}

type slashPublisherParams = BaseParams & {
  reason: string
}
export const slashPublisher = async (params: slashPublisherParams) => {
  const { network, publicationId, reason } = params
  console.log(`🔨 Agent Slashing Publisher for Publication #${publicationId}`)

  // 1. Call BioVerify.slashPublisher
  const contractConfig = getContractConfig(network)

  const { publicClient, agentClient } = getClient(network)

  const { request } = await publicClient.simulateContract({
    account: agentAccount,
    ...contractConfig,
    functionName: 'slashPublisher',
    args: [BigInt(publicationId)]
  })

  console.log("===> slashPublisher request", request)

  await agentClient.writeContract(request)

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
  console.log(`🎲 Agent Triggering VRF for Publication #${publicationId}`)

  // 1. Call BioVerify.pickReviewers (call VRF)
  const contractConfig = getContractConfig(network)

  const { publicClient, agentClient } = getClient(network)

  const { request } = await publicClient.simulateContract({
    account: agentAccount,
    ...contractConfig,
    functionName: 'pickReviewers',
    args: [BigInt(publicationId)]
  })

  console.log("===> pickReviewers request", request)

  await agentClient.writeContract(request)

  await sendTelegramNotification(
    `✅ *BioVerify Alert: Review Phase Started*\n\n` +
    `Publication: #${publicationId} passed AI validation.\n` +
    `Status: Selecting 3 random reviewers via Chainlink VRF.`
  )
}