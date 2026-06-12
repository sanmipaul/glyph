'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';

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

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  // Lazily instantiate @stacks/connect on the client only — avoids SSR crashes
  const sessionRef = useRef<import('@stacks/connect').UserSession | null>(null);

  const getSession = useCallback(async () => {
    if (sessionRef.current) return sessionRef.current;
    const { AppConfig, UserSession } = await import('@stacks/connect');
    const cfg = new AppConfig(['store_write', 'publish_data']);
    const sess = new UserSession({ appConfig: cfg });
    sessionRef.current = sess;
    return sess;
  }, []);

  useEffect(() => {
    getSession().then((sess) => {
      if (sess.isUserSignedIn()) {
        const data = sess.loadUserData();
        const addr = data.profile?.stxAddress?.mainnet as string | undefined;
        if (addr) { setAddress(addr); return; }
      }
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setAddress(saved);
    });
  }, [getSession]);

  const connect = useCallback(async () => {
    const { showConnect } = await import('@stacks/connect');
    const sess = await getSession();
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
  }, [getSession]);

  const disconnect = useCallback(async () => {
    const { disconnect: stacksDisconnect } = await import('@stacks/connect');
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
