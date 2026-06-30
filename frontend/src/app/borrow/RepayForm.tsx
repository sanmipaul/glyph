'use client';

import { Modal } from '@/components/ui/Modal';
import { TxStatusBanner } from '@/components/ui/TxStatusBanner';
import { Spinner } from '@/components/ui/Spinner';
import { useContractCall } from '@/hooks/useContractCall';
import { useToast } from '@/components/ui/Toast';
import { uintCV } from '@stacks/transactions';
import { CONTRACT_NAMES } from '@/lib/constants';

interface Props {
  tokenId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function RepayForm({ tokenId, onClose, onSuccess }: Props) {
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // repay(token-id uint) — contract calculates the full outstanding amount internally
    await call({
      contractName: CONTRACT_NAMES.ordinalCollateral,
      functionName: 'repay',
      functionArgs: [uintCV(tokenId)],
      onSuccess: () => { toast('Repayment successful', 'success'); onSuccess(); },
      onError: (r) => toast(r, 'error'),
    });
  };

  const busy = status === 'signing' || status === 'pending';

  return (
    <Modal open title={`Repay Loan — Token #${tokenId}`} onClose={() => { reset(); onClose(); }}>
      <div className="mb-4">
        <TxStatusBanner status={status} txid={txid} error={error} onDismiss={reset} />
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <p className="text-sm text-zinc-300">
          Repay the full outstanding balance (principal + accrued interest) for Token #{tokenId}.
          The exact amount will be calculated by the contract at signing time.
        </p>
        <p className="text-xs text-zinc-500">
          Your NFT collateral will be returned to your wallet once the repayment is confirmed.
        </p>
        <button
          type="submit"
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-50 transition-colors"
        >
          {busy && <Spinner size={14} />}
          Repay Full Balance
        </button>
      </form>
    </Modal>
  );
}
