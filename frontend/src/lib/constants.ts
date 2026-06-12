export const DEPLOYER = process.env.NEXT_PUBLIC_DEPLOYER!;
export const HIRO_API = process.env.NEXT_PUBLIC_HIRO_API!;

export const CONTRACTS = {
  wrappedOrdinalNft:   `${DEPLOYER}.wrapped-ordinal-nft`,
  ordinalRegistry:     `${DEPLOYER}.ordinal-registry`,
  bridgeVault:         `${DEPLOYER}.bridge-vault`,
  ordinalCollateral:   `${DEPLOYER}.ordinal-collateral`,
  yieldDistributor:    `${DEPLOYER}.yield-distributor`,
} as const;

export const CONTRACT_NAMES = {
  wrappedOrdinalNft:   'wrapped-ordinal-nft',
  ordinalRegistry:     'ordinal-registry',
  bridgeVault:         'bridge-vault',
  ordinalCollateral:   'ordinal-collateral',
  yieldDistributor:    'yield-distributor',
} as const;
