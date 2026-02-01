'server-only'

import { NetworkSchema, NetworkT } from "@/app/_schemas/wallet"
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { seiTestnet, sepolia } from 'viem/chains'

const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY ?? ""
const ALCHEMY_SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_ETH_SEPOLIA_RPC_URL ?? ""
const SEI_TESTNET_RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_SEI_TESTNET_RPC_URL ?? ""

// 1. Setup Account (Shared across chains)
const privateKey = AGENT_PRIVATE_KEY as `0x${string}`
if (!privateKey) throw new Error("AGENT_PRIVATE_KEY is missing from .env")
const account = privateKeyToAccount(privateKey)

// 2. SEPOLIA CLIENTS
export const sepoliaPublicClient = createPublicClient({
  chain: sepolia,
  transport: http(ALCHEMY_SEPOLIA_RPC_URL),
})

// Signer Client for Sepolia
export const sepoliaAgentClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(ALCHEMY_SEPOLIA_RPC_URL),
})

// 3. SEI TESTNET CLIENTS
export const seiPublicClient = createPublicClient({
  chain: seiTestnet,
  transport: http(SEI_TESTNET_RPC_URL),
})

// Signer Client for Sei Testnet
export const seiAgentClient = createWalletClient({
  account,
  chain: seiTestnet,
  transport: http(SEI_TESTNET_RPC_URL),
})

/**
 * HELPER: Get Signer Client by network
 */
export const getAgentClient = (network: NetworkT) => {
  if (network === NetworkSchema.enum.sepolia) return sepoliaAgentClient
  if (network === NetworkSchema.enum.sei_testnet) return seiAgentClient

  throw new Error("Unsupported Chain ID")
}