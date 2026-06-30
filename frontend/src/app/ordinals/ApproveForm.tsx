'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { TxStatusBanner } from '@/components/ui/TxStatusBanner';
import { Spinner } from '@/components/ui/Spinner';
import { useContractCall } from '@/hooks/useContractCall';
import { useToast } from '@/components/ui/Toast';
import { uintCV, someCV, noneCV, standardPrincipalCV, trueCV, falseCV } from '@stacks/transactions';
import { CONTRACT_NAMES, CONTRACTS } from '@/lib/constants';

interface Props {
  tokenId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApproveForm({ tokenId, onClose, onSuccess }: Props) {
  const [operator, setOperator] = useState('');
  const [mode, setMode] = useState<'single' | 'all'>('single');
  const [revokeAll, setRevokeAll] = useState(false);
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'single') {
      // set-approved(token-id uint, operator (optional principal))
      await call({
        contractName: CONTRACT_NAMES.wrappedOrdinalNft,
        functionName: 'set-approved',
        functionArgs: [uintCV(tokenId), someCV(standardPrincipalCV(operator.trim()))],
        onSuccess: () => { toast('Approval set', 'success'); onSuccess(); },
        onError: (r) => toast(r, 'error'),
      });
    } else {
      // set-approval-for-all(operator principal, approved bool)
      await call({
        contractName: CONTRACT_NAMES.wrappedOrdinalNft,
        functionName: 'set-approval-for-all',
        functionArgs: [standardPrincipalCV(operator.trim()), revokeAll ? falseCV() : trueCV()],
        onSuccess: () => { toast(revokeAll ? 'Operator revoked' : 'Operator approved for all tokens', 'success'); onSuccess(); },
        onError: (r) => toast(r, 'error'),
      });
    }
  };

  const busy = status === 'signing' || status === 'pending';

  return (
    <Modal open title={`Approve Token #${tokenId}`} onClose={() => { reset(); onClose(); }}>
      <div className="mb-4">
        <TxStatusBanner status={status} txid={txid} error={error} onDismiss={reset} />
      </div>
      <div className="mb-4 flex gap-2">
        {(['single', 'all'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === m ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {m === 'single' ? 'Single token' : 'All tokens'}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-400">Operator address</label>
          <input
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            placeholder={CONTRACTS.ordinalCollateral}
            required
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
          />
          <p className="text-xs text-zinc-600">Contract address that will be allowed to transfer this NFT.</p>
        </div>
        {mode === 'all' && (
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={revokeAll}
              onChange={(e) => setRevokeAll(e.target.checked)}
              className="rounded border-zinc-600 bg-zinc-900"
            />
            Revoke (remove approval for all)
          </label>
        )}
        <button
          type="submit"
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-50 transition-colors"
        >
          {busy && <Spinner size={14} />}
          {mode === 'all' && revokeAll ? 'Revoke Approval' : 'Approve'}
        </button>
      </form>
    </Modal>
  );
}
