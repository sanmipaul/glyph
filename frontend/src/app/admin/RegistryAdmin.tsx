'use client';

import { useState } from 'react';
import { useContractCall } from '@/hooks/useContractCall';
import { useToast } from '@/components/ui/Toast';
import { standardPrincipalCV } from '@stacks/transactions';
import { CONTRACT_NAMES } from '@/lib/constants';
import { ActionRow, Field, SubmitBtn, TxFeedback } from './AdminSection';

function AddVerifier() {
  const [addr, setAddr] = useState('');
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();
  const busy = status === 'signing' || status === 'pending';

  return (
    <ActionRow label="Add Verifier" description="Grant an address permission to verify inscriptions.">
      <form className="flex flex-col gap-3" onSubmit={async (e) => {
        e.preventDefault();
        await call({
          contractName: CONTRACT_NAMES.ordinalRegistry,
          functionName: 'add-verifier',
          functionArgs: [standardPrincipalCV(addr.trim())],
          onSuccess: () => { toast('Verifier added', 'success'); setAddr(''); reset(); },
          onError: (r) => toast(r, 'error'),
        });
      }}>
        <Field label="Principal" value={addr} onChange={setAddr} placeholder="SP..." required />
        <SubmitBtn label="Add Verifier" busy={busy} />
        <TxFeedback status={status} txid={txid} error={error} onDismiss={reset} />
      </form>
    </ActionRow>
  );
}

function RemoveVerifier() {
  const [addr, setAddr] = useState('');
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();
  const busy = status === 'signing' || status === 'pending';

  return (
    <ActionRow label="Remove Verifier" description="Revoke verification permissions from an address.">
      <form className="flex flex-col gap-3" onSubmit={async (e) => {
        e.preventDefault();
        await call({
          contractName: CONTRACT_NAMES.ordinalRegistry,
          functionName: 'remove-verifier',
          functionArgs: [standardPrincipalCV(addr.trim())],
          onSuccess: () => { toast('Verifier removed', 'success'); setAddr(''); reset(); },
          onError: (r) => toast(r, 'error'),
        });
      }}>
        <Field label="Principal" value={addr} onChange={setAddr} placeholder="SP..." required />
        <SubmitBtn label="Remove Verifier" busy={busy} danger />
        <TxFeedback status={status} txid={txid} error={error} onDismiss={reset} />
      </form>
    </ActionRow>
  );
}

export function RegistryAdmin() {
  return (
    <div className="flex flex-col gap-4">
      <AddVerifier />
      <RemoveVerifier />
    </div>
  );
}
