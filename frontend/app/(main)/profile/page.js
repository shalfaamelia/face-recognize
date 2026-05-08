'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import ToastNotifier from '@/app/components/toastNotifier';
import ProfileForm from './components/profileForm';
import { getProfile } from '@/services/profileService';

export default function Page() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const toastRef = useRef(null);
  const router = useRouter();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", err.message || "Gagal memuat profile");
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    toastRef.current?.showToast("00", "Profile berhasil diperbarui");
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <Card>
      <ToastNotifier ref={toastRef} />
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Profile Saya</h3>
      </div>

      {profile && (
        <ProfileForm
          profile={profile}
          onUpdate={handleProfileUpdate}
          toastRef={toastRef}
        />
      )}
    </Card>
  );
}