'use client';

import { useState, useCallback } from 'react';
import { getOrdinal, getInscriptionId } from '@/lib/stacks';
import type { OrdinalData } from '@/types';

export function useRegistry() {
  const [result, setResult] = useState<OrdinalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const search = useCallback(async (inscriptionId: string) => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    setResult(null);
    try {
      const raw = await getOrdinal(inscriptionId.trim()) as any;
      const v = raw?.value?.value;
      if (!v) { setNotFound(true); return; }
      setResult({
        inscriptionId: inscriptionId.trim(),
        collection: v.collection?.value ?? '',
        contentType: v['content-type']?.value ?? '',
        btcAddress: v['btc-address']?.value ?? '',
        verified: Boolean(v.verified?.value),
        registeredAt: Number(v['registered-at']?.value ?? 0),
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchByTokenId = useCallback(async (tokenId: number) => {
    const id = await getInscriptionId(tokenId);
    if (!id) { setNotFound(true); return; }
    await search(id);
  }, [search]);

  return { result, loading, error, notFound, search, searchByTokenId };
}
