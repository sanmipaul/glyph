'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { TxStatusBanner } from '@/components/ui/TxStatusBanner';
import { Spinner } from '@/components/ui/Spinner';
import { useContractCall } from '@/hooks/useContractCall';
import { useToast } from '@/components/ui/Toast';
import { stringAsciiCV, uintCV } from '@stacks/transactions';
import { CONTRACT_NAMES } from '@/lib/constants';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function WrapForm({ open, onClose, onSuccess }: Props) {
  const [inscriptionId, setInscriptionId] = useState('');
  const [collection, setCollection] = useState('');
  const [contentType, setContentType] = useState('');
  const [satNumber, setSatNumber] = useState('');
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await call({
      contractName: CONTRACT_NAMES.ordinalRegistry,
      functionName: 'register-ordinal',
      functionArgs: [
        stringAsciiCV(inscriptionId.trim()),
        stringAsciiCV(collection.trim()),
        stringAsciiCV(contentType.trim()),
        uintCV(BigInt(satNumber.trim())),
      ],
      onSuccess: () => {
        toast('Ordinal registered successfully', 'success');
        onSuccess();
      },
      onError: (reason) => toast(reason, 'error'),
    });
  };

  const handleClose = () => { reset(); onClose(); };

  const busy = status === 'signing' || status === 'pending';

  return (
    <Modal open={open} title="Wrap Inscription" onClose={handleClose}>
      <div className="mb-4">
        <TxStatusBanner status={status} txid={txid} error={error} onDismiss={reset} />
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Inscription ID" value={inscriptionId} onChange={setInscriptionId}
          placeholder="abc123def456...i0" required />
        <Field label="Collection" value={collection} onChange={setCollection}
          placeholder="bitcoin-puppets" required />
        <Field label="Content Type" value={contentType} onChange={setContentType}
          placeholder="image/png" required />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-400">Sat Number</label>
          <input
            type="number"
            min="0"
            value={satNumber}
            onChange={(e) => setSatNumber(e.target.value)}
            placeholder="1234567890"
            required
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
          />
          <p className="text-xs text-zinc-600">The ordinal number of the satoshi carrying this inscription.</p>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-50 transition-colors"
        >
          {busy && <Spinner size={14} />}
          Register Ordinal
        </button>
      </form>
    </Modal>
  );
}

function Field({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
      />
    </div>
  );
}
