'use client';

import { useState } from 'react';
import { useContractCall } from '@/hooks/useContractCall';
import { useToast } from '@/components/ui/Toast';
import { uintCV, stringAsciiCV } from '@stacks/transactions';
import { CONTRACT_NAMES } from '@/lib/constants';
import { ActionRow, Field, SubmitBtn, TxFeedback } from './AdminSection';

function FundYield() {
  const [assetId, setAssetId] = useState('');
  const [amount, setAmount] = useState('');
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();
  const busy = status === 'signing' || status === 'pending';

  return (
    <ActionRow label="Fund Yield Treasury" description="Deposit STX into the yield treasury for a given asset ID.">
      <form className="flex flex-col gap-3" onSubmit={async (e) => {
        e.preventDefault();
        const micro = Math.floor(Number(amount) * 1_000_000);
        await call({
          contractName: CONTRACT_NAMES.yieldDistributor,
          functionName: 'fund-yield',
          functionArgs: [uintCV(Number(assetId)), uintCV(micro)],
          onSuccess: () => { toast('Yield treasury funded', 'success'); setAssetId(''); setAmount(''); reset(); },
          onError: (r) => toast(r, 'error'),
        });
      }}>
        <Field label="Asset ID" type="number" value={assetId} onChange={setAssetId} placeholder="1" required />
        <Field label="Amount (STX)" type="number" value={amount} onChange={setAmount} placeholder="1000" required />
        <SubmitBtn label="Fund Treasury" busy={busy} />
        <TxFeedback status={status} txid={txid} error={error} onDismiss={reset} />
      </form>
    </ActionRow>
  );
}

function SetCollectionConfig() {
  const [collection, setCollection] = useState('');
  const [rate, setRate] = useState('');
  const [assetId, setAssetId] = useState('');
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();
  const busy = status === 'signing' || status === 'pending';

  return (
    <ActionRow
      label="Set Collection Yield Config"
      description="Enable a collection for staking and configure its per-block yield rate and asset."
    >
      <form className="flex flex-col gap-3" onSubmit={async (e) => {
        e.preventDefault();
        await call({
          contractName: CONTRACT_NAMES.yieldDistributor,
          functionName: 'set-collection-config',
          functionArgs: [
            stringAsciiCV(collection.trim()),
            uintCV(Number(rate)),
            uintCV(Number(assetId)),
          ],
          onSuccess: () => { toast('Collection config updated', 'success'); setCollection(''); setRate(''); setAssetId(''); reset(); },
          onError: (r) => toast(r, 'error'),
        });
      }}>
        <Field label="Collection name" value={collection} onChange={setCollection} placeholder="my-collection" required />
        <Field label="Rate per block (micro-STX)" type="number" value={rate} onChange={setRate} placeholder="100" required />
        <Field label="Yield asset ID" type="number" value={assetId} onChange={setAssetId} placeholder="1" required />
        <SubmitBtn label="Save Config" busy={busy} />
        <TxFeedback status={status} txid={txid} error={error} onDismiss={reset} />
      </form>
    </ActionRow>
  );
}

export function YieldAdmin() {
  return (
    <div className="flex flex-col gap-4">
      <FundYield />
      <SetCollectionConfig />
    </div>
  );
}
