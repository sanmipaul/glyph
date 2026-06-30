'use client';

import { useState, useCallback } from 'react';
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

    const { openContractCall } = await import('@stacks/connect');

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
        poll(txId, opts.onSuccess, (reason) => {
          setStatus('error');
          setError(reason);
          opts.onError?.(reason);
        });
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

const TERMINAL_ERRORS = new Set([
  'abort_by_response', 'abort_by_post_condition',
  'dropped_replace_by_fee', 'dropped_stale_garbage_collect',
  'dropped_too_expensive', 'dropped_replace_across_fork',
]);

function poll(
  txid: string,
  onSuccess?: (txid: string) => void,
  onError?: (reason: string) => void,
) {
  const timer = setInterval(async () => {
    try {
      const r = await fetch(`${HIRO_API}/extended/v1/tx/0x${txid}`);
      const d = await r.json();
      if (d.tx_status === 'success') {
        clearInterval(timer);
        onSuccess?.(txid);
      } else if (TERMINAL_ERRORS.has(d.tx_status)) {
        clearInterval(timer);
        onError?.(d.tx_result?.repr ?? d.tx_status);
      }
    } catch {
      // network hiccup — keep polling
    }
  }, 10_000);
}
