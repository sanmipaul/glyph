import { truncateAddress } from '@/lib/format';

interface Props {
  tokenId: number;
  inscriptionId: string;
  collection: string;
  contentType: string;
  verified: boolean;
  actions?: React.ReactNode;
}

export function OrdinalCard({ tokenId, inscriptionId, collection, contentType, verified, actions }: Props) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-400">
            #{tokenId}
          </span>
          {verified && (
            <span className="ml-2 rounded bg-green-900/40 px-2 py-0.5 text-xs text-green-400">
              ✓ Verified
            </span>
          )}
        </div>
        <span className="text-xs text-zinc-500">{contentType}</span>
      </div>

      <div>
        <p className="text-xs text-zinc-500 mb-0.5">Inscription</p>
        <p className="font-mono text-xs text-zinc-300 break-all">{truncateAddress(inscriptionId, 12)}</p>
      </div>

      <div>
        <p className="text-xs text-zinc-500 mb-0.5">Collection</p>
        <p className="text-sm font-medium text-orange-400">{collection}</p>
      </div>

      {actions && <div className="flex flex-wrap gap-2 pt-1 border-t border-zinc-800">{actions}</div>}
    </div>
  );
}
