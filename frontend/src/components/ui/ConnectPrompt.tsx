'use client';

import { useWallet } from '@/context/WalletContext';
import { EmptyState } from './EmptyState';

export function ConnectPrompt() {
  const { connect } = useWallet();
  return (
    <EmptyState
      title="Connect your wallet"
      description="Connect a Stacks wallet to use this feature."
      action={
        <button
          onClick={connect}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400 transition-colors"
        >
          Connect Wallet
        </button>
      }
    />
  );
}
