'use client';

import { useState } from 'react';
import { Nav } from '@/components/Nav';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { useWallet } from '@/context/WalletContext';
import { useOrdinals } from '@/hooks/useOrdinals';
import { useStakes } from '@/hooks/useStakes';
import { StakeTable } from './StakeTable';
import { StakeForm } from './StakeForm';
import { CollectionBreakdown } from './CollectionBreakdown';

export default function YieldPage() {
  const { address, connected, connect } = useWallet();
  const { ordinals, loading: ordinalsLoading } = useOrdinals(address);
  const tokenIds = ordinals.map((o) => o.tokenId);
  const { stakes, loading: stakesLoading, reload } = useStakes(address, tokenIds);
  const [showStake, setShowStake] = useState(false);

  const loading = ordinalsLoading || stakesLoading;

  const collections = [...new Set(ordinals.map((o) => o.data?.collection).filter(Boolean) as string[])];

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-10 flex flex-col gap-10">
        <PageHeader
          title="Yield"
          description="Stake wrapped Ordinals to earn per-block yield from eligible collections."
          action={
            connected ? (
              <button
                onClick={() => setShowStake(true)}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400 transition-colors"
              >
                + Stake Ordinal
              </button>
            ) : null
          }
        />

        {!connected ? (
          <EmptyState
            title="Connect your wallet"
            description="Connect a Stacks wallet to view your staking positions."
            action={
              <button onClick={connect} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400 transition-colors">
                Connect Wallet
              </button>
            }
          />
        ) : loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : stakes.length === 0 ? (
          <EmptyState
            title="No active stakes"
            description="You haven't staked any Ordinals yet. Stake an eligible Ordinal to earn yield."
            action={
              <button onClick={() => setShowStake(true)} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400 transition-colors">
                Stake Ordinal
              </button>
            }
          />
        ) : (
          <StakeTable stakes={stakes} onAction={reload} />
        )}

        {collections.length > 0 && <CollectionBreakdown collections={collections} />}

        <StakeForm
          open={showStake}
          tokenIds={tokenIds.filter((id) => !stakes.some((s) => s.tokenId === id))}
          onClose={() => setShowStake(false)}
          onSuccess={() => { setShowStake(false); reload(); }}
        />
      </main>
    </>
  );
}
