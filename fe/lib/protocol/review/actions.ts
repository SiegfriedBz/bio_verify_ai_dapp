'server-only'

import { NetworkT } from "@/app/_schemas/wallet"
import { sendTelegramNotification } from "../../notifications/telegram"
import { getContractConfig } from "../../utils/get-contract-config"
import { agentAccount, getClient } from "../viem-client"

const PINATA_IPFS_URL = process.env.NEXT_PUBLIC_PINATA_IPFS_URL ?? ""

type SettleParams = {
  network: NetworkT
  publicationId: string
  rootCid: string
  reason: string
  honestAddresses: string[]
  negligentAddresses: string[]
}

/**
 * Updates on-chain state to allow Publisher to pull stake.
 * Distributes rewards to honest reviewers. 
 * Slashes dissenters.
 */
export const settleReviewPass = async (params: SettleParams) => {
  const { network,
    publicationId,
    rootCid,
    reason,
    honestAddresses: honest,
    negligentAddresses: negligent
  } = params

  console.log(`🔨 Agent settleReviewPass for Publication #${publicationId}`)
  console.log(`Honest (Reward): ${honest.join(', ')}`)
  console.log(`Negligent (Slash): ${negligent.join(', ')}`)

  // 1. Call BioVerify.settleReviewPass
  const contractConfig = getContractConfig(network)

  const { publicClient, agentClient } = getClient(network)

  const { request } = await publicClient.simulateContract({
    account: agentAccount,
    ...contractConfig,
    functionName: 'settleReviewPass',
    args: [BigInt(publicationId), honest, negligent]
  })

  await agentClient.writeContract(request)

  // 2. Notify the community immediately
  await sendTelegramNotification(
    `✅ *BioVerify Alert: Publication Passed Review Successfully*\n\n` +
    `Publication: #${publicationId}\n` +
    `Honest (Reward): ${honest.join(', ')}\n` +
    `Negligent (Slash): ${negligent.join(', ')}\n` +
    `Evidence:\n\n` +
    `> ${reason.slice(0, 500)}...\n` +
    `IPFS Manifest Link::\n\n` +
    ` ${PINATA_IPFS_URL}/${rootCid}`
  )
}

/**
 * Slashes Publisher stake.
 * Distributes rewards to honest reviewers who caught the fraud. 
 * Slashes negligent reviewers who voted "Pass".
 */
export const settleReviewFail = async (params: SettleParams) => {
  const { network,
    publicationId,
    rootCid,
    reason,
    honestAddresses: honest,
    negligentAddresses: negligent
  } = params

  console.log(`🔨 Agent settleReviewFail for Publication #${publicationId}`)
  console.log(`Honest (Reward): ${honest.join(', ')}`)
  console.log(`Negligent (Slash): ${negligent.join(', ')}`)


  // 1. Call BioVerify.settleReviewFail
  const contractConfig = getContractConfig(network)

  const { publicClient, agentClient } = getClient(network)

  const { request } = await publicClient.simulateContract({
    account: agentAccount,
    ...contractConfig,
    functionName: 'settleReviewFail',
    args: [BigInt(publicationId), honest, negligent]
  })

  await agentClient.writeContract(request)

  // 2. Notify the community immediately
  await sendTelegramNotification(
    `🚨  *BioVerify Alert: Publication Review Failed*\n\n` +
    `Publication: #${publicationId}\n` +
    `Honest (Reward): ${honest.join(', ')}\n` +
    `Negligent (Slash): ${negligent.join(', ')}\n` +
    `Evidence:\n\n` +
    `> ${reason.slice(0, 500)}...\n` +
    `IPFS Manifest Link::\n\n` +
    ` ${PINATA_IPFS_URL}/${rootCid}`
  )
}

