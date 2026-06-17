'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { TxStatusBanner } from '@/components/ui/TxStatusBanner';
import { Spinner } from '@/components/ui/Spinner';
import { useContractCall } from '@/hooks/useContractCall';
import { useToast } from '@/components/ui/Toast';
import { uintCV, stringAsciiCV } from '@stacks/transactions';
import { CONTRACT_NAMES } from '@/lib/constants';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InitiateWithdrawalForm({ open, onClose, onSuccess }: Props) {
  const [tokenId, setTokenId] = useState('');
  const [btcAddress, setBtcAddress] = useState('');
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await call({
      contractName: CONTRACT_NAMES.bridgeVault,
      functionName: 'initiate-withdrawal',
      functionArgs: [uintCV(Number(tokenId)), stringAsciiCV(btcAddress.trim())],
      onSuccess: () => { toast('Withdrawal initiated', 'success'); onSuccess(); },
      onError: (r) => toast(r, 'error'),
    });
  };

  const busy = status === 'signing' || status === 'pending';

  return (
    <Modal open={open} title="Initiate Withdrawal" onClose={() => { reset(); onClose(); }}>
      <div className="mb-4">
        <TxStatusBanner status={status} txid={txid} error={error} onDismiss={reset} />
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-400">Token ID</label>
          <input
            type="number"
            min="1"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="1"
            required
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-400">Bitcoin destination address</label>
          <input
            value={btcAddress}
            onChange={(e) => setBtcAddress(e.target.value)}
            placeholder="bc1q..."
            required
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
          />
        </div>
        <p className="text-xs text-zinc-500">
          After submission, vault signers will review and approve the withdrawal.
          The inscription will be released once the required signatures are collected.
        </p>
        <button
          type="submit"
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-50 transition-colors"
        >
          {busy && <Spinner size={14} />}
          Submit Withdrawal Request
        </button>
      </form>
    </Modal>
  );
}
