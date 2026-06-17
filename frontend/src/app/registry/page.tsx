'use client';

import { Nav } from '@/components/Nav';
import { PageHeader } from '@/components/ui/PageHeader';
import { useRegistry } from '@/hooks/useRegistry';
import { SearchForm } from './SearchForm';
import { OrdinalDetail } from './OrdinalDetail';
import { VerifierControls } from './VerifierControls';
import { useWallet } from '@/context/WalletContext';
import { useState, useEffect } from 'react';
import { isVerifier } from '@/lib/stacks';

export default function RegistryPage() {
  const { result, loading, error, notFound, search, searchByTokenId } = useRegistry();
  const { address } = useWallet();
  const [verifier, setVerifier] = useState(false);

  useEffect(() => {
    if (!address) return;
    isVerifier(address).then(setVerifier);
  }, [address]);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-10 flex flex-col gap-8">
        <PageHeader
          title="Registry"
          description="Verify and look up Bitcoin Ordinal inscriptions registered on Glyph."
        />

        <SearchForm onSearch={search} onSearchById={searchByTokenId} loading={loading} />

        {error && (
          <div className="rounded-lg bg-red-900/30 px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        {notFound && !loading && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-8 text-center">
            <p className="text-sm text-zinc-400">No inscription found for that ID.</p>
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-4">
            <OrdinalDetail ordinal={result} />
            {verifier && <VerifierControls inscriptionId={result.inscriptionId} verified={result.verified} />}
          </div>
        )}
      </main>
    </>
  );
}
