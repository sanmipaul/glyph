'use client';

import { useContractCall } from '@/hooks/useContractCall';
import { useToast } from '@/components/ui/Toast';
import { TxStatusBanner } from '@/components/ui/TxStatusBanner';
import { Spinner } from '@/components/ui/Spinner';
import { uintCV } from '@stacks/transactions';
import { CONTRACT_NAMES } from '@/lib/constants';

interface Props {
  withdrawalId: number;
  onAction: () => void;
}

export function ApprovalPanel({ withdrawalId, onAction }: Props) {
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();

  const approve = async () => {
    await call({
      contractName: CONTRACT_NAMES.bridgeVault,
      functionName: 'approve-withdrawal',
      functionArgs: [uintCV(withdrawalId)],
      onSuccess: () => { toast('Withdrawal approved', 'success'); onAction(); },
      onError: (r) => toast(r, 'error'),
    });
  };

  const execute = async () => {
    await call({
      contractName: CONTRACT_NAMES.bridgeVault,
      functionName: 'execute-withdrawal',
      functionArgs: [uintCV(withdrawalId)],
      onSuccess: () => { toast('Withdrawal executed', 'success'); onAction(); },
      onError: (r) => toast(r, 'error'),
    });
  };

  const cancel = async () => {
    await call({
      contractName: CONTRACT_NAMES.bridgeVault,
      functionName: 'cancel-withdrawal',
      functionArgs: [uintCV(withdrawalId)],
      onSuccess: () => { toast('Withdrawal cancelled', 'success'); onAction(); },
      onError: (r) => toast(r, 'error'),
    });
  };

  const busy = status === 'signing' || status === 'pending';

  return (
    <div className="flex flex-col gap-2 border-t border-zinc-800 pt-3">
      <TxStatusBanner status={status} txid={txid} error={error} onDismiss={reset} />
      <div className="flex flex-wrap gap-2">
        <button
          disabled={busy}
          onClick={approve}
          className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-400 disabled:opacity-50 transition-colors"
        >
          {busy && <Spinner size={12} />}
          Approve (signer)
        </button>
        <button
          disabled={busy}
          onClick={execute}
          className="flex items-center gap-1.5 rounded-lg bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-600 disabled:opacity-50 transition-colors"
        >
          {busy && <Spinner size={12} />}
          Execute
        </button>
        <button
          disabled={busy}
          onClick={cancel}
          className="flex items-center gap-1.5 rounded-lg bg-red-900/40 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-900/60 disabled:opacity-50 transition-colors"
        >
          {busy && <Spinner size={12} />}
          Cancel
        </button>
      </div>
    </div>
  );
}
