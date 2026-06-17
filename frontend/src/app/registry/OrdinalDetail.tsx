import type { OrdinalData } from '@/types';
import { blocksToDays } from '@/lib/format';

interface Props {
  ordinal: OrdinalData;
}

export function OrdinalDetail({ ordinal }: Props) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-100">Inscription Details</h2>
        {ordinal.verified ? (
          <span className="rounded bg-green-900/40 px-2.5 py-0.5 text-xs font-medium text-green-400">✓ Verified</span>
        ) : (
          <span className="rounded bg-zinc-700 px-2.5 py-0.5 text-xs font-medium text-zinc-400">Unverified</span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Row label="Inscription ID" value={ordinal.inscriptionId} mono />
        <Row label="Collection" value={ordinal.collection || '—'} accent />
        <Row label="Content Type" value={ordinal.contentType || '—'} />
        <Row label="Bitcoin Address" value={ordinal.btcAddress} mono />
        <Row label="Registered at block" value={ordinal.registeredAt.toLocaleString()} />
        <Row label="Approx. time registered" value={blocksToDays(ordinal.registeredAt)} />
      </div>
    </div>
  );
}

function Row({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
      <p className={`text-sm break-all ${mono ? 'font-mono text-zinc-300' : accent ? 'text-orange-400 font-medium' : 'text-zinc-200'}`}>
        {value}
      </p>
    </div>
  );
}
