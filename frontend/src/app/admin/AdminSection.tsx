import { TxStatusBanner } from '@/components/ui/TxStatusBanner';
import { Spinner } from '@/components/ui/Spinner';
import type { TxStatus } from '@/hooks/useContractCall';

interface ActionRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

export function ActionRow({ label, description, children }: ActionRowProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold text-zinc-200">{label}</p>
        {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
      </div>
      {children}
    </div>
  );
}

interface SubmitBtnProps {
  label: string;
  busy: boolean;
  danger?: boolean;
}

export function SubmitBtn({ label, busy, danger }: SubmitBtnProps) {
  return (
    <button
      type="submit"
      disabled={busy}
      className={`flex items-center gap-2 self-start rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 transition-colors ${
        danger
          ? 'bg-red-600 text-white hover:bg-red-500'
          : 'bg-orange-500 text-white hover:bg-orange-400'
      }`}
    >
      {busy && <Spinner size={14} />}
      {label}
    </button>
  );
}

interface TxFeedbackProps {
  status: TxStatus;
  txid: string | null;
  error: string | null;
  onDismiss: () => void;
}

export function TxFeedback({ status, txid, error, onDismiss }: TxFeedbackProps) {
  if (status === 'idle') return null;
  return (
    <div className="mt-2">
      <TxStatusBanner status={status} txid={txid} error={error} onDismiss={onDismiss} />
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

export function Field({ label, value, onChange, placeholder, type = 'text', required }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none w-full max-w-sm"
      />
    </div>
  );
}
