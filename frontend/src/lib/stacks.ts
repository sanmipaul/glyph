import {
  fetchCallReadOnlyFunction,
  cvToJSON,
  uintCV,
  standardPrincipalCV,
  stringAsciiCV,
  ClarityValue,
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import { DEPLOYER, CONTRACT_NAMES, HIRO_API } from './constants';

const network = { ...STACKS_MAINNET, client: { baseUrl: HIRO_API } };

// ── wrapped-ordinal-nft ─────────────────────────────────────────────────────

export async function getLastTokenId(): Promise<number> {
  const r = await ro(CONTRACT_NAMES.wrappedOrdinalNft, 'get-last-token-id', []) as any;
  return Number(r.value.value);
}

export async function getOwner(tokenId: number): Promise<string | null> {
  const r = await ro(CONTRACT_NAMES.wrappedOrdinalNft, 'get-owner', [uintCV(tokenId)]) as any;
  return r.value.value?.value ?? null;
}

export async function getTokenUri(tokenId: number): Promise<string | null> {
  const r = await ro(CONTRACT_NAMES.wrappedOrdinalNft, 'get-token-uri', [uintCV(tokenId)]) as any;
  return r.value.value?.value ?? null;
}

export async function getApproved(tokenId: number): Promise<string | null> {
  const r = await ro(CONTRACT_NAMES.wrappedOrdinalNft, 'get-approved', [uintCV(tokenId)]) as any;
  return r.value?.value ?? null;
}

export async function isApprovedForAll(owner: string, operator: string): Promise<boolean> {
  const r = await ro(CONTRACT_NAMES.wrappedOrdinalNft, 'is-approved-for-all',
    [standardPrincipalCV(owner), standardPrincipalCV(operator)]) as any;
  return Boolean(r.value);
}

// ── ordinal-registry ────────────────────────────────────────────────────────

export async function getOrdinal(inscriptionId: string): Promise<unknown> {
  return ro(CONTRACT_NAMES.ordinalRegistry, 'get-ordinal', [stringAsciiCV(inscriptionId)]);
}

export async function getInscriptionId(tokenId: number): Promise<string | null> {
  const r = await ro(CONTRACT_NAMES.ordinalRegistry, 'get-inscription-id', [uintCV(tokenId)]) as any;
  return r.value?.value ?? null;
}

export async function isVerifier(addr: string): Promise<boolean> {
  const r = await ro(CONTRACT_NAMES.ordinalRegistry, 'is-verifier',
    [standardPrincipalCV(addr)]) as any;
  return Boolean(r.value);
}

// Enumerate all tokens owned by a given address up to lastTokenId
export async function getTokensOwnedBy(address: string): Promise<number[]> {
  const lastId = await getLastTokenId();
  const checks = Array.from({ length: lastId }, (_, i) => i + 1).map(async (id) => {
    const owner = await getOwner(id);
    return owner === address ? id : null;
  });
  const results = await Promise.all(checks);
  return results.filter((id): id is number => id !== null);
}

// Base read-only call helper — returns the JSON-deserialized CV result
export async function ro(
  contractName: string,
  functionName: string,
  args: ClarityValue[],
): Promise<unknown> {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: DEPLOYER,
    contractName,
    functionName,
    functionArgs: args,
    senderAddress: DEPLOYER,
    network,
  });
  return cvToJSON(result);
}
