'use client';

import { useState } from 'react';
import { useContractCall } from '@/hooks/useContractCall';
import { useToast } from '@/components/ui/Toast';
import { standardPrincipalCV } from '@stacks/transactions';
import { CONTRACT_NAMES } from '@/lib/constants';
import { ActionRow, Field, SubmitBtn, TxFeedback } from './AdminSection';

function SetRegistryContract() {
  const [addr, setAddr] = useState('');
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();
  const busy = status === 'signing' || status === 'pending';

  return (
    <ActionRow
      label="Set Registry Contract"
      description="Update the ordinal-registry contract address the NFT contract delegates to."
    >
      <form className="flex flex-col gap-3" onSubmit={async (e) => {
        e.preventDefault();
        await call({
          contractName: CONTRACT_NAMES.wrappedOrdinalNft,
          functionName: 'set-registry-contract',
          functionArgs: [standardPrincipalCV(addr.trim())],
          onSuccess: () => { toast('Registry contract updated', 'success'); setAddr(''); reset(); },
          onError: (r) => toast(r, 'error'),
        });
      }}>
        <Field label="Registry contract principal" value={addr} onChange={setAddr} placeholder="SP...contract" required />
        <SubmitBtn label="Update Registry" busy={busy} />
        <TxFeedback status={status} txid={txid} error={error} onDismiss={reset} />
      </form>
    </ActionRow>
  );
}

function SetVaultContract() {
  const [addr, setAddr] = useState('');
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();
  const busy = status === 'signing' || status === 'pending';

  return (
    <ActionRow
      label="Set Vault Contract"
      description="Update the bridge-vault contract address authorized to burn NFTs on withdrawal."
    >
      <form className="flex flex-col gap-3" onSubmit={async (e) => {
        e.preventDefault();
        await call({
          contractName: CONTRACT_NAMES.wrappedOrdinalNft,
          functionName: 'set-vault-contract',
          functionArgs: [standardPrincipalCV(addr.trim())],
          onSuccess: () => { toast('Vault contract updated', 'success'); setAddr(''); reset(); },
          onError: (r) => toast(r, 'error'),
        });
      }}>
        <Field label="Vault contract principal" value={addr} onChange={setAddr} placeholder="SP...contract" required />
        <SubmitBtn label="Update Vault" busy={busy} />
        <TxFeedback status={status} txid={txid} error={error} onDismiss={reset} />
      </form>
    </ActionRow>
  );
}

export function NftAdmin() {
  return (
    <div className="flex flex-col gap-4">
      <SetRegistryContract />
      <SetVaultContract />
    </div>
  );
}
