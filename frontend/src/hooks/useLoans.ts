'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPosition, getAppraisal, calculateInterest, isLiquidatable } from '@/lib/stacks';
import type { LoanPosition, Appraisal } from '@/types';

interface LoanEntry {
  tokenId: number;
  position: LoanPosition;
  appraisal: Appraisal | null;
  interest: number | null;
  liquidatable: boolean;
}

export function useLoans(address: string | null, tokenIds: number[]) {
  const [loans, setLoans] = useState<LoanEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!address || tokenIds.length === 0) { setLoans([]); return; }
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const raw = await getPosition(address, tokenId) as any;
          if (!raw?.value?.value) return null;
          const v = raw.value.value;
          const position: LoanPosition = {
            loanAmount: Number(v['loan-amount']?.value ?? 0),
            loanAsset: Number(v['loan-asset']?.value ?? 0),
            ltvAtOpen: Number(v['ltv-at-open']?.value ?? 0),
            interestStartBlock: Number(v['interest-start-block']?.value ?? 0),
            accruedInterest: Number(v['accrued-interest']?.value ?? 0),
          };
          if (position.loanAmount === 0) return null;

          const [aprRaw, interest, liquidatable] = await Promise.all([
            getAppraisal(tokenId),
            calculateInterest(address, tokenId),
            isLiquidatable(address, tokenId),
          ]);
          const av = (aprRaw as any)?.value?.value;
          const appraisal: Appraisal | null = av
            ? { value: Number(av.value?.value ?? 0), appraiser: av.appraiser?.value ?? '', block: Number(av.block?.value ?? 0) }
            : null;

          return { tokenId, position, appraisal, interest, liquidatable };
        })
      );
      setLoans(results.filter((r): r is LoanEntry => r !== null));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [address, tokenIds.join(',')]);

  useEffect(() => { load(); }, [load]);

  return { loans, loading, error, reload: load };
}
