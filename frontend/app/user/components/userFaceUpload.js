'use client';

import { useState } from 'react';
import { Button } from 'primereact/button';
import { uploadUserFace } from '@/services/userService';

export default function UserFaceUpload({ userId }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("Pilih file terlebih dahulu!");
    setUploading(true);
    try {
      const res = await uploadUserFace(userId, file);
      alert(`Upload berhasil: ${res.message}`);
      setFile(null);
    } catch (err) {
      alert(`Upload gagal: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex align-items-center mt-2">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <Button
        label={uploading ? "Uploading..." : "Upload Foto"}
        className="ml-2 p-button-primary"
        onClick={handleUpload}
        disabled={uploading || !file}
      />
    </div>
  );
}