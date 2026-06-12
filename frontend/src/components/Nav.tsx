'use client';

import Link from 'next/link';

export function Nav() {
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
      </div>
    </header>
  );
}
