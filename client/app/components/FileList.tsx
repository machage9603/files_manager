"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

interface File {
  _id: string;
  name: string;
  type: string;
  isPublic: boolean;
}

interface FileListProps {
  token: string;
}

const FileList: React.FC<FileListProps> = ({ token }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get('http://localhost:5000/files', {
          headers: { 'X-Token': token },
        });
        setFiles(res.data);
      } catch {
        setError('Failed to load files. Please log in.');
      }
    };
    if (token) fetchFiles();
  }, [token]);

  const togglePublish = async (fileId: string, isPublic: boolean) => {
    try {
      const endpoint = isPublic
        ? `/files/${fileId}/unpublish`
        : `/files/${fileId}/publish`;
      await axios.put(`http://localhost:5000${endpoint}`, {}, {
        headers: { 'X-Token': token },
      });
      setFiles(files.map((file) =>
        file._id === fileId ? { ...file, isPublic: !isPublic } : file
      ));
    } catch {
      setError('Failed to update file status');
    }
  };

  if (!token) return <p>Please log in to view your files.</p>;

  return (
    <div>
      <h2>Your Files</h2>
      {error && <p>{error}</p>}
      <ul>
        {files.map((file) => (
          <li key={file._id}>
            {file.name} ({file.type}) - {file.isPublic ? 'Public' : 'Private'}
            {file.type !== 'folder' && (
              <button onClick={() => togglePublish(file._id, file.isPublic)}>
                {file.isPublic ? 'Unpublish' : 'Publish'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;