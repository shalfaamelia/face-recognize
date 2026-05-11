'use client';

import { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { updateProfile } from '@/services/profileService';

const statusOptions = [
  { label: 'Aktif', value: 'aktif' },
  { label: 'Nonaktif', value: 'nonaktif' },
];

const roleLabels = {
  kepala_lab: 'Kepala Lab',
  teknisi: 'Teknisi',
  dosen: 'Dosen',
  sarpras: 'Sarana Prasarana',
  mahasiswa: 'Mahasiswa',
};

const roleColors = {
  kepala_lab: '#2563eb',
  teknisi: '#7c3aed',
  dosen: '#0891b2',
  sarpras: '#d97706',
  mahasiswa: '#16a34a',
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
    status: profile.status || 'aktif',
  });
  const [errors, setErrors] = useState({});

  const accentColor = roleColors[profile.role] || '#2563eb';

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nama.trim()) newErrors.nama = 'Nama wajib diisi';
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
      const updateData = { nama: formData.nama, nip: formData.nip, email: formData.email, status: formData.status };
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
    setFormData({ nama: profile.nama || '', nip: profile.nip || '', email: profile.email || '', status: profile.status || 'aktif' });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <>
      <style>{`
        .profile-card {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        /* LEFT PANEL */
        .profile-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          min-width: 200px;
        }

        .avatar-ring {
          padding: 4px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 50%, #fff));
          box-shadow: 0 8px 24px color-mix(in srgb, var(--accent) 35%, transparent);
        }

        .avatar-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: color-mix(in srgb, var(--accent) 12%, #f8fafc);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: -1px;
          border: 3px solid #fff;
        }

        .profile-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: #1e293b;
          text-align: center;
          margin: 0;
          line-height: 1.3;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 14px;
          border-radius: 99px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--accent);
          background: color-mix(in srgb, var(--accent) 10%, #fff);
          border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 2px #dcfce7;
        }

        .status-dot.nonaktif {
          background: #ef4444;
          box-shadow: 0 0 0 2px #fee2e2;
        }

        .kode-chip {
          font-size: 0.78rem;
          color: #64748b;
          background: #f1f5f9;
          border-radius: 6px;
          padding: 3px 10px;
          font-family: 'Courier New', monospace;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        /* DIVIDER */
        .profile-divider {
          width: 1px;
          background: linear-gradient(to bottom, transparent, #e2e8f0 30%, #e2e8f0 70%, transparent);
          align-self: stretch;
          min-height: 180px;
        }

        /* RIGHT PANEL */
        .profile-right {
          flex: 1;
          min-width: 280px;
        }

        .section-title {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: #94a3b8;
          margin: 0 0 1rem 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-label {
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #94a3b8;
        }

        .info-value {
          font-size: 0.92rem;
          font-weight: 500;
          color: #1e293b;
          padding: 8px 12px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        /* EDIT FORM */
        .edit-section-title {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: #94a3b8;
          margin: 0 0 0.75rem 0;
        }

        .edit-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .edit-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .edit-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #475569;
        }

        .edit-label span {
          color: #ef4444;
        }

        .edit-label .optional {
          color: #94a3b8;
          font-weight: 400;
          font-size: 0.72rem;
        }

        .readonly-field {
          font-size: 0.88rem;
          color: #64748b;
          background: #f1f5f9;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          padding: 9px 12px;
        }

        /* ACTION BUTTONS */
        .action-row {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
        }

        /* Accent variable */
        .profile-wrapper {
          --accent: ${accentColor};
        }

        /* Separator line */
        .edit-separator {
          grid-column: 1 / -1;
          height: 1px;
          background: #f1f5f9;
          margin: 0.25rem 0;
        }
      `}</style>

      <div className="profile-wrapper">
        <div className="profile-card">

          {/* LEFT: Avatar + identity */}
          <div className="profile-left">
            <div className="avatar-ring">
              <div className="avatar-circle">
                {getInitials(isEditing ? formData.nama : profile.nama)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p className="profile-name">{isEditing ? formData.nama || '—' : profile.nama}</p>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
                <span className="role-badge">
                  <i className="pi pi-id-card" style={{ fontSize: '0.7rem' }} />
                  {roleLabels[profile.role] || profile.role}
                </span>
              </div>
            </div>
            <span className="kode-chip">{profile.kode}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
              <span className={`status-dot${profile.status !== 'aktif' ? ' nonaktif' : ''}`} />
              {profile.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
            </div>
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
                  {profile.nip && (
                    <div className="info-item">
                      <span className="info-label">NIP</span>
                      <span className="info-value">{profile.nip}</span>
                    </div>
                  )}
                  {profile.nim && (
                    <div className="info-item">
                      <span className="info-label">NIM</span>
                      <span className="info-value">{profile.nim}</span>
                    </div>
                  )}
                  {profile.prodi && (
                    <div className="info-item">
                      <span className="info-label">Prodi</span>
                      <span className="info-value">{profile.prodi}</span>
                    </div>
                  )}
                  {profile.kelas && (
                    <div className="info-item">
                      <span className="info-label">Kelas</span>
                      <span className="info-value">{profile.kelas}</span>
                    </div>
                  )}
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
                <div className="edit-grid" style={{ marginBottom: '1.25rem' }}>
                  <div className="edit-field">
                    <span className="edit-label">Kode</span>
                    <div className="readonly-field">{profile.kode}</div>
                  </div>
                  <div className="edit-field">
                    <span className="edit-label">Role</span>
                    <div className="readonly-field">{roleLabels[profile.role] || profile.role}</div>
                  </div>
                  {profile.nim && (
                    <div className="edit-field">
                      <span className="edit-label">NIM</span>
                      <div className="readonly-field">{profile.nim}</div>
                    </div>
                  )}
                  {profile.prodi && (
                    <div className="edit-field">
                      <span className="edit-label">Prodi</span>
                      <div className="readonly-field">{profile.prodi}</div>
                    </div>
                  )}
                  {profile.kelas && (
                    <div className="edit-field">
                      <span className="edit-label">Kelas</span>
                      <div className="readonly-field">{profile.kelas}</div>
                    </div>
                  )}
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
                    <label className="edit-label">NIP</label>
                    <InputText
                      value={formData.nip}
                      onChange={(e) => handleInputChange('nip', e.target.value)}
                      className="w-full"
                      placeholder="Masukkan NIP"
                    />
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
                  <div className="edit-field">
                    <label className="edit-label">Status <span>*</span></label>
                    <Dropdown
                      value={formData.status}
                      options={statusOptions}
                      onChange={(e) => handleInputChange('status', e.value)}
                      className="w-full"
                    />
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
    </>
  );
};

export default ProfileForm;