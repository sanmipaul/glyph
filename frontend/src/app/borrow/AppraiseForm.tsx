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
  tokenIds: number[];
  onClose: () => void;
  onSuccess: () => void;
}

export function AppraiseForm({ open, tokenIds, onClose, onSuccess }: Props) {
  const [tokenId, setTokenId] = useState('');
  const [value, setValue] = useState('');
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const micro = Math.floor(Number(value) * 1_000_000);
    await call({
      contractName: CONTRACT_NAMES.ordinalCollateral,
      functionName: 'appraise-token',
      functionArgs: [uintCV(Number(tokenId)), uintCV(micro)],
      onSuccess: () => { toast(`Token #${tokenId} appraised at ${value} STX`, 'success'); onSuccess(); },
      onError: (r) => toast(r, 'error'),
    });
  };

  const busy = status === 'signing' || status === 'pending';

  return (
    <Modal open={open} title="Appraise Token" onClose={() => { reset(); onClose(); }}>
      <div className="mb-4">
        <TxStatusBanner status={status} txid={txid} error={error} onDismiss={reset} />
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-400">Token to appraise</label>
          <select
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            required
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
          >
            <option value="">Choose a token…</option>
            {tokenIds.map((id) => (
              <option key={id} value={id}>Token #{id}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-400">Appraised value (STX)</label>
          <input
            type="number"
            step="0.000001"
            min="0.000001"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="500"
            required
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
          />
        </div>
        <p className="text-xs text-zinc-500">
          Only authorized appraisers can set valuations. The LTV cap for the token's collection
          limits the maximum loan that can be opened against this appraisal.
        </p>
        <button
          type="submit"
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-50 transition-colors"
        >
          {busy && <Spinner size={14} />}
          Set Appraisal
        </button>
      </form>
    </Modal>
  );
}
