'use client';

import { useState } from 'react';
import { useContractCall } from '@/hooks/useContractCall';
import { useToast } from '@/components/ui/Toast';
import { standardPrincipalCV, uintCV } from '@stacks/transactions';
import { CONTRACT_NAMES } from '@/lib/constants';
import { ActionRow, Field, SubmitBtn, TxFeedback } from './AdminSection';

function AddSigner() {
  const [addr, setAddr] = useState('');
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();
  const busy = status === 'signing' || status === 'pending';

  return (
    <ActionRow label="Add Signer" description="Add a trusted principal to the multi-sig vault.">
      <form className="flex flex-col gap-3" onSubmit={async (e) => {
        e.preventDefault();
        await call({
          contractName: CONTRACT_NAMES.bridgeVault,
          functionName: 'add-signer',
          functionArgs: [standardPrincipalCV(addr.trim())],
          onSuccess: () => { toast('Signer added', 'success'); setAddr(''); reset(); },
          onError: (r) => toast(r, 'error'),
        });
      }}>
        <Field label="Signer principal" value={addr} onChange={setAddr} placeholder="SP..." required />
        <SubmitBtn label="Add Signer" busy={busy} />
        <TxFeedback status={status} txid={txid} error={error} onDismiss={reset} />
      </form>
    </ActionRow>
  );
}

function RemoveSigner() {
  const [addr, setAddr] = useState('');
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();
  const busy = status === 'signing' || status === 'pending';

  return (
    <ActionRow label="Remove Signer" description="Remove a signer from the vault.">
      <form className="flex flex-col gap-3" onSubmit={async (e) => {
        e.preventDefault();
        await call({
          contractName: CONTRACT_NAMES.bridgeVault,
          functionName: 'remove-signer',
          functionArgs: [standardPrincipalCV(addr.trim())],
          onSuccess: () => { toast('Signer removed', 'success'); setAddr(''); reset(); },
          onError: (r) => toast(r, 'error'),
        });
      }}>
        <Field label="Signer principal" value={addr} onChange={setAddr} placeholder="SP..." required />
        <SubmitBtn label="Remove Signer" busy={busy} danger />
        <TxFeedback status={status} txid={txid} error={error} onDismiss={reset} />
      </form>
    </ActionRow>
  );
}

function SetRequiredSignatures() {
  const [n, setN] = useState('');
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();
  const busy = status === 'signing' || status === 'pending';

  return (
    <ActionRow label="Set Required Signatures" description="Change the number of signers needed to execute a withdrawal.">
      <form className="flex flex-col gap-3" onSubmit={async (e) => {
        e.preventDefault();
        await call({
          contractName: CONTRACT_NAMES.bridgeVault,
          functionName: 'set-required-signatures',
          functionArgs: [uintCV(Number(n))],
          onSuccess: () => { toast('Required signatures updated', 'success'); setN(''); reset(); },
          onError: (r) => toast(r, 'error'),
        });
      }}>
        <Field label="Required signatures" type="number" value={n} onChange={setN} placeholder="2" required />
        <SubmitBtn label="Update Threshold" busy={busy} />
        <TxFeedback status={status} txid={txid} error={error} onDismiss={reset} />
      </form>
    </ActionRow>
  );
}

export function BridgeAdmin() {
  return (
    <div className="flex flex-col gap-4">
      <AddSigner />
      <RemoveSigner />
      <SetRequiredSignatures />
    </div>
  );
}
