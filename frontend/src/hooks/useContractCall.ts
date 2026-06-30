'use client';

import { useState, useCallback } from 'react';
import { ClarityValue, cvToHex } from '@stacks/transactions';
import { DEPLOYER, HIRO_API } from '@/lib/constants';
import { getRequest } from '@/lib/stacks-connect';

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

    const request = await getRequest();

    try {
      const result = await request('stx_callContract', {
        contract: `${DEPLOYER}.${opts.contractName}`,
        functionName: opts.functionName,
        // cvToHex produces 0x-prefixed hex — the format Xverse's transaction
        // builder expects when it deserializes args for fee estimation.
        functionArgs: opts.functionArgs.map(cvToHex),
        network: 'mainnet',
        postConditionMode: 'allow',
        postConditions: [],
      });

      const txId: string = (result as any).txid ?? (result as any).txId;
      if (txId) {
        setTxid(txId);
        setStatus('pending');
        poll(txId, opts.onSuccess, (reason) => {
          setStatus('error');
          setError(reason);
          opts.onError?.(reason);
        });
      }
    } catch (e: any) {
      // -31001 = user cancelled; treat as idle so UI resets cleanly
      if (e?.code === -31001 || /cancel/i.test(e?.message ?? '')) {
        setStatus('idle');
      } else {
        const msg: string = e?.message ?? 'Transaction failed';
        setStatus('error');
        setError(msg);
        opts.onError?.(msg);
      }
    }
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
      const r = await fetch(`${HIRO_API}/extended/v1/tx/${txid}`);
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
