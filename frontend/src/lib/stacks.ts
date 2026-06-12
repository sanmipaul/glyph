import {
  fetchCallReadOnlyFunction,
  cvToJSON,
  uintCV,
  standardPrincipalCV,
  stringAsciiCV,
  ClarityValue,
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import { DEPLOYER, HIRO_API } from './constants';

const network = { ...STACKS_MAINNET, client: { baseUrl: HIRO_API } };

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
