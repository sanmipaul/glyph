# Glyph

**Bitcoin Ordinals DeFi Bridge on Stacks**

Glyph is a protocol that brings Bitcoin Ordinal inscriptions into the Stacks DeFi ecosystem. It lets holders of Ordinals wrap their inscriptions as SIP-009 NFTs on Stacks, then use them as collateral for loans or stake them to earn yield — all while retaining the ability to unwrap back to Bitcoin at any time.

---

## Table of Contents

1. [Overview](#overview)
2. [Why Ordinals on Stacks](#why-ordinals-on-stacks)
3. [Architecture](#architecture)
4. [Contracts](#contracts)
5. [Bridge Flow](#bridge-flow)
6. [Collateral Borrowing](#collateral-borrowing)
7. [Yield Staking](#yield-staking)
8. [Security Model](#security-model)
9. [Technical Specifications](#technical-specifications)
10. [Getting Started](#getting-started)
11. [Usage Examples](#usage-examples)
12. [Roadmap](#roadmap)
13. [License](#license)

---

## Overview

Bitcoin Ordinals have crossed $1B in trading volume but remain trapped as illiquid JPEG holders on Bitcoin Layer 1. Glyph solves the liquidity problem:

- **Register** your Ordinal inscription via off-chain proof
- **Wrap** it as a SIP-009 NFT on Stacks with Bitcoin finality
- **Borrow** STX or sBTC against it at collection-specific LTVs
- **Stake** it to earn protocol yield
- **Unwrap** any time through the multi-sig bridge vault

---

## Why Ordinals on Stacks

### The Liquidity Problem

Ordinals are locked on Bitcoin L1 — you can sell them, but you cannot use them as DeFi collateral or earn yield without centralized intermediaries. Stacks is the natural bridge layer because:

- Stacks reads Bitcoin state natively via Clarity
- Post-Nakamoto Stacks has Bitcoin-final settlement
- sBTC provides native BTC liquidity already on Stacks
- Stacks has existing DeFi infrastructure (DEXs, lending)

### Collection LTV Model

Not all Ordinals are equal. Glyph uses per-collection LTVs appraised on-chain:

| Collection Tier | Example | Max LTV |
|---|---|---|
| Blue chip | Bitcoin Puppets, NodeMonkes | 70% |
| Mid tier | Ordinal Maxi Biz | 50% |
| Long tail | Unverified | 0% (not whitelisted) |

---

## Architecture

```
Bitcoin L1                    Stacks L2
-----------                   ---------
Ordinal             bridge    Ordinal Registry
inscription  -----> proof --> (register + verify)
                                    |
                                    v
                             Wrapped Ordinal NFT
                             (SIP-009 glyph-ordinal)
                                    |
                        +-----------+-----------+
                        |                       |
                        v                       v
                 Ordinal Collateral       Yield Distributor
                 (borrow STX/sBTC)        (stake for yield)
                        |
                        v
                  Bridge Vault
                  (multi-sig withdrawal)
                        |
                        v
                  Bitcoin L1 (inscription released)
```
