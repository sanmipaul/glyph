'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { getShowConnect, getDisconnect, getSession } from '@/lib/stacks-connect';

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
  const sessionRef = useRef<Awaited<ReturnType<typeof getSession>> | null>(null);

  const ensureSession = useCallback(async () => {
    if (!sessionRef.current) sessionRef.current = await getSession();
    return sessionRef.current;
  }, []);

  useEffect(() => {
    ensureSession().then((sess) => {
      if (sess.isUserSignedIn()) {
        const addr = sess.loadUserData()?.profile?.stxAddress?.mainnet as string | undefined;
        if (addr) { setAddress(addr); return; }
      }
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setAddress(saved);
    });
  }, [ensureSession]);

  const connect = useCallback(async () => {
    const [showConnect, sess] = await Promise.all([getShowConnect(), ensureSession()]);
    showConnect({
      appDetails: { name: 'Glyph', icon: '/favicon.ico' },
      userSession: sess,
      onFinish: () => {
        const addr = sess.loadUserData()?.profile?.stxAddress?.mainnet as string;
        setAddress(addr);
        localStorage.setItem(STORAGE_KEY, addr);
      },
      onCancel: () => {},
    });
  }, [ensureSession]);

  const disconnect = useCallback(async () => {
    const stacksDisconnect = await getDisconnect();
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
