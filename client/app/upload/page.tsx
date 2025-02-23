"use client";

import { useState, FormEvent, ChangeEvent, useContext } from 'react';
import axios, { AxiosError } from 'axios';
import { TokenContext } from '../components/AppProvider';

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<string>('file');
  const [message, setMessage] = useState<string>('');
  const { token } = useContext(TokenContext);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage('Please log in to upload files.');
      return;
    }
    if (!name) {
      setMessage('File name is required.');
      return;
    }
    if (type !== 'folder' && !file) {
      setMessage('Please select a file.');
      return;
    }

    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const data = reader.result?.toString().split(',')[1];
        try {
          await axios.post(
            'http://localhost:5000/files',
            { name, type, data },
            { headers: { 'X-Token': token } }
          );
          setMessage('File uploaded successfully!');
          setFile(null);
          setName('');
          setType('file');
        } catch (err) {
          const axiosError = err as AxiosError<{ error: string }>;
          setMessage(axiosError.response?.data?.error || 'Upload failed');
        }
      };
    } else {
      try {
        await axios.post(
          'http://localhost:5000/files',
          { name, type },
          { headers: { 'X-Token': token } }
        );
        setMessage('Folder created successfully!');
        setName('');
      } catch (err) {
        const axiosError = err as AxiosError<{ error: string }>;
        setMessage(axiosError.response?.data?.error || 'Folder creation failed');
      }
    }
  };

  return (
    <div>
      <h2>Upload File</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="File Name"
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="file">File</option>
          <option value="image">Image</option>
          <option value="folder">Folder</option>
        </select>
        {type !== 'folder' && (
          <input
            type="file"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFile(e.target.files?.[0] || null)
            }
          />
        )}
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}