"use client";

import { useState, FormEvent, useContext } from 'react';
import axios, { AxiosError } from 'axios';
import { TokenContext } from '../components/AppProvider';

export default function Login() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const { setToken } = useContext(TokenContext);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const credentials = btoa(`${email}:${password}`);
    try {
      const res = await axios.get('http://localhost:5000/connect', {
        headers: { Authorization: `Basic ${credentials}` },
      });
      setToken(res.data.token);
      setMessage('Login successful!');
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>;
      setMessage(axiosError.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}