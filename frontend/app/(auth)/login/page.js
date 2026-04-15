'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
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
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <ToastNotifier ref={toastRef} />

      <Card className="w-full max-w-md shadow-lg">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">Login SmartAccess</h2>
          <p className="text-sm text-gray-500 mt-2">
            Login hanya untuk Kepala Lab, Teknisi, dan Sarana Prasarana
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block mb-2 font-medium">Email</label>
            <InputText
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Masukkan email"
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Password</label>
            <Password
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Masukkan password"
              className="w-full"
              inputClassName="w-full"
              feedback={false}
              toggleMask
            />
          </div>

          <Button
            type="submit"
            label={loading ? 'Memproses...' : 'Login'}
            icon="pi pi-sign-in"
            disabled={loading}
          />
        </form>
      </Card>
    </div>
  );
}