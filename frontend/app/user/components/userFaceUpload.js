'use client';

import { useState } from 'react';
import { Button } from 'primereact/button';
import { uploadUserFace } from '@/services/userService';

export default function UserFaceUpload({ userId }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => setFiles(e.target.files);

  const handleUpload = async () => {
    if (!files.length) return alert("Pilih file terlebih dahulu!");
    setUploading(true);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await uploadUserFace(userId, formData);
      alert(`Upload berhasil: ${res.files.join(', ')}`);
      setFiles([]);
    } catch (err) {
      alert(`Upload gagal: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex align-items-center mt-2">
      <input type="file" accept="image/*" multiple onChange={handleFileChange} />
      <Button
        label={uploading ? "Uploading..." : "Upload Foto"}
        className="ml-2 p-button-primary"
        onClick={handleUpload}
        disabled={uploading || !files.length}
      />
    </div>
  );
}