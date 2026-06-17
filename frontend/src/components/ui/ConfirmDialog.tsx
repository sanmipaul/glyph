'use client';

import { Modal } from './Modal';
import { Spinner } from './Spinner';

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open, title, description, confirmLabel = 'Confirm',
  danger, loading, onConfirm, onCancel,
}: Props) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="mb-6 text-sm text-zinc-400">{description}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
            danger
              ? 'bg-red-600 text-white hover:bg-red-500'
              : 'bg-orange-500 text-white hover:bg-orange-400'
          }`}
        >
          {loading && <Spinner size={14} />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
