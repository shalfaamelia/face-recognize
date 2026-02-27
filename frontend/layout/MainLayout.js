'use client';

import { useState } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileVisible, setMobileVisible] = useState(false);

  return (
    <div className="flex flex-column" style={{ minHeight: '100vh', background: '#f5f7fb' }}>

      <Topbar
        toggleSidebar={() => setCollapsed(!collapsed)}
        toggleMobileSidebar={() => setMobileVisible(!mobileVisible)}
      />

      <div className="flex flex-1" style={{ overflow: 'hidden' }}>

        <Sidebar
          collapsed={collapsed}
          mobileVisible={mobileVisible}
          setMobileVisible={setMobileVisible}
        />

        {/* Main content */}
        <div
          className="flex flex-column flex-1"
          style={{
            overflowY: 'auto',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <div
            style={{
              flex: 1,
              padding: '24px 32px 0',
              maxWidth: '1400px',
              width: '100%',
              margin: '0 auto',
            }}
          >
            {children}
          </div>
          <Footer />
        </div>

      </div>

    </div>
  );
}