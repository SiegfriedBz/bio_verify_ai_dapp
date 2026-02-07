## 🛠 Protocol Roadmap & Status

> **Note:** This project is developed in parallel with a full-time professional software engineering role.

### ✅ Phase 1: Autonomous Foundation & Publication Submission
**Timeline:** Jan 27 — Feb 6, 2026

```mermaid
sequenceDiagram
    autonumber
    participant S as Scientist (Next.js/Wagmi)
    participant IPFS as Pinata/IPFS
    participant BC as BioVerify Contract
    participant VRF as Chainlink VRF
    participant AN as Alchemy Notify
    participant API as Vercel API (Webhook)
    participant LG as LangGraph Agent
    participant TAV as Tavily Search

    Note over S, IPFS: Frontend: Pre-processing
    S->>IPFS: Recursive upload (authors, PDF + Assets)
    IPFS-->>S: Return Root CID (Manifest)

    Note over S, BC: Protocol Entry
    S->>BC: submitPublication(rootCID, stake + fee)
    BC->>BC: emit PublicationSubmitted
    BC-->>AN: [Blockchain Event]
    AN->>API: POST /api/webhooks/alchemy/submission
    
    Note right of API: HMAC Signature Verified
    
    API->>LG: startSubmissionAgent(pubId, rootCid)
    
    activate LG
    LG->>IPFS: Fetch Abstract from Root CID
    IPFS-->>LG: Abstract Data
    LG->>TAV: Plagiarism Search (Abstract)
    TAV-->>LG: Similarity Score & Context
    
    alt Similarity > Threshold (FAIL)
        LG->>BC: slashPublisher(pubId)
        BC->>BC: emit SlashedPublisher
    else Similarity < Threshold (PASS)
        LG->>BC: pickReviewers(pubId)
        BC->>VRF: requestRandomWords()
        activate VRF
        VRF-->>BC: fulfillRandomWords(requestId, randoms)
        deactivate VRF
        BC->>BC: emit Agent_PickedReviewers(pubId, reviewers)
    end
    deactivate LG

    Note over BC, LG: Telemetry logs pushed to Telegram
```

* **Protocol Engine (Solidity & Foundry)**
    * **[x] Incentive Alignment:** Implemented a game-theoretic staking model requiring collateral from both Scientists (Submission Stake) and Reviewers (Commitment Stake).
    * **[x] Sustainable Tokenomics:** Developed a **Decoupled Economic Model** separating returnable stakes from operational fees to cover Chainlink VRF costs.
    * **[x] Validation:** Achieved **100% Line Coverage** using the Foundry suite.
* **Agentic Forensic Layer (LangGraph.js)**
    * **[x] Stateful AI Reasoning:** Built a multi-stage graph orchestrating **IPFS/Pinata** for metadata ingestion and **Tavily Search** for literature overlap (publication abstract).
    * **[x] Autonomous Settlement:** Integrated a **Viem-based signer** allowing the AI agent to execute on-chain slashes or reviewer triggers based on forensic output.
* **Full-Stack Infrastructure & UX**
    * **[x] Scientist Submission Portal:** Developed a React-based frontend using **Wagmi** for seamless  IPFS metadata pinning and publication submission.
    * **[x] Event-Driven Architecture:** Established a secure **Alchemy Notify** pipeline with HMAC signature verification.
    * **[x] Real-time Monitoring:** Deployed a **Telegram Notification Engine** for live telemetry of protocol activity and AI reasoning logs.
 

---

### 🏗 Phase 2: Decentralized Reviewer Orchestration
**Timeline:** Feb 7, 2026 — Present

* **Reviewer Lifecycle & Persistence**
    * **[ ] Sync Engine:** Configure Alchemy Notify for `BioVerify_Agent_PickedReviewers` events to trigger off-chain coordination.
    * **[ ] Reviewer Memory (Supabase):** Implement a persistence layer to map VRF-selected addresses to assigned publications for dashboard querying.
* **Human-In-The-Loop (HITL) Review Pipeline**
    * **[ ] IPFS Review Schema:** Define standardized JSON schema for reviews (verdict, reason, and reviewer address).
    * **[ ] Reviewer Orchestrator:** Develop a LangGraph-based agent to manage the review collection.
* **On-Chain Finality**
    * **[ ] Review Submission Logic:** Implement `reviewPublication(uint256 pubId, bool validation, string reviewCID)` in the core contract.
    * **[ ] Consensus Engine:** Develop logic to aggregate reviewer verdicts to finalize publication status and distribute rewards.
