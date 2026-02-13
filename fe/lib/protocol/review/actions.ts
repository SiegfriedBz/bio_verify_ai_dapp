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

// TODO update and reformulate natspecs
/**
 * Updates on-chain state to allow Publisher to pull stake.
 * Distributes rewards to honest reviewers. 
 * Slashes dissenters.
 */
// function publishPublication(uint256 _pubId, address[] calldata _honest, address[] calldata _negligent)
export const publishPublication = async (params: SettleParams) => {
  const { network,
    publicationId,
    rootCid,
    reason,
    honestAddresses: honest,
    negligentAddresses: negligent
  } = params

  console.log(`🔨 Agent publish Publication #${publicationId}`)
  console.log(`Honest (Reward): ${honest.join(', ')}`)
  console.log(`Negligent (Slash): ${negligent.join(', ')}`)

  // 1. Call BioVerify.publishPublication
  const contractConfig = getContractConfig(network)

  const { publicClient, agentClient } = getClient(network)

  const { request } = await publicClient.simulateContract({
    account: agentAccount,
    ...contractConfig,
    functionName: 'publishPublication',
    args: [BigInt(publicationId), honest, negligent]
  })

  await agentClient.writeContract(request)

  // 2. Notify the community immediately
  await sendTelegramNotification(
    `✅ *BioVerify Alert: Publication Passed Review Successfully*\n\n` +
    `Publishing Publication: #${publicationId}\n` +
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
// function slashPublication(uint256 _pubId, address[] calldata _honest, address[] calldata _negligent)
export const slashPublication = async (params: SettleParams) => {
  const { network,
    publicationId,
    rootCid,
    reason,
    honestAddresses: honest,
    negligentAddresses: negligent
  } = params

  console.log(`🔨 Agent slash Publication #${publicationId}`)
  console.log(`Honest (Reward): ${honest.join(', ')}`)
  console.log(`Negligent (Slash): ${negligent.join(', ')}`)


  // 1. Call BioVerify.slashPublication
  const contractConfig = getContractConfig(network)

  const { publicClient, agentClient } = getClient(network)

  const { request } = await publicClient.simulateContract({
    account: agentAccount,
    ...contractConfig,
    functionName: 'slashPublication',
    args: [BigInt(publicationId), honest, negligent]
  })

  await agentClient.writeContract(request)

  // 2. Notify the community immediately
  await sendTelegramNotification(
    `🚨  *BioVerify Alert: Publication Review Failed*\n\n` +
    `Slashing Publication: #${publicationId}\n` +
    `Honest (Reward): ${honest.join(', ')}\n` +
    `Negligent (Slash): ${negligent.join(', ')}\n` +
    `Evidence:\n\n` +
    `> ${reason.slice(0, 500)}...\n` +
    `IPFS Manifest Link::\n\n` +
    ` ${PINATA_IPFS_URL}/${rootCid}`
  )
}

