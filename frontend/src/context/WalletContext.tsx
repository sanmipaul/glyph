'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { AppConfig, UserSession, showConnect, disconnect as stacksDisconnect } from '@stacks/connect';

interface WalletState {
  address: string | null;
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState>({
  address: null,
  connected: false,
  connect: () => {},
  disconnect: () => {},
});

const STORAGE_KEY = 'glyph_wallet_address';

// Module-level singleton — only created once, only in the browser
// (serverExternalPackages in next.config.ts ensures this file is never evaluated on the server)
const session = new UserSession({
  appConfig: new AppConfig(['store_write', 'publish_data']),
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (session.isUserSignedIn()) {
      const data = session.loadUserData();
      const addr = data.profile?.stxAddress?.mainnet as string | undefined;
      if (addr) { setAddress(addr); return; }
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setAddress(saved);
  }, []);

  const connect = useCallback(() => {
    showConnect({
      appDetails: { name: 'Glyph', icon: '/favicon.ico' },
      userSession: session,
      onFinish: () => {
        const data = session.loadUserData();
        const addr = data.profile?.stxAddress?.mainnet as string;
        setAddress(addr);
        localStorage.setItem(STORAGE_KEY, addr);
      },
      onCancel: () => {},
    });
  }, []);

  const disconnect = useCallback(() => {
    stacksDisconnect();
    setAddress(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <WalletContext.Provider value={{ address, connected: !!address, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
