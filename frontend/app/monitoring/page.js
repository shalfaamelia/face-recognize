'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { ConfirmDialog} from 'primereact/confirmdialog';
import ToastNotifier from '@/app/components/toastNotifier';
import HeaderBar from "@/app/components/headerbar";
import MonitoringTable from './components/monitoringTable';
import { getMonitoring} from '@/services/monitoringService';

export default function Page() {
    const [monitoring, setMonitoring] = useState([]);
    const [loading, setLoading] = useState(false);
    const toastRef = useRef(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getMonitoring();
            setMonitoring(data);
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

                <h3 className="text-xl font-semibold">Manajemen Monitoring Kehadiran</h3>

                <div className="flex items-center ml-auto gap-2">
                    <HeaderBar
                        title=""
                        placeholder="Cari berdasarkan nama atau kode..."
                        onSearch={(keyword) => {
                            if (!keyword) fetchData();
                            else setMonitoring(monitoring.filter(item =>
                                item.kode?.toLowerCase().includes(keyword.toLowerCase()) ||
                                item.nama?.toLowerCase().includes(keyword.toLowerCase())
                            ));
                        }}
                    />
                </div>
            </div>

            <MonitoringTable
                monitoring={monitoring}
                loading={loading}
            />
        </Card>
    );
}