'use client';

import { useContractCall } from '@/hooks/useContractCall';
import { useToast } from '@/components/ui/Toast';
import { TxStatusBanner } from '@/components/ui/TxStatusBanner';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { stringAsciiCV } from '@stacks/transactions';
import { CONTRACT_NAMES } from '@/lib/constants';
import { useState } from 'react';

interface Props {
  inscriptionId: string;
  verified: boolean;
}

export function VerifierControls({ inscriptionId, verified }: Props) {
  const [confirming, setConfirming] = useState(false);
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();

  const verify = async () => {
    await call({
      contractName: CONTRACT_NAMES.ordinalRegistry,
      functionName: 'verify-ordinal',
      functionArgs: [stringAsciiCV(inscriptionId)],
      onSuccess: () => { toast('Inscription verified', 'success'); setConfirming(false); },
      onError: (r) => { toast(r, 'error'); setConfirming(false); },
    });
  };

  const busy = status === 'signing' || status === 'pending';

  if (verified) {
    return (
      <div className="rounded-lg border border-green-800/50 bg-green-900/20 px-4 py-3 text-sm text-green-400">
        This inscription is already verified.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-3">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Verifier Controls</p>
      <TxStatusBanner status={status} txid={txid} error={error} onDismiss={reset} />
      <button
        onClick={() => setConfirming(true)}
        disabled={busy}
        className="flex items-center gap-2 self-start rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-50 transition-colors"
      >
        {busy && <Spinner size={14} />}
        Verify Inscription
      </button>
      <ConfirmDialog
        open={confirming}
        title="Verify Inscription"
        description={`Mark inscription "${inscriptionId.slice(0, 20)}…" as verified on-chain. This action is permanent.`}
        confirmLabel="Verify"
        loading={busy}
        onConfirm={verify}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
