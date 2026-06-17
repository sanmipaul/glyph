'use client';

import { useState, useEffect, useCallback } from 'react';
import { getNftHoldings, getInscriptionId } from '@/lib/stacks';
import type { OrdinalData } from '@/types';
import { ro } from '@/lib/stacks';
import { CONTRACT_NAMES } from '@/lib/constants';
import { stringAsciiCV } from '@stacks/transactions';

interface OrdinalEntry {
  tokenId: number;
  inscriptionId: string;
  data: OrdinalData | null;
}

export function useOrdinals(address: string | null) {
  const [ordinals, setOrdinals] = useState<OrdinalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!address) { setOrdinals([]); return; }
    setLoading(true);
    setError(null);
    try {
      const holdings = await getNftHoldings(address);
      const entries = await Promise.all(
        holdings.map(async (h) => {
          const tokenId = Number(h.value.repr.replace('u', ''));
          const inscriptionId = await getInscriptionId(tokenId);
          let data: OrdinalData | null = null;
          if (inscriptionId) {
            const raw = await ro(CONTRACT_NAMES.ordinalRegistry, 'get-ordinal',
              [stringAsciiCV(inscriptionId)]) as any;
            if (raw?.value?.value) {
              const v = raw.value.value;
              data = {
                inscriptionId,
                collection: v.collection?.value ?? '',
                contentType: v['content-type']?.value ?? '',
                btcAddress: v['btc-address']?.value ?? '',
                verified: Boolean(v.verified?.value),
                registeredAt: Number(v['registered-at']?.value ?? 0),
              };
            }
          }
          return { tokenId, inscriptionId: inscriptionId ?? '', data };
        })
      );
      setOrdinals(entries);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => { load(); }, [load]);

  return { ordinals, loading, error, reload: load };
}
