'use client';

import { useState, useEffect, useCallback } from 'react';
import { getStake, calculatePendingYield } from '@/lib/stacks';
import type { StakeInfo } from '@/types';

interface StakeEntry {
  tokenId: number;
  info: StakeInfo;
  pendingYield: number | null;
}

export function useStakes(address: string | null, tokenIds: number[]) {
  const [stakes, setStakes] = useState<StakeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!address || tokenIds.length === 0) { setStakes([]); return; }
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const raw = await getStake(address, tokenId) as any;
          if (!raw?.value?.value) return null;
          const v = raw.value.value;
          const info: StakeInfo = {
            stakedAt: Number(v['staked-at']?.value ?? 0),
            collection: v.collection?.value ?? '',
            claimedUpToBlock: Number(v['claimed-up-to']?.value ?? 0),
          };
          const pendingYield = await calculatePendingYield(address, tokenId);
          return { tokenId, info, pendingYield };
        })
      );
      setStakes(results.filter((r): r is StakeEntry => r !== null));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [address, tokenIds.join(',')]);

  useEffect(() => { load(); }, [load]);

  return { stakes, loading, error, reload: load };
}
