'use client';

import { useState } from 'react';
import { useContractCall } from '@/hooks/useContractCall';
import { useToast } from '@/components/ui/Toast';
import { standardPrincipalCV, uintCV, stringAsciiCV } from '@stacks/transactions';
import { CONTRACT_NAMES } from '@/lib/constants';
import { ActionRow, Field, SubmitBtn, TxFeedback } from './AdminSection';

function AppraiseToken() {
  const [tokenId, setTokenId] = useState('');
  const [value, setValue] = useState('');
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();
  const busy = status === 'signing' || status === 'pending';

  return (
    <ActionRow label="Appraise Token" description="Set the appraised STX value for a wrapped Ordinal. Required before a loan can be opened.">
      <form className="flex flex-col gap-3" onSubmit={async (e) => {
        e.preventDefault();
        const microValue = Math.floor(Number(value) * 1_000_000);
        await call({
          contractName: CONTRACT_NAMES.ordinalCollateral,
          functionName: 'appraise-token',
          functionArgs: [uintCV(Number(tokenId)), uintCV(microValue)],
          onSuccess: () => { toast('Token appraised', 'success'); setTokenId(''); setValue(''); reset(); },
          onError: (r) => toast(r, 'error'),
        });
      }}>
        <Field label="Token ID" type="number" value={tokenId} onChange={setTokenId} placeholder="1" required />
        <Field label="Appraised value (STX)" type="number" value={value} onChange={setValue} placeholder="500" required />
        <SubmitBtn label="Set Appraisal" busy={busy} />
        <TxFeedback status={status} txid={txid} error={error} onDismiss={reset} />
      </form>
    </ActionRow>
  );
}

function SetCollectionLtv() {
  const [collection, setCollection] = useState('');
  const [ltv, setLtv] = useState('');
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();
  const busy = status === 'signing' || status === 'pending';

  return (
    <ActionRow label="Set Collection LTV" description="Configure the max loan-to-value ratio (in basis points) for a collection. e.g. 5000 = 50%.">
      <form className="flex flex-col gap-3" onSubmit={async (e) => {
        e.preventDefault();
        await call({
          contractName: CONTRACT_NAMES.ordinalCollateral,
          functionName: 'set-collection-ltv',
          functionArgs: [stringAsciiCV(collection.trim()), uintCV(Number(ltv))],
          onSuccess: () => { toast('LTV updated', 'success'); setCollection(''); setLtv(''); reset(); },
          onError: (r) => toast(r, 'error'),
        });
      }}>
        <Field label="Collection name" value={collection} onChange={setCollection} placeholder="my-collection" required />
        <Field label="LTV (basis points)" type="number" value={ltv} onChange={setLtv} placeholder="5000" required />
        <SubmitBtn label="Set LTV" busy={busy} />
        <TxFeedback status={status} txid={txid} error={error} onDismiss={reset} />
      </form>
    </ActionRow>
  );
}

function AddAppraiser() {
  const [addr, setAddr] = useState('');
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();
  const busy = status === 'signing' || status === 'pending';

  return (
    <ActionRow label="Add Appraiser" description="Grant an address permission to appraise tokens.">
      <form className="flex flex-col gap-3" onSubmit={async (e) => {
        e.preventDefault();
        await call({
          contractName: CONTRACT_NAMES.ordinalCollateral,
          functionName: 'add-appraiser',
          functionArgs: [standardPrincipalCV(addr.trim())],
          onSuccess: () => { toast('Appraiser added', 'success'); setAddr(''); reset(); },
          onError: (r) => toast(r, 'error'),
        });
      }}>
        <Field label="Principal" value={addr} onChange={setAddr} placeholder="SP..." required />
        <SubmitBtn label="Add Appraiser" busy={busy} />
        <TxFeedback status={status} txid={txid} error={error} onDismiss={reset} />
      </form>
    </ActionRow>
  );
}

function RemoveAppraiser() {
  const [addr, setAddr] = useState('');
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();
  const busy = status === 'signing' || status === 'pending';

  return (
    <ActionRow label="Remove Appraiser" description="Revoke appraisal permissions.">
      <form className="flex flex-col gap-3" onSubmit={async (e) => {
        e.preventDefault();
        await call({
          contractName: CONTRACT_NAMES.ordinalCollateral,
          functionName: 'remove-appraiser',
          functionArgs: [standardPrincipalCV(addr.trim())],
          onSuccess: () => { toast('Appraiser removed', 'success'); setAddr(''); reset(); },
          onError: (r) => toast(r, 'error'),
        });
      }}>
        <Field label="Principal" value={addr} onChange={setAddr} placeholder="SP..." required />
        <SubmitBtn label="Remove Appraiser" busy={busy} danger />
        <TxFeedback status={status} txid={txid} error={error} onDismiss={reset} />
      </form>
    </ActionRow>
  );
}

export function CollateralAdmin() {
  return (
    <div className="flex flex-col gap-4">
      <AppraiseToken />
      <SetCollectionLtv />
      <AddAppraiser />
      <RemoveAppraiser />
    </div>
  );
}
