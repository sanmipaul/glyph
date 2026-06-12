import { Nav } from '@/components/Nav';

export default function Home() {
  return (
    <>
      <Nav />
      <main className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-6 px-4 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          Bitcoin Ordinals,{' '}
          <span className="text-orange-400">on Stacks</span>
        </h1>
        <p className="max-w-xl text-lg text-zinc-400">
          Wrap your inscriptions as SIP-009 NFTs. Stake for yield, use as collateral,
          or bridge back to Bitcoin — all through a trustless multi-sig vault.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <a href="/ordinals" className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-400 transition-colors">
            View My Ordinals
          </a>
          <a href="/yield" className="rounded-lg border border-zinc-700 px-6 py-3 font-semibold text-zinc-200 hover:border-zinc-500 transition-colors">
            Earn Yield
          </a>
        </div>
      </main>
    </>
  );
}
