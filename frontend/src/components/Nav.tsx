'use client';

import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';

export function Nav() {
  const { address, connected, connect, disconnect } = useWallet();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-bold tracking-tight text-orange-400">
            Glyph
          </Link>
          <nav className="hidden gap-6 text-sm text-zinc-400 sm:flex">
            <Link href="/ordinals" className="hover:text-zinc-50 transition-colors">My Ordinals</Link>
            <Link href="/yield"    className="hover:text-zinc-50 transition-colors">Yield</Link>
            <Link href="/bridge"   className="hover:text-zinc-50 transition-colors">Bridge</Link>
            <Link href="/borrow"   className="hover:text-zinc-50 transition-colors">Borrow</Link>
            <Link href="/registry" className="hover:text-zinc-50 transition-colors">Registry</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-green-900/40 px-2 py-0.5 text-xs font-medium text-green-400">
            Mainnet
          </span>
          {connected ? (
            <div className="flex items-center gap-2">
              <span className="hidden rounded bg-zinc-800 px-2 py-1 font-mono text-xs text-zinc-300 sm:block">
                {address!.slice(0, 8)}…{address!.slice(-4)}
              </span>
              <button
                onClick={disconnect}
                className="rounded bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              className="rounded bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-400 transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
