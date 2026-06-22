'use client';

import { useState, useEffect } from 'react';
import { ro } from '@/lib/stacks';
import { CONTRACT_NAMES } from '@/lib/constants';
import { standardPrincipalCV } from '@stacks/transactions';

export function useIsAppraiser(address: string | null) {
  const [isAppraiser, setIsAppraiser] = useState(false);

  useEffect(() => {
    if (!address) { setIsAppraiser(false); return; }
    ro(CONTRACT_NAMES.ordinalCollateral, 'is-appraiser', [standardPrincipalCV(address)])
      .then((r: any) => setIsAppraiser(Boolean(r?.value)))
      .catch(() => setIsAppraiser(false));
  }, [address]);

  return isAppraiser;
}
