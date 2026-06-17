'use client';

import { truncateAddress } from '@/lib/format';
import { ApprovalPanel } from './ApprovalPanel';
import type { PendingWithdrawal } from '@/types';

interface WithdrawalEntry {
  id: number;
  withdrawal: PendingWithdrawal;
}

interface Props {
  withdrawals: WithdrawalEntry[];
  requiredSigs: number;
  address: string;
  onAction: () => void;
}

function StatusBadge({ w, required }: { w: PendingWithdrawal; required: number }) {
  if (w.cancelled) return <span className="rounded bg-zinc-700 px-2 py-0.5 text-xs text-zinc-400">Cancelled</span>;
  if (w.executed) return <span className="rounded bg-green-900/40 px-2 py-0.5 text-xs text-green-400">Executed</span>;
  if (w.approvals >= required) return <span className="rounded bg-orange-900/40 px-2 py-0.5 text-xs text-orange-400">Ready</span>;
  return <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{w.approvals}/{required} sigs</span>;
}

export function WithdrawalList({ withdrawals, requiredSigs, address, onAction }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {withdrawals.map(({ id, withdrawal: w }) => (
        <div key={id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Withdrawal #{id}</p>
              <p className="font-mono text-sm text-zinc-300">Token #{w.tokenId}</p>
            </div>
            <StatusBadge w={w} required={requiredSigs} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-zinc-500 mb-0.5">Inscription</p>
              <p className="font-mono text-zinc-300">{truncateAddress(w.inscriptionId, 10)}</p>
            </div>
            <div>
              <p className="text-zinc-500 mb-0.5">BTC address</p>
              <p className="font-mono text-zinc-300">{truncateAddress(w.btcAddress, 10)}</p>
            </div>
            <div>
              <p className="text-zinc-500 mb-0.5">Created at block</p>
              <p className="text-zinc-300">{w.createdAt.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-zinc-500 mb-0.5">Approvals</p>
              <p className="text-zinc-300">{w.approvals} / {requiredSigs}</p>
            </div>
          </div>
          {!w.executed && !w.cancelled && (
            <ApprovalPanel withdrawalId={id} onAction={onAction} />
          )}
        </div>
      ))}
    </div>
  );
}
