'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { TxStatusBanner } from '@/components/ui/TxStatusBanner';
import { Spinner } from '@/components/ui/Spinner';
import { useContractCall } from '@/hooks/useContractCall';
import { useToast } from '@/components/ui/Toast';
import { uintCV } from '@stacks/transactions';
import { CONTRACT_NAMES } from '@/lib/constants';

interface Props {
  open: boolean;
  availableTokenIds: number[];
  onClose: () => void;
  onSuccess: () => void;
}

export function OpenLoanForm({ open, availableTokenIds, onClose, onSuccess }: Props) {
  const [tokenId, setTokenId] = useState('');
  const [amount, setAmount] = useState('');
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const microAmount = Math.floor(Number(amount) * 1_000_000);
    await call({
      contractName: CONTRACT_NAMES.ordinalCollateral,
      functionName: 'open-position',
      functionArgs: [uintCV(Number(tokenId)), uintCV(microAmount)],
      onSuccess: () => { toast('Loan opened successfully', 'success'); onSuccess(); },
      onError: (r) => toast(r, 'error'),
    });
  };

  const busy = status === 'signing' || status === 'pending';

  return (
    <Modal open={open} title="Open Loan" onClose={() => { reset(); onClose(); }}>
      <div className="mb-4">
        <TxStatusBanner status={status} txid={txid} error={error} onDismiss={reset} />
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-400">Collateral token</label>
          {availableTokenIds.length > 0 ? (
            <select
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              required
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
            >
              <option value="">Choose a token…</option>
              {availableTokenIds.map((id) => (
                <option key={id} value={id}>Token #{id}</option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-zinc-500">No eligible tokens available.</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-400">Borrow amount (STX)</label>
          <input
            type="number"
            step="0.000001"
            min="0.000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            required
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
          />
        </div>
        <p className="text-xs text-zinc-500">
          Loans accrue 5% APR. Make sure the amount is within your collection's LTV limit.
          Approve the collateral contract before opening.
        </p>
        <button
          type="submit"
          disabled={busy || availableTokenIds.length === 0}
          className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-50 transition-colors"
        >
          {busy && <Spinner size={14} />}
          Open Loan
        </button>
      </form>
    </Modal>
  );
}
