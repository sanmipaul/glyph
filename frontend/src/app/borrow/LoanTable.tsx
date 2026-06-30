'use client';

import { useState } from 'react';
import { microToStx, bpsToPercent } from '@/lib/format';
import { useContractCall } from '@/hooks/useContractCall';
import { useToast } from '@/components/ui/Toast';
import { TxStatusBanner } from '@/components/ui/TxStatusBanner';
import { Spinner } from '@/components/ui/Spinner';
import { RepayForm } from './RepayForm';
import { uintCV, standardPrincipalCV } from '@stacks/transactions';
import { CONTRACT_NAMES } from '@/lib/constants';
import type { LoanPosition, Appraisal } from '@/types';

interface LoanEntry {
  tokenId: number;
  position: LoanPosition;
  appraisal: Appraisal | null;
  interest: number | null;
  liquidatable: boolean;
}

interface Props {
  loans: LoanEntry[];
  userAddress: string;
  onAction: () => void;
}

export function LoanTable({ loans, userAddress, onAction }: Props) {
  const [repaying, setRepaying] = useState<number | null>(null);
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();

  const liquidate = async (tokenId: number) => {
    await call({
      contractName: CONTRACT_NAMES.ordinalCollateral,
      functionName: 'liquidate-position',
      functionArgs: [standardPrincipalCV(userAddress), uintCV(tokenId)],
      onSuccess: () => { toast('Liquidated', 'success'); onAction(); },
      onError: (r) => toast(r, 'error'),
    });
  };

  const busy = status === 'signing' || status === 'pending';

  return (
    <div className="flex flex-col gap-4">
      <TxStatusBanner status={status} txid={txid} error={error} onDismiss={reset} />
      {loans.map(({ tokenId, position, appraisal, interest, liquidatable }) => {
        const total = position.loanAmount + (interest ?? 0);
        return (
          <div key={tokenId} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Token</p>
                <p className="font-mono text-sm text-zinc-300">#{tokenId}</p>
              </div>
              {liquidatable && (
                <span className="rounded bg-red-900/40 px-2 py-0.5 text-xs font-medium text-red-400">
                  Liquidatable
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Principal</p>
                <p className="font-medium text-zinc-200">{microToStx(position.loanAmount)} STX</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Accrued interest</p>
                <p className="font-medium text-orange-400">{interest != null ? `${microToStx(interest)} STX` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Total owed</p>
                <p className="font-medium text-zinc-200">{microToStx(total)} STX</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">LTV at open</p>
                <p className="font-medium text-zinc-200">{bpsToPercent(position.ltvAtOpen)}</p>
              </div>
            </div>

            {appraisal && (
              <div className="rounded-lg bg-zinc-800/50 px-3 py-2 text-xs text-zinc-400">
                Appraised at <span className="text-zinc-200">{microToStx(appraisal.value)} STX</span> (block {appraisal.block})
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1 border-t border-zinc-800">
              <button
                disabled={busy}
                onClick={() => setRepaying(tokenId)}
                className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-400 disabled:opacity-50 transition-colors"
              >
                Repay Loan
              </button>
              {liquidatable && (
                <button
                  disabled={busy}
                  onClick={() => liquidate(tokenId)}
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
                >
                  {busy && <Spinner size={12} />}
                  Liquidate
                </button>
              )}
            </div>
          </div>
        );
      })}
      {repaying !== null && (
        <RepayForm
          tokenId={repaying}
          onClose={() => setRepaying(null)}
          onSuccess={() => { setRepaying(null); onAction(); }}
        />
      )}
    </div>
  );
}
