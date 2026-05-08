'use client';

import { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { updateProfile } from '@/services/profileService';

const ProfileForm = ({ profile, onUpdate, toastRef }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: profile.nama || '',
    email: profile.email || '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nama.trim()) newErrors.nama = 'Nama wajib diisi';
    if (!formData.email.trim()) newErrors.email = 'Email wajib diisi';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData = {
        nama: formData.nama,
        email: formData.email,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }

      const updatedProfile = await updateProfile(updateData);
      onUpdate(updatedProfile);
      setIsEditing(false);
      setFormData((prev) => ({
        ...prev,
        password: '',
      }));
    } catch (err) {
      toastRef.current?.showToast('01', err.message || 'Gagal update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nama: profile.nama || '',
      email: profile.email || '',
      password: '',
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Display Mode */}
        {!isEditing ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Kode</label>
              <div className="p-3 bg-gray-100 rounded-md border border-gray-300">
                {profile.kode}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Role</label>
              <div className="p-3 bg-gray-100 rounded-md border border-gray-300">
                {profile.role === 'kepala_lab'
                  ? 'Kepala Lab'
                  : profile.role === 'teknisi'
                  ? 'Teknisi'
                  : profile.role === 'dosen'
                  ? 'Dosen'
                  : profile.role === 'sarpras'
                  ? 'Sarana Prasarana'
                  : profile.role}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Nama</label>
              <div className="p-3 bg-gray-100 rounded-md border border-gray-300">
                {profile.nama}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
              <div className="p-3 bg-gray-100 rounded-md border border-gray-300">
                {profile.email}
              </div>
            </div>
            {profile.nip && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">NIP</label>
                <div className="p-3 bg-gray-100 rounded-md border border-gray-300">
                  {profile.nip}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Status</label>
              <div className="p-3 bg-gray-100 rounded-md border border-gray-300">
                {profile.status === 'aktif' ? (
                  <span className="text-green-600 font-medium">Aktif</span>
                ) : (
                  <span className="text-red-600 font-medium">Nonaktif</span>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Kode</label>
              <div className="p-3 bg-gray-100 rounded-md border border-gray-300">
                {profile.kode}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Role</label>
              <div className="p-3 bg-gray-100 rounded-md border border-gray-300">
                {profile.role === 'kepala_lab'
                  ? 'Kepala Lab'
                  : profile.role === 'teknisi'
                  ? 'Teknisi'
                  : profile.role === 'dosen'
                  ? 'Dosen'
                  : profile.role === 'sarpras'
                  ? 'Sarana Prasarana'
                  : profile.role}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Nama <span className="text-red-500">*</span>
              </label>
              <InputText
                value={formData.nama}
                onChange={(e) => handleInputChange('nama', e.target.value)}
                className={`w-full ${errors.nama ? 'p-invalid' : ''}`}
                placeholder="Masukkan nama"
              />
              {errors.nama && <small className="text-red-500">{errors.nama}</small>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <InputText
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full ${errors.email ? 'p-invalid' : ''}`}
                placeholder="Masukkan email"
              />
              {errors.email && <small className="text-red-500">{errors.email}</small>}
            </div>
            {profile.nip && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">NIP</label>
                <div className="p-3 bg-gray-100 rounded-md border border-gray-300">
                  {profile.nip}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Password Baru <span className="text-gray-500 text-xs">(opsional)</span>
              </label>
              <Password
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Biarkan kosong jika tidak ingin mengubah"
                toggleMask
                className="w-full"
                inputClassName="w-full"
              />
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        {!isEditing ? (
          <Button
            label="Edit Profile"
            icon="pi pi-pencil"
            onClick={() => setIsEditing(true)}
            severity="warning"
          />
        ) : (
          <>
            <Button
              label="Batal"
              icon="pi pi-times"
              onClick={handleCancel}
              severity="secondary"
              outlined
            />
            <Button
              label="Simpan"
              icon="pi pi-check"
              onClick={handleSubmit}
              loading={loading}
              disabled={loading}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileForm;