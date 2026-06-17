'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPendingWithdrawal, getRequiredSignatures } from '@/lib/stacks';
import type { PendingWithdrawal } from '@/types';
import { HIRO_API, DEPLOYER, CONTRACT_NAMES } from '@/lib/constants';

interface WithdrawalEntry {
  id: number;
  withdrawal: PendingWithdrawal;
}

export function useWithdrawals(address: string | null) {
  const [withdrawals, setWithdrawals] = useState<WithdrawalEntry[]>([]);
  const [requiredSigs, setRequiredSigs] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!address) { setWithdrawals([]); return; }
    setLoading(true);
    setError(null);
    try {
      const [reqSigs, txsRes] = await Promise.all([
        getRequiredSignatures(),
        fetch(`${HIRO_API}/extended/v1/address/${DEPLOYER}.${CONTRACT_NAMES.bridgeVault}/transactions?limit=50`),
      ]);
      setRequiredSigs(reqSigs);

      // Collect unique withdrawal IDs from contract calls by the user
      const txsData = await txsRes.json();
      const ids = new Set<number>();
      for (const tx of txsData.results ?? []) {
        if (tx.tx_type === 'contract_call' && tx.sender_address === address) {
          const idArg = tx.contract_call?.function_args?.[0]?.repr;
          if (idArg) ids.add(Number(idArg.replace('u', '')));
        }
      }

      const entries = await Promise.all(
        Array.from(ids).map(async (id) => {
          const raw = await getPendingWithdrawal(id) as any;
          if (!raw?.value?.value) return null;
          const v = raw.value.value;
          const withdrawal: PendingWithdrawal = {
            user: v.user?.value ?? '',
            tokenId: Number(v['token-id']?.value ?? 0),
            inscriptionId: v['inscription-id']?.value ?? '',
            btcAddress: v['btc-address']?.value ?? '',
            approvals: Number(v.approvals?.value ?? 0),
            executed: Boolean(v.executed?.value),
            cancelled: Boolean(v.cancelled?.value),
            createdAt: Number(v['created-at']?.value ?? 0),
          };
          if (withdrawal.user !== address) return null;
          return { id, withdrawal };
        })
      );
      setWithdrawals(entries.filter((e): e is WithdrawalEntry => e !== null));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => { load(); }, [load]);

  return { withdrawals, requiredSigs, loading, error, reload: load };
}
