'use client';

import { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { updateProfile } from '@/services/profileService';

const roleLabels = {
  kepala_lab: 'Kepala Lab',
  teknisi: 'Teknisi',
  dosen: 'Dosen',
  sarpras: 'Sarana Prasarana',
};

const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

const ProfileForm = ({ profile, onUpdate, toastRef }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: profile.nama || '',
    nip: profile.nip || '',
    email: profile.email || '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nama.trim()) newErrors.nama = 'Nama wajib diisi';

    if (!formData.nip.trim()) newErrors.nip = 'NIP wajib diisi';
    if (!formData.email.trim()) newErrors.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Format email tidak valid';

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
        password: formData.password || undefined,
      };

      updateData.nip = formData.nip;
      updateData.email = formData.email;

      const updatedProfile = await updateProfile(updateData);
      onUpdate(updatedProfile);
      setIsEditing(false);
      setFormData((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      toastRef.current?.showToast('01', err.message || 'Gagal update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nama: profile.nama || '',
      nip: profile.nip || '',
      email: profile.email || '',
      password: '',
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className={"profile-wrapper profile-role-" + (profile.role || "default")}>
        <div className="profile-card">

          {/* LEFT: Avatar + identity */}
          <div className="profile-left">
            <div className="avatar-ring">
              <div className="avatar-circle">
                {getInitials(isEditing ? formData.nama : profile.nama)}
              </div>
            </div>
            <div className="profile-name-block">
              <p className="profile-name">{isEditing ? formData.nama || '—' : profile.nama}</p>
              <div className="role-badge-row">
                <span className="role-badge">
                  <i className="pi pi-id-card profile-role-icon" />
                  {roleLabels[profile.role] || profile.role}
                </span>
              </div>
            </div>
            <span className="kode-chip">{profile.kode}</span>
          </div>

          {/* DIVIDER */}
          <div className="profile-divider" />

          {/* RIGHT: Info / Edit */}
          <div className="profile-right">
            {!isEditing ? (
              <>
                <p className="section-title">Informasi Akun</p>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Nama</span>
                    <span className="info-value">{profile.nama}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{profile.email || '—'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">NIP</span>
                    <span className="info-value">{profile.nip || '—'}</span>
                  </div>
                </div>

                <div className="action-row">
                  <Button
                    label="Edit Profile"
                    icon="pi pi-pencil"
                    onClick={() => setIsEditing(true)}
                    severity="warning"
                    size="small"
                  />
                </div>
              </>
            ) : (
              <>
                <p className="edit-section-title">Data Tidak Bisa Diubah</p>
                <div className="edit-grid edit-grid-readonly">
                  <div className="edit-field">
                    <span className="edit-label">Kode</span>
                    <div className="readonly-field">{profile.kode}</div>
                  </div>
                  <div className="edit-field">
                    <span className="edit-label">Role</span>
                    <div className="readonly-field">{roleLabels[profile.role] || profile.role}</div>
                  </div>
                  
                </div>

                <p className="edit-section-title">Data Bisa Diubah</p>
                <div className="edit-grid">
                  <div className="edit-field">
                    <label className="edit-label">Nama <span>*</span></label>
                    <InputText
                      value={formData.nama}
                      onChange={(e) => handleInputChange('nama', e.target.value)}
                      className={`w-full${errors.nama ? ' p-invalid' : ''}`}
                      placeholder="Masukkan nama"
                    />
                    {errors.nama && <small className="p-error">{errors.nama}</small>}
                  </div>

                  <div className="edit-field">
                    <label className="edit-label">NIP <span>*</span></label>
                    <InputText
                      value={formData.nip}
                      onChange={(e) => handleInputChange('nip', e.target.value)}
                      className={`w-full${errors.nip ? ' p-invalid' : ''}`}
                      placeholder="Masukkan NIP"
                    />
                    {errors.nip && <small className="p-error">{errors.nip}</small>}
                  </div>
                  <div className="edit-field">
                    <label className="edit-label">Email <span>*</span></label>
                    <InputText
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full${errors.email ? ' p-invalid' : ''}`}
                      placeholder="Masukkan email"
                    />
                    {errors.email && <small className="p-error">{errors.email}</small>}
                  </div>
                </div>

                <div className="action-row">
                  <Button
                    label="Batal"
                    icon="pi pi-times"
                    onClick={handleCancel}
                    severity="secondary"
                    outlined
                    size="small"
                  />
                  <Button
                    label="Simpan"
                    icon="pi pi-check"
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={loading}
                    size="small"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
  );
};

export default ProfileForm;
