'use client';

import { useCollectionConfig } from '@/hooks/useCollectionConfig';
import { bpsToPercent, microToStx } from '@/lib/format';
import { SkeletonRow } from '@/components/ui/Skeleton';

interface Props {
  collections: string[];
}

export function CollectionBreakdown({ collections }: Props) {
  const { configs, loading } = useCollectionConfig(collections);

  return (
    <section>
      <h2 className="mb-4 text-base font-semibold text-zinc-300">Collection Yield Rates</h2>
      {loading ? (
        <div className="flex flex-col gap-2">
          {collections.map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Collection</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">Rate / block</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">Total staked</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">Max LTV</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {configs.map(({ name, yield: y, ltv }) => (
                <tr key={name} className="bg-zinc-900">
                  <td className="px-4 py-3 font-medium text-orange-400">{name}</td>
                  <td className="px-4 py-3 text-right text-zinc-300">
                    {y ? `${microToStx(y.ratePerBlock)} STX` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-300">
                    {y ? y.totalStaked.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-300">
                    {ltv != null ? bpsToPercent(ltv) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {y ? (
                      y.active
                        ? <span className="text-green-400">Active</span>
                        : <span className="text-zinc-500">Paused</span>
                    ) : <span className="text-zinc-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
