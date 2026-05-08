'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { ConfirmDialog} from 'primereact/confirmdialog';
import ToastNotifier from '@/app/components/toastNotifier';
import HeaderBar from "@/app/components/headerbar";
import LaporanAksesTable from './components/laporanAksesTable';
import { getLaporanAkses } from '@/services/laporanAksesService';

export default function Page() {
    const [laporanAkses, setLaporanAkses] = useState([]);
    const [loading, setLoading] = useState(false);
    const toastRef = useRef(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getLaporanAkses();
            setLaporanAkses(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    return (
        <Card>
            <ToastNotifier ref={toastRef} />
            <ConfirmDialog />
            <div className="flex items-center justify-between mb-3">

                <h3 className="text-xl font-semibold">Laporan Akses Lab</h3>

                <div className="flex items-center ml-auto gap-2">
                    <HeaderBar
                        title=""
                        placeholder="Cari berdasarkan nama atau kode..."
                        onSearch={(keyword) => {
                            if (!keyword) fetchData();
                            else setLaporanAkses(laporanAkses.filter(item =>
                                item.kode?.toLowerCase().includes(keyword.toLowerCase()) ||
                                item.nama?.toLowerCase().includes(keyword.toLowerCase())
                            ));
                        }}
                    />
                </div>
            </div>

            <LaporanAksesTable
                laporanAkses={laporanAkses}
                loading={loading}
            />
        </Card>
    );
};