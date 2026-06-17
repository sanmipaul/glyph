'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';

const LINKS = [
  { href: '/ordinals', label: 'My Ordinals' },
  { href: '/yield',    label: 'Yield' },
  { href: '/bridge',   label: 'Bridge' },
  { href: '/borrow',   label: 'Borrow' },
  { href: '/registry', label: 'Registry' },
];

export function Nav() {
  const { address, connected, connect, disconnect } = useWallet();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-bold tracking-tight text-orange-400">
            Glyph
          </Link>
          <nav className="hidden gap-6 text-sm sm:flex">
            {LINKS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`transition-colors ${
                    active
                      ? 'text-zinc-50 font-medium'
                      : 'text-zinc-400 hover:text-zinc-50'
                  }`}
                >
                  {label}
                  {active && <span className="mt-0.5 block h-0.5 rounded-full bg-orange-400" />}
                </Link>
              );
            })}
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

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="sm:hidden rounded p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="sm:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-3 flex flex-col gap-3">
          {LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm py-1 transition-colors ${
                  active ? 'text-orange-400 font-medium' : 'text-zinc-400 hover:text-zinc-50'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
