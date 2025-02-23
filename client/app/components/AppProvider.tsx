"use client";

import { useState, createContext, ReactNode } from 'react';
import Link from 'next/link';
import Logout from './Logout';

export const TokenContext = createContext<{
  token: string;
  setToken: (token: string) => void;
}>({
  token: '',
  setToken: () => {},
});

interface AppProviderProps {
  children: ReactNode;
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string>('');

  return (
    <TokenContext.Provider value={{ token, setToken }}>
      <nav>
        <Link href="/">Home</Link> |{' '}
        <Link href="/login">Login</Link> |{' '}
        <Link href="/register">Register</Link> |{' '}
        <Link href="/upload">Upload</Link> |{' '}
        {token && <Logout token={token} setToken={setToken} />}
      </nav>
      <main>{children}</main>
    </TokenContext.Provider>
  );
};

export default AppProvider;