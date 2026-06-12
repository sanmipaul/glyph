'use client';

import Link from 'next/link';

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-orange-400">
          Glyph
        </Link>
      </div>
    </header>
  );
}
