'use client';

import { useState } from 'react';
import { Nav } from '@/components/Nav';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useWallet } from '@/context/WalletContext';
import { useOrdinals } from '@/hooks/useOrdinals';
import { OrdinalGrid } from './OrdinalGrid';
import { WrapForm } from './WrapForm';

export default function OrdinalsPage() {
  const { address, connected, connect } = useWallet();
  const { ordinals, loading, reload } = useOrdinals(address);
  const [showWrap, setShowWrap] = useState(false);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <PageHeader
          title="My Ordinals"
          description="Your wrapped Bitcoin Ordinal inscriptions on Stacks."
          action={
            connected ? (
              <button
                onClick={() => setShowWrap(true)}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400 transition-colors"
              >
                + Wrap Inscription
              </button>
            ) : null
          }
        />

        <div className="mt-8">
          {!connected ? (
            <EmptyState
              title="Connect your wallet"
              description="Connect a Stacks wallet to view and manage your wrapped Ordinals."
              action={
                <button
                  onClick={connect}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400 transition-colors"
                >
                  Connect Wallet
                </button>
              }
            />
          ) : loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : ordinals.length === 0 ? (
            <EmptyState
              title="No wrapped Ordinals"
              description="You don't have any wrapped Ordinals yet. Wrap an inscription to get started."
              action={
                <button
                  onClick={() => setShowWrap(true)}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400 transition-colors"
                >
                  Wrap Inscription
                </button>
              }
            />
          ) : (
            <OrdinalGrid ordinals={ordinals} onAction={reload} />
          )}
        </div>

        <WrapForm open={showWrap} onClose={() => setShowWrap(false)} onSuccess={() => { setShowWrap(false); reload(); }} />
      </main>
    </>
  );
}
