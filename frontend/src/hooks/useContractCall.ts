'use client';

import { useState, useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import { STACKS_MAINNET } from '@stacks/network';
import { PostConditionMode, ClarityValue } from '@stacks/transactions';
import { DEPLOYER, HIRO_API } from '@/lib/constants';

export type TxStatus = 'idle' | 'signing' | 'pending' | 'success' | 'error';

interface CallOptions {
  contractName: string;
  functionName: string;
  functionArgs: ClarityValue[];
  onSuccess?: (txid: string) => void;
  onError?: (reason: string) => void;
}

export function useContractCall() {
  const [status, setStatus] = useState<TxStatus>('idle');
  const [txid, setTxid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(async (opts: CallOptions) => {
    setStatus('signing');
    setTxid(null);
    setError(null);

    await openContractCall({
      contractAddress: DEPLOYER,
      contractName: opts.contractName,
      functionName: opts.functionName,
      functionArgs: opts.functionArgs,
      network: { ...STACKS_MAINNET, client: { baseUrl: HIRO_API } },
      postConditionMode: PostConditionMode.Allow,
      postConditions: [],
      onFinish: ({ txId }) => {
        setTxid(txId);
        setStatus('pending');
      },
      onCancel: () => {
        setStatus('idle');
      },
    });
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setTxid(null);
    setError(null);
  }, []);

  return { call, status, txid, error, reset };
}
