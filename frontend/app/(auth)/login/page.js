'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import ToastNotifier from '@/app/components/toastNotifier';
import { useAuth } from '@/app/components/authProvider';

export default function LoginPage() {
  const router = useRouter();
  const toastRef = useRef(null);
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const showToast = (severity, summary, detail) => {
    toastRef.current?.show?.({
      severity,
      summary,
      detail,
      life: 3000,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(form.email, form.password);
      showToast('success', 'Berhasil', 'Login berhasil');
      router.replace('/dashboard');
    } catch (err) {
      showToast('error', 'Gagal', err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex align-items-center justify-content-center px-3 md:px-5"
      style={{
        background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 45%, #e0f2fe 100%)',
      }}
    >
      <ToastNotifier ref={toastRef} />

      <div className="grid w-full align-items-center" style={{ maxWidth: '1100px' }}>
        {/* Left Section */}
        <div className="col-12 lg:col-6 hidden lg:block">
          <div className="pr-6">
            <div
              className="inline-flex align-items-center justify-content-center mb-4"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                boxShadow: '0 10px 30px rgba(79,70,229,0.25)',
              }}
            >
              <i className="pi pi-lock text-white text-2xl" />
            </div>

            <h1
              className="m-0 mb-3"
              style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                lineHeight: 1.2,
                color: '#0f172a',
              }}
            >
              Smart<span style={{ color: '#4f46e5' }}>Access</span>
            </h1>

            <p
              className="mt-0 mb-4"
              style={{
                fontSize: '1rem',
                lineHeight: 1.8,
                color: '#475569',
                maxWidth: '520px',
              }}
            >
              Sistem kontrol akses laboratorium yang membantu pengelolaan pengguna,
              jadwal praktikum, monitoring, peminjaman lab, dan laporan secara
              terintegrasi.
            </p>

            <div className="grid">
              <div className="col-12 md:col-6">
                <div
                  className="surface-card border-round-xl p-3 h-full"
                  style={{
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
                  }}
                >
                  <div className="flex align-items-center gap-2 mb-2">
                    <i className="pi pi-shield text-blue-500" />
                    <span className="font-semibold text-900">Aman & Terkontrol</span>
                  </div>
                  <small className="text-600 line-height-3">
                    Akses web dibatasi hanya untuk peran yang memiliki otoritas.
                  </small>
                </div>
              </div>

              <div className="col-12 md:col-6">
                <div
                  className="surface-card border-round-xl p-3 h-full"
                  style={{
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
                  }}
                >
                  <div className="flex align-items-center gap-2 mb-2">
                    <i className="pi pi-desktop text-indigo-500" />
                    <span className="font-semibold text-900">Manajemen Terpusat</span>
                  </div>
                  <small className="text-600 line-height-3">
                    Semua data akses, peminjaman, dan laporan dapat dipantau dalam satu dashboard.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="col-12 lg:col-6">
          <Card
            className="w-full mx-auto"
            style={{
              maxWidth: '460px',
              borderRadius: '24px',
              boxShadow: '0 20px 50px rgba(15,23,42,0.12)',
              border: '1px solid rgba(255,255,255,0.65)',
              overflow: 'hidden',
            }}
          >
            <div className="text-center mb-4">
              <div
                className="inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                  boxShadow: '0 10px 25px rgba(79,70,229,0.25)',
                }}
              >
                <i className="pi pi-user text-white text-xl" />
              </div>

              <h2
                className="m-0 mb-2"
                style={{
                  fontSize: '1.9rem',
                  fontWeight: 700,
                  color: '#0f172a',
                }}
              >
                Login SmartAccess
              </h2>

              <p
                className="m-0"
                style={{
                  color: '#64748b',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                }}
              >
                Masuk menggunakan email dan password yang telah terdaftar.
              </p>
            </div>

            <Divider />

            <form onSubmit={handleSubmit} className="flex flex-column gap-4 mt-4">
              <div className="flex flex-column gap-2">
                <label
                  htmlFor="email"
                  className="font-semibold"
                  style={{ color: '#334155' }}
                >
                  Email
                </label>
                <span className="p-input-icon-left w-full">
                  <InputText
                    id="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Masukkan email"
                    className="w-full"
                    style={{
                      borderRadius: '12px',
                      paddingTop: '0.85rem',
                      paddingBottom: '0.85rem',
                    }}
                  />
                </span>
              </div>

              <div className="flex flex-column gap-2 login-password-field">
                <label
                  htmlFor="password"
                  className="font-semibold"
                  style={{ color: '#334155' }}
                >
                  Password
                </label>

                <Password
                  id="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Masukkan password"
                  feedback={false}
                  toggleMask
                  className="w-full"
                  inputClassName="w-full"
                />
              </div>

              <Button
                type="submit"
                label={loading ? 'Memproses...' : 'Login'}
                disabled={loading}
                className="w-full"
                style={{
                  borderRadius: '14px',
                  paddingTop: '0.9rem',
                  paddingBottom: '0.9rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                  border: 'none',
                }}
              />

              <div className="text-center mt-2">
                <small className="text-500" style={{ lineHeight: 1.7 }}>
                  Login hanya untuk <b>Kepala Lab</b>, <b>Teknisi</b>, <b>Dosen</b>, dan <b>Sarana Prasarana</b>.
                </small>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}