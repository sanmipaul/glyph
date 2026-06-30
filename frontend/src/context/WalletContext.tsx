'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
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

let sharedSession: UserSession | null = null;

function getSession(): UserSession {
  if (sharedSession) return sharedSession;
  const cfg = new AppConfig(['store_write', 'publish_data']);
  sharedSession = new UserSession({ appConfig: cfg });
  return sharedSession;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const sess = getSession();
    if (sess.isUserSignedIn()) {
      const data = sess.loadUserData();
      const addr = data.profile?.stxAddress?.mainnet as string | undefined;
      if (addr) { setAddress(addr); return; }
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setAddress(saved);
  }, []);

  const connect = useCallback(() => {
    const sess = getSession();
    showConnect({
      appDetails: { name: 'Glyph', icon: '/favicon.ico' },
      userSession: sess,
      onFinish: () => {
        const data = sess.loadUserData();
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
