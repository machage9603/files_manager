"use client";

import { useContext } from 'react';
import FileList from './components/FileList';
import { TokenContext } from './components/AppProvider';

export default function Home() {
  const { token } = useContext(TokenContext);

  return (
    <div>
      <h1>Files Manager</h1>
      <FileList token={token} />
    </div>
  );
}