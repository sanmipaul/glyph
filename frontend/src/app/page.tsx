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

        <div className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { title: 'Wrap', desc: 'Register a Bitcoin Ordinal inscription and receive a SIP-009 NFT on Stacks.' },
            { title: 'Stake', desc: 'Stake wrapped Ordinals from eligible collections to earn per-block yield.' },
            { title: 'Borrow', desc: 'Collateralize your Ordinals and borrow against their appraised value.' },
          ].map(({ title, desc }) => (
            <div key={title} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-left">
              <p className="mb-2 text-sm font-semibold text-orange-400">{title}</p>
              <p className="text-sm text-zinc-400">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
