// Shared TypeScript types for the Glyph frontend

export interface OrdinalData {
  inscriptionId: string;
  collection: string;
  contentType: string;
  btcAddress: string;
  verified: boolean;
  registeredAt: number;
}

export interface StakeInfo {
  stakedAt: number;
  collection: string;
  claimedUpToBlock: number;
}

export interface LoanPosition {
  loanAmount: number;
  loanAsset: number;
  ltvAtOpen: number;
  interestStartBlock: number;
  accruedInterest: number;
}

export interface Appraisal {
  value: number;
  appraiser: string;
  block: number;
}

export interface PendingWithdrawal {
  user: string;
  tokenId: number;
  inscriptionId: string;
  btcAddress: string;
  approvals: number;
  executed: boolean;
  cancelled: boolean;
  createdAt: number;
}

export interface CollectionYieldConfig {
  ratePerBlock: number;
  totalStaked: number;
  yieldAsset: number;
  active: boolean;
}
