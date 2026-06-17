'use client';

import { useState } from 'react';
import { Nav } from '@/components/Nav';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { useWallet } from '@/context/WalletContext';
import { useWithdrawals } from '@/hooks/useWithdrawals';
import { WithdrawalList } from './WithdrawalList';
import { InitiateWithdrawalForm } from './InitiateWithdrawalForm';

export default function BridgePage() {
  const { address, connected, connect } = useWallet();
  const { withdrawals, requiredSigs, loading, reload } = useWithdrawals(address);
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-10 flex flex-col gap-10">
        <PageHeader
          title="Bridge"
          description="Unwrap your Ordinals and bridge them back to Bitcoin via multi-sig vault."
          action={
            connected ? (
              <button
                onClick={() => setShowForm(true)}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400 transition-colors"
              >
                + Initiate Withdrawal
              </button>
            ) : null
          }
        />

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-400">
          <span className="font-medium text-zinc-300">How it works: </span>
          Submit a withdrawal request with your Bitcoin address. The multi-sig vault requires{' '}
          <span className="text-orange-400 font-medium">{requiredSigs} signer approvals</span> before
          releasing the inscription back to Bitcoin.
        </div>

        {!connected ? (
          <EmptyState
            title="Connect your wallet"
            description="Connect a Stacks wallet to view and manage bridge requests."
            action={
              <button onClick={connect} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400 transition-colors">
                Connect Wallet
              </button>
            }
          />
        ) : loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : withdrawals.length === 0 ? (
          <EmptyState
            title="No withdrawal requests"
            description="You haven't initiated any bridge withdrawals. Submit a request to move an Ordinal back to Bitcoin."
            action={
              <button onClick={() => setShowForm(true)} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400 transition-colors">
                Initiate Withdrawal
              </button>
            }
          />
        ) : (
          <WithdrawalList withdrawals={withdrawals} requiredSigs={requiredSigs} address={address!} onAction={reload} />
        )}

        <InitiateWithdrawalForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); reload(); }}
        />
      </main>
    </>
  );
}
