"use client";

import axios from 'axios';
import React from 'react';


interface LogoutProps {
  token: string;
  setToken: (token: string) => void;
}

const Logout: React.FC<LogoutProps> = ({ token, setToken }) => {
  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:5000/disconnect', {
        headers: { 'X-Token': token },
      });
      setToken('');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;