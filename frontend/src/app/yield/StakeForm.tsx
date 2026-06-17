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

export function StakeForm({ open, tokenIds, onClose, onSuccess }: Props) {
  const [tokenId, setTokenId] = useState('');
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = Number(tokenId);
    if (!id) return;
    await call({
      contractName: CONTRACT_NAMES.yieldDistributor,
      functionName: 'stake',
      functionArgs: [uintCV(id)],
      onSuccess: () => { toast('Staked successfully', 'success'); onSuccess(); },
      onError: (r) => toast(r, 'error'),
    });
  };

  const busy = status === 'signing' || status === 'pending';

  return (
    <Modal open={open} title="Stake Ordinal" onClose={() => { reset(); onClose(); }}>
      <div className="mb-4">
        <TxStatusBanner status={status} txid={txid} error={error} onDismiss={reset} />
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-400">Select token to stake</label>
          {tokenIds.length > 0 ? (
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
          ) : (
            <p className="text-sm text-zinc-500">All your Ordinals are already staked.</p>
          )}
        </div>
        <p className="text-xs text-zinc-500">
          Make sure you have approved the yield distributor contract before staking.
          Yield accrues per block until you unstake.
        </p>
        <button
          type="submit"
          disabled={busy || tokenIds.length === 0}
          className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-50 transition-colors"
        >
          {busy && <Spinner size={14} />}
          Stake
        </button>
      </form>
    </Modal>
  );
}
