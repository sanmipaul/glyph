interface Props {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 px-6 py-16 text-center">
      <p className="text-base font-semibold text-zinc-300">{title}</p>
      <p className="max-w-xs text-sm text-zinc-500">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
