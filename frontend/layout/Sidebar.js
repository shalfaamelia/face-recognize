'use client';

import { Sidebar as PrimeSidebar } from 'primereact/sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  {
    items: [
      { href: '/', icon: 'pi-home', label: 'Dashboard' },
      { href: '/pengguna', icon: 'pi-users', label: 'Pengguna' },
      { href: '/jadwal', icon: 'pi-calendar', label: 'Jadwal Praktikum' },
      { href: '/monitoring', icon: 'pi-eye', label: 'Monitoring' },
    ],
  },
];

export default function Sidebar({ collapsed, mobileVisible, setMobileVisible }) {
  const pathname = usePathname();

  const NavItem = ({ href, icon, label }) => {
    const active = pathname === href;
    return (
      <Link href={href} style={{ textDecoration: 'none' }}>
        <div
          className="flex align-items-center gap-3"
          style={{
            padding: collapsed ? '10px 0' : '10px 14px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: '10px',
            margin: '2px 8px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: active
              ? 'linear-gradient(135deg, #4a6cf7 0%, #6a85f5 100%)'
              : 'transparent',
            color: active ? '#fff' : '#5a6a85',
            boxShadow: active ? '0 4px 12px rgba(74,108,247,0.3)' : 'none',
            position: 'relative',
          }}
          onMouseEnter={e => {
            if (!active) e.currentTarget.style.background = '#f0f4ff';
            if (!active) e.currentTarget.style.color = '#4a6cf7';
          }}
          onMouseLeave={e => {
            if (!active) e.currentTarget.style.background = 'transparent';
            if (!active) e.currentTarget.style.color = '#5a6a85';
          }}
          title={collapsed ? label : ''}
        >
          <i
            className={`pi ${icon}`}
            style={{ fontSize: '1rem', minWidth: '20px', textAlign: 'center' }}
          />
          {!collapsed && (
            <span style={{ fontSize: '0.875rem', fontWeight: active ? 600 : 500, whiteSpace: 'nowrap' }}>
              {label}
            </span>
          )}
          {active && !collapsed && (
            <div
              style={{
                position: 'absolute',
                right: '14px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.7)',
              }}
            />
          )}
        </div>
      </Link>
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

      {/* Nav groups */}
      <div className="flex flex-column flex-1 py-2" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
        {navItems.map((group, gi) => (
          <div key={gi} style={{ marginBottom: '8px' }}>
            {!collapsed && (
              <div style={{
                padding: '8px 22px 4px',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#b0bac8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                {group.group}
              </div>
            )}
            {collapsed && gi > 0 && (
              <div style={{ height: '1px', background: '#e8ecf0', margin: '6px 12px' }} />
            )}
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
      {/* Desktop */}
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

      {/* Mobile */}
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