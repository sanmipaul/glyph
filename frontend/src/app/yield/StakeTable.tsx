'use client';

import { useState } from 'react';
import { microToStx } from '@/lib/format';
import { useContractCall } from '@/hooks/useContractCall';
import { useToast } from '@/components/ui/Toast';
import { TxStatusBanner } from '@/components/ui/TxStatusBanner';
import { Spinner } from '@/components/ui/Spinner';
import { uintCV } from '@stacks/transactions';
import { CONTRACT_NAMES } from '@/lib/constants';

interface StakeEntry {
  tokenId: number;
  info: { stakedAt: number; collection: string; claimedUpToBlock: number };
  pendingYield: number | null;
}

interface Props {
  stakes: StakeEntry[];
  onAction: () => void;
}

export function StakeTable({ stakes, onAction }: Props) {
  const [acting, setActing] = useState<{ tokenId: number; action: 'unstake' | 'claim' } | null>(null);
  const { call, status, txid, error, reset } = useContractCall();
  const { toast } = useToast();

  const handle = async (tokenId: number, action: 'unstake' | 'claim') => {
    setActing({ tokenId, action });
    await call({
      contractName: CONTRACT_NAMES.yieldDistributor,
      functionName: action === 'unstake' ? 'unstake' : 'claim-yield',
      functionArgs: [uintCV(tokenId)],
      onSuccess: () => {
        toast(action === 'unstake' ? 'Unstaked successfully' : 'Yield claimed', 'success');
        onAction();
      },
      onError: (r) => toast(r, 'error'),
    });
    setActing(null);
  };

  const busy = status === 'signing' || status === 'pending';

  return (
    <div className="flex flex-col gap-3">
      <TxStatusBanner status={status} txid={txid} error={error} onDismiss={reset} />
      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Token</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Collection</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Staked at</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">Pending yield</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {stakes.map(({ tokenId, info, pendingYield }) => {
              const isThis = acting?.tokenId === tokenId;
              return (
                <tr key={tokenId} className="bg-zinc-900 hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-zinc-300">#{tokenId}</td>
                  <td className="px-4 py-3 text-orange-400">{info.collection}</td>
                  <td className="px-4 py-3 text-zinc-400">Block {info.stakedAt.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-zinc-200">
                    {pendingYield != null ? `${microToStx(pendingYield)} STX` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        disabled={busy}
                        onClick={() => handle(tokenId, 'claim')}
                        className="flex items-center gap-1 rounded bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                      >
                        {isThis && acting?.action === 'claim' && busy && <Spinner size={12} />}
                        Claim
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => handle(tokenId, 'unstake')}
                        className="flex items-center gap-1 rounded bg-red-900/40 px-2.5 py-1 text-xs text-red-400 hover:bg-red-900/60 disabled:opacity-50 transition-colors"
                      >
                        {isThis && acting?.action === 'unstake' && busy && <Spinner size={12} />}
                        Unstake
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
