'use client';

import { useEffect, useState } from 'react';
import { Nav } from '@/components/Nav';
import { PageHeader } from '@/components/ui/PageHeader';
import { useWallet } from '@/context/WalletContext';
import { DEPLOYER } from '@/lib/constants';
import { RegistryAdmin } from './RegistryAdmin';
import { BridgeAdmin } from './BridgeAdmin';
import { CollateralAdmin } from './CollateralAdmin';
import { YieldAdmin } from './YieldAdmin';
import { NftAdmin } from './NftAdmin';

const SECTIONS = ['Registry', 'Bridge', 'Collateral', 'Yield', 'NFT'] as const;
type Section = typeof SECTIONS[number];

export default function AdminPage() {
  const { address, connected, connect } = useWallet();
  const [active, setActive] = useState<Section>('Registry');
  const isDeployer = connected && address === DEPLOYER;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-10 flex flex-col gap-8">
        <PageHeader
          title="Admin"
          description="Owner-only controls for managing contracts, signers, appraisers, and yield configuration."
        />

        {!connected ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center flex flex-col items-center gap-3">
            <p className="text-sm text-zinc-400">Connect the deployer wallet to access admin controls.</p>
            <button onClick={connect} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400 transition-colors">
              Connect Wallet
            </button>
          </div>
        ) : !isDeployer ? (
          <div className="rounded-xl border border-red-800/40 bg-red-900/20 p-6 text-sm text-red-400">
            Access denied. This page is restricted to the contract deployer ({DEPLOYER?.slice(0, 12)}…).
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Section tabs */}
            <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
              {SECTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setActive(s)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                    active === s
                      ? 'bg-orange-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {active === 'Registry'   && <RegistryAdmin />}
            {active === 'Bridge'     && <BridgeAdmin />}
            {active === 'Collateral' && <CollateralAdmin />}
            {active === 'Yield'      && <YieldAdmin />}
            {active === 'NFT'        && <NftAdmin />}
          </div>
        )}
      </main>
    </>
  );
}
