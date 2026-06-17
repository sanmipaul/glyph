'use client';

import type { TxStatus } from '@/hooks/useContractCall';
import { Spinner } from './Spinner';

interface Props {
  status: TxStatus;
  txid: string | null;
  error: string | null;
  onDismiss: () => void;
}

const EXPLORER = 'https://explorer.hiro.so/txid/';

export function TxStatusBanner({ status, txid, error, onDismiss }: Props) {
  if (status === 'idle') return null;

  const base = 'rounded-lg px-4 py-3 text-sm flex items-center justify-between gap-4';

  if (status === 'signing') {
    return (
      <div className={`${base} bg-zinc-800 text-zinc-300`}>
        <div className="flex items-center gap-2"><Spinner size={16} /><span>Waiting for wallet signature…</span></div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className={`${base} bg-zinc-800 text-zinc-300`}>
        <div className="flex items-center gap-2">
          <Spinner size={16} />
          <span>Transaction pending…</span>
          {txid && (
            <a href={`${EXPLORER}${txid}`} target="_blank" rel="noopener noreferrer"
              className="underline text-orange-400">View</a>
          )}
        </div>
        <button onClick={onDismiss} className="text-zinc-500 hover:text-zinc-300">✕</button>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className={`${base} bg-green-900/40 text-green-400`}>
        <div className="flex items-center gap-2">
          <span>✓ Transaction confirmed</span>
          {txid && (
            <a href={`${EXPLORER}${txid}`} target="_blank" rel="noopener noreferrer"
              className="underline">View</a>
          )}
        </div>
        <button onClick={onDismiss} className="text-green-600 hover:text-green-300">✕</button>
      </div>
    );
  }

  return (
    <div className={`${base} bg-red-900/40 text-red-400`}>
      <span>Transaction failed: {error}</span>
      <button onClick={onDismiss} className="text-red-600 hover:text-red-300">✕</button>
    </div>
  );
}
