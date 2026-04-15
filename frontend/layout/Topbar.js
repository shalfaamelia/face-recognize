'use client';

import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { useAuth } from '@/app/components/authProvider';

function formatRole(role) {
  if (role === 'kepala_lab') return 'Kepala Lab';
  if (role === 'teknisi') return 'Teknisi';
  if (role === 'sarpras') return 'Sarana Prasarana';
  return '-';
}

export default function Topbar({ toggleSidebar, toggleMobileSidebar }) {
  const { user, logout } = useAuth();

  const avatarLabel = user?.nama ? user.nama.charAt(0).toUpperCase() : 'A';

  return (
    <div
      className="flex justify-content-between align-items-center px-4"
      style={{
        height: '64px',
        background: '#ffffff',
        borderBottom: '1px solid #e8ecf0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex align-items-center gap-3">
        <Button
          icon="pi pi-bars"
          text
          onClick={toggleMobileSidebar}
          className="p-button-rounded md:hidden"
          style={{ color: '#6b7280' }}
        />

        <Button
          icon="pi pi-bars"
          text
          onClick={toggleSidebar}
          className="p-button-rounded hidden md:flex"
          style={{ color: '#6b7280' }}
        />

        <div className="flex align-items-center gap-2">
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4a6cf7 0%, #6a85f5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(74,108,247,0.35)',
            }}
          >
            <i className="pi pi-lock" style={{ color: '#fff', fontSize: '0.85rem' }} />
          </div>

          <span
            style={{
              fontWeight: 700,
              fontSize: '1rem',
              color: '#1a2035',
              letterSpacing: '-0.01em',
            }}
          >
            Smart<span style={{ color: '#4a6cf7' }}>Access</span>
          </span>
        </div>
      </div>

      <div className="flex align-items-center gap-3">
        <div className="hidden md:flex align-items-center gap-2">
          <Avatar
            label={avatarLabel}
            shape="circle"
            style={{
              background: 'linear-gradient(135deg, #4a6cf7, #6a85f5)',
              color: '#fff',
              width: '34px',
              height: '34px',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          />

          <div className="flex flex-column" style={{ lineHeight: 1.3 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a2035' }}>
              {user?.nama || 'User'}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#8896a7' }}>
              {formatRole(user?.role)}
            </span>
          </div>
        </div>

        <Button
          label="Logout"
          icon="pi pi-sign-out"
          severity="secondary"
          outlined
          size="small"
          onClick={logout}
        />
      </div>
    </div>
  );
}