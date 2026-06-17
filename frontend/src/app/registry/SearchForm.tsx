'use client';

import { useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';

interface Props {
  onSearch: (id: string) => void;
  onSearchById: (tokenId: number) => void;
  loading: boolean;
}

export function SearchForm({ onSearch, onSearchById, loading }: Props) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'inscription' | 'token'>('inscription');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (mode === 'inscription') {
      onSearch(query.trim());
    } else {
      onSearchById(Number(query.trim()));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {(['inscription', 'token'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === m ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {m === 'inscription' ? 'By Inscription ID' : 'By Token ID'}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={mode === 'inscription' ? 'Enter inscription ID…' : 'Enter token ID…'}
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-50 transition-colors"
        >
          {loading ? <Spinner size={14} /> : 'Search'}
        </button>
      </form>
    </div>
  );
}
