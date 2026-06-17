'use client';

import { useState } from 'react';
import { OrdinalCard } from '@/components/ui/OrdinalCard';
import { ApproveForm } from './ApproveForm';

interface OrdinalEntry {
  tokenId: number;
  inscriptionId: string;
  data: { collection: string; contentType: string; verified: boolean } | null;
}

interface Props {
  ordinals: OrdinalEntry[];
  onAction: () => void;
}

export function OrdinalGrid({ ordinals, onAction }: Props) {
  const [approving, setApproving] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ordinals.map(({ tokenId, inscriptionId, data }) => (
          <OrdinalCard
            key={tokenId}
            tokenId={tokenId}
            inscriptionId={inscriptionId}
            collection={data?.collection ?? 'Unknown'}
            contentType={data?.contentType ?? '—'}
            verified={data?.verified ?? false}
            actions={
              <button
                onClick={() => setApproving(tokenId)}
                className="rounded bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                Approve
              </button>
            }
          />
        ))}
      </div>
      {approving !== null && (
        <ApproveForm
          tokenId={approving}
          onClose={() => setApproving(null)}
          onSuccess={() => { setApproving(null); onAction(); }}
        />
      )}
    </>
  );
}
