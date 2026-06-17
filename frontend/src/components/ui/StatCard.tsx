interface Props {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

export function StatCard({ label, value, sub, accent }: Props) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`text-2xl font-bold ${accent ? 'text-orange-400' : 'text-zinc-50'}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}
