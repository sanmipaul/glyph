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

---

## Contracts

### `ordinal-registry.clar`
The entry point for all Ordinals. Records inscription metadata off-chain, then authorized verifiers confirm ownership and trigger minting of the wrapped NFT. Tracks collection-level stats.

### `wrapped-ordinal-nft.clar`
Full SIP-009 compliant NFT representing a verified Ordinal inscription. Supports per-token approvals and operator approvals (for DeFi protocol integrations). Mint is restricted to the registry; burn is restricted to the bridge vault.

### `bridge-vault.clar`
Multi-sig controlled vault managing the Bitcoin-to-Stacks bridge exit flow. Requires `required-signatures` out of registered signers to approve a withdrawal before the wrapped NFT is burned and the off-chain bridge releases the inscription.

### `ordinal-collateral.clar`
Lending protocol for NFT-collateralized loans. Authorized appraisers set on-chain valuations; collection LTVs cap the loan amount. 5% annual interest accrues per block. Positions above 90% LTV become liquidatable.

### `yield-distributor.clar`
Staking protocol for wrapped Ordinals. Each collection has a configurable STX or sBTC yield rate per block. Stakers earn yield continuously; claiming or unstaking auto-settles pending yield.

---

## Bridge Flow

```
1. User registers Ordinal on-chain:
   ordinal-registry::register-ordinal(inscription-id, collection, content-type, sat-number)
   -> token-id assigned, status = unverified

2. Off-chain verifier confirms Bitcoin ownership:
   ordinal-registry::verify-ordinal(inscription-id)
   -> wrapped-ordinal-nft::mint(owner, token-id, uri) called internally
   -> SIP-009 glyph-ordinal NFT now in user's Stacks wallet

3. User uses NFT in DeFi (collateral or yield staking)

4. To unwrap back to Bitcoin:
   bridge-vault::initiate-withdrawal(token-id, btc-address)
   -> NFT transferred to vault for safekeeping

5. Signers approve:
   bridge-vault::approve-withdrawal(withdrawal-id) x 3

6. Anyone executes:
   bridge-vault::execute-withdrawal(withdrawal-id)
   -> wrapped-ordinal-nft::burn(token-id) called
   -> Off-chain bridge detects burn event, releases inscription on Bitcoin
```

---

## Collateral Borrowing

### Loan Flow

```
1. Appraiser sets value:  ordinal-collateral::appraise-token(token-id, value_in_ustx)
2. Borrower opens loan:   ordinal-collateral::borrow(token-id, loan-amount, loan-asset)
   - NFT locked in contract as collateral
   - STX or sBTC sent to borrower
3. Interest accrues:      5% APR, calculated per block
4. Repay:                 ordinal-collateral::repay(token-id)
   - Repays principal + accrued interest
   - NFT returned to borrower
```

### Liquidation

When `(loan_amount + accrued_interest) / appraisal_value >= 90%`:
- Anyone can call `liquidate-position(user, token-id)`
- Liquidator pays the debt amount
- Receives the NFT at a 10% discount to appraised value

---

## Yield Staking

```
1. Admin configures collection: set-collection-config(collection, rate_per_block, yield_asset)
2. Holder stakes:               yield-distributor::stake(token-id)
   - NFT transferred to yield-distributor contract
3. Yield accrues per block:     pending = blocks_elapsed x rate_per_block
4. Claim without unstaking:     yield-distributor::claim-yield(token-id)
5. Unstake + claim:             yield-distributor::unstake(token-id)
   - Returns NFT + distributes any pending yield
```

---

## Security Model

### Bridge Multi-Sig

The bridge vault requires M-of-N signer approval before any withdrawal executes. This prevents a single compromised key from draining inscriptions. Default: 3-of-N signers required.

Withdrawals expire after `WITHDRAWAL-EXPIRY` blocks (~10 days). Expired withdrawals can be cancelled and the NFT returned to the user.

### Oracle Appraisals

Loan values depend on authorized appraiser inputs. The protocol mitigates oracle risk by:
- Requiring appraiser whitelist (only admin-approved addresses)
- LTV caps per collection (enforced on-chain)
- Liquidation at 90% LTV (buffer before insolvency)

---

## Technical Specifications

| Parameter | Value |
|---|---|
| NFT standard | SIP-009 (`glyph-ordinal`) |
| Bridge withdrawal expiry | 1440 blocks (~10 days) |
| Interest rate | 5% APR (500 bps) |
| Blocks per year | 52560 |
| Liquidation threshold | 90% LTV (9000 bps) |
| Liquidation discount | 10% (1000 bps) |
| Loan assets | STX (u1), sBTC (u2) |
| Default required sigs | 3 |
| Max approvers per withdrawal | 10 |
