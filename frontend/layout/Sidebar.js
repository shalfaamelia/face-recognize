'use client';

import { Sidebar as PrimeSidebar } from 'primereact/sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import { useAuth } from '@/app/components/authProvider';

const navItems = [
  {
    items: [
      { href: '/dashboard', icon: 'pi-home', label: 'Dashboard', roles: ['kepala_lab', 'teknisi', 'sarpras', 'dosen'] },
      { href: '/user', icon: 'pi-users', label: 'Pengguna', roles: ['kepala_lab'] },
      { href: '/jadwal', icon: 'pi-calendar', label: 'Jadwal Praktikum', roles: ['kepala_lab', 'teknisi'] },
      { href: '/monitoring', icon: 'pi-eye', label: 'Monitoring', roles: ['kepala_lab', 'teknisi', 'sarpras', 'dosen'] },
      { href: '/peminjaman_lab', icon: 'pi-calendar-plus', label: 'Peminjaman Lab', roles: ['kepala_lab', 'teknisi'] },
      { href: '/ajuan_barang', icon: 'pi-box', label: 'Ajuan Barang Lab', roles: ['kepala_lab', 'teknisi', 'sarpras'] },
      {
        href: '/laporan',
        icon: 'pi-file',
        label: 'Laporan',
        roles: ['kepala_lab', 'teknisi', 'sarpras', 'dosen'],
        children: [
          { href: '/laporan/akses', icon: 'pi-key', label: 'Laporan Akses Lab', roles: ['kepala_lab', 'teknisi', 'sarpras', 'dosen'] },
          { href: '/laporan/peminjaman', icon: 'pi-book', label: 'Laporan Peminjaman Lab', roles: ['kepala_lab', 'teknisi', 'sarpras'] },
          { href: '/laporan/barang', icon: 'pi-box', label: 'Laporan Barang Lab', roles: ['kepala_lab', 'teknisi', 'sarpras'] },
        ],
      },
    ],
  },
];

export default function Sidebar({ collapsed, mobileVisible, setMobileVisible }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const canAccess = (roles = []) => {
    if (!user?.role) return false;
    return roles.includes(user.role);
  };

  const filteredNavItems = navItems.map((group) => ({
    ...group,
    items: group.items
      .filter((item) => canAccess(item.roles))
      .map((item) => ({
        ...item,
        children: item.children ? item.children.filter((child) => canAccess(child.roles)) : undefined,
      }))
      .filter((item) => !item.children || item.children.length > 0),
  }));

  const NavItem = ({ href, icon, label, children }) => {
    const active = pathname === href;
    const activeChild = children?.some((child) => pathname === child.href);
    const [open, setOpen] = React.useState(activeChild || false);

    return (
      <div>
        <div
          className="flex align-items-center gap-3"
          style={{
            padding: collapsed ? '10px 0' : '10px 14px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: '10px',
            margin: '2px 8px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: (active || activeChild)
              ? 'linear-gradient(135deg, #4a6cf7 0%, #6a85f5 100%)'
              : 'transparent',
            color: (active || activeChild) ? '#fff' : '#5a6a85',
            boxShadow: (active || activeChild) ? '0 4px 12px rgba(74,108,247,0.3)' : 'none',
            position: 'relative',
          }}
          onClick={() => children && setOpen(!open)}
          onMouseEnter={e => {
            if (!(active || activeChild)) e.currentTarget.style.background = '#f0f4ff';
            if (!(active || activeChild)) e.currentTarget.style.color = '#4a6cf7';
          }}
          onMouseLeave={e => {
            if (!(active || activeChild)) e.currentTarget.style.background = 'transparent';
            if (!(active || activeChild)) e.currentTarget.style.color = '#5a6a85';
          }}
          title={collapsed ? label : ''}
        >
          <i className={`pi ${icon}`} style={{ fontSize: '1rem', minWidth: '20px', textAlign: 'center' }} />
          {!collapsed && <span style={{ fontSize: '0.875rem', fontWeight: (active || activeChild) ? 600 : 500 }}>{label}</span>}
          {children && !collapsed && (
            <i className={`pi ${open ? 'pi-chevron-down' : 'pi-chevron-right'}`} style={{ marginLeft: 'auto' }} />
          )}
          {!children && (
            <Link href={href} style={{ position: 'absolute', inset: 0 }} />
          )}
        </div>

        {children && open && (
          <div style={{ paddingLeft: collapsed ? '0' : '20px' }}>
            {children.map((child, idx) => (
              <NavItem key={idx} {...child} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div
      className="flex flex-column h-full"
      style={{
        background: '#ffffff',
        borderRight: isMobile ? 'none' : '1px solid #e8ecf0',
        width: '100%',
        overflowX: 'hidden',
      }}
    >
      <div className="flex flex-column flex-1 py-2" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
        {filteredNavItems.map((group, gi) => (
          <div key={gi} style={{ marginBottom: '8px' }}>
            {group.items.map((item, ii) => (
              <NavItem key={ii} {...item} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div
        style={{
          width: collapsed ? '64px' : '240px',
          transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
          flexShrink: 0,
          display: 'none',
          flexDirection: 'column',
        }}
        className="md:flex"
      >
        <SidebarContent />
      </div>

      <PrimeSidebar
        visible={mobileVisible}
        onHide={() => setMobileVisible(false)}
        style={{ padding: 0, width: '260px' }}
        pt={{ content: { style: { padding: 0, height: '100%' } } }}
      >
        <SidebarContent isMobile />
      </PrimeSidebar>
    </>
  );
}