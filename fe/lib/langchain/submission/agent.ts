'server-only'

import { NetworkT } from "@/app/_schemas/wallet"
import { pickReviewers, slashScientist } from "@/lib/protocol/actions"
import { submissionGraph } from "./graph"

type Params = {
  network: NetworkT
  publicationId: string
  rootCid: string
}

export const startSubmissionAgent = async (
  params: Params,
) => {
  const { network, publicationId, rootCid } = params

  const config = { configurable: { thread_id: publicationId } }

  // 1. Run the Graph
  const finalState = await submissionGraph.invoke({ publicationId, rootCid }, config)

  // 2. Handle the Verdict
  if (finalState.verdict.decision === "fail") {
    // Call Smart Contract's 'slashScientist' function
    await slashScientist({ network, publicationId, reason: finalState.verdict.reason ?? "" })

  } else {
    // Call Smart Contract's 'pickReviewers' function
    await pickReviewers({ network, publicationId })
  }
}
