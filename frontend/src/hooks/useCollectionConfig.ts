'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCollectionConfig, getCollectionLtv } from '@/lib/stacks';
import type { CollectionYieldConfig } from '@/types';

interface CollectionInfo {
  name: string;
  yield: CollectionYieldConfig | null;
  ltv: number | null;
}

export function useCollectionConfig(collections: string[]) {
  const [configs, setConfigs] = useState<CollectionInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (collections.length === 0) { setConfigs([]); return; }
    setLoading(true);
    try {
      const results = await Promise.all(
        collections.map(async (name) => {
          const [rawYield, ltv] = await Promise.all([
            getCollectionConfig(name),
            getCollectionLtv(name),
          ]);
          const y = (rawYield as any)?.value?.value;
          const yieldConfig: CollectionYieldConfig | null = y
            ? {
                ratePerBlock: Number(y['rate-per-block']?.value ?? 0),
                totalStaked: Number(y['total-staked']?.value ?? 0),
                yieldAsset: Number(y['yield-asset']?.value ?? 0),
                active: Boolean(y.active?.value),
              }
            : null;
          return { name, yield: yieldConfig, ltv };
        })
      );
      setConfigs(results);
    } finally {
      setLoading(false);
    }
  }, [collections.join(',')]);

  useEffect(() => { load(); }, [load]);

  return { configs, loading, reload: load };
}
