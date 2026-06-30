'use client';

import { useState } from 'react';
import { Nav } from '@/components/Nav';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { useWallet } from '@/context/WalletContext';
import { useOrdinals } from '@/hooks/useOrdinals';
import { useLoans } from '@/hooks/useLoans';
import { useIsAppraiser } from '@/hooks/useIsAppraiser';
import { LoanTable } from './LoanTable';
import { OpenLoanForm } from './OpenLoanForm';
import { AppraiseForm } from './AppraiseForm';

export default function BorrowPage() {
  const { address, connected, connect } = useWallet();
  const { ordinals, loading: ordinalsLoading } = useOrdinals(address);
  const tokenIds = ordinals.map((o) => o.tokenId);
  const { loans, loading: loansLoading, reload } = useLoans(address, tokenIds);
  const isAppraiser = useIsAppraiser(address);
  const [showForm, setShowForm] = useState(false);
  const [showAppraise, setShowAppraise] = useState(false);

  const loading = ordinalsLoading || loansLoading;
  const loanedIds = loans.map((l) => l.tokenId);
  const available = tokenIds.filter((id) => !loanedIds.includes(id));

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-10 flex flex-col gap-10">
        <PageHeader
          title="Borrow"
          description="Use wrapped Ordinals as collateral to borrow STX at 5% APR."
          action={
            connected ? (
              <div className="flex gap-2">
                {isAppraiser && (
                  <button
                    onClick={() => setShowAppraise(true)}
                    className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 hover:border-zinc-500 transition-colors"
                  >
                    Appraise Token
                  </button>
                )}
                <button
                  onClick={() => setShowForm(true)}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400 transition-colors"
                >
                  + Open Loan
                </button>
              </div>
            ) : null
          }
        />

        {!connected ? (
          <EmptyState
            title="Connect your wallet"
            description="Connect a Stacks wallet to view and manage your loan positions."
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
        ) : loans.length === 0 ? (
          <EmptyState
            title="No open loans"
            description="You have no active loan positions. Collateralize a wrapped Ordinal to borrow STX."
            action={
              <button onClick={() => setShowForm(true)} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400 transition-colors">
                Open Loan
              </button>
            }
          />
        ) : (
          <LoanTable loans={loans} userAddress={address ?? ''} onAction={reload} />
        )}

        <OpenLoanForm
          open={showForm}
          availableTokenIds={available}
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); reload(); }}
        />

        <AppraiseForm
          open={showAppraise}
          tokenIds={tokenIds}
          onClose={() => setShowAppraise(false)}
          onSuccess={() => { setShowAppraise(false); reload(); }}
        />
      </main>
    </>
  );
}
