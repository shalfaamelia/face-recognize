'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { ConfirmDialog} from 'primereact/confirmdialog';
import ToastNotifier from '@/app/components/toastNotifier';
import HeaderBar from "@/app/components/headerbar";
import FilterTanggal from '@/app/components/filterTanggal';
import MonitoringTable from './components/monitoringTable';
import { getMonitoring} from '@/services/monitoringService';

export default function Page() {
    const [monitoring, setMonitoring] = useState([]);
    const [allMonitoring, setAllMonitoring] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const toastRef = useRef(null);

    const formatDateParam = (date) => {
        if (!date) return '';
        const value = new Date(date);
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const applySearch = (data, keyword) => {
        if (!keyword || keyword.trim() === '') return data;

        const lowerKeyword = keyword.toLowerCase();
        return data.filter(item =>
            item.kode?.toLowerCase().includes(lowerKeyword) ||
            item.nama?.toLowerCase().includes(lowerKeyword)
        );
    };

    const fetchData = async (filters = {}) => {
        setLoading(true);
        try {
            const data = await getMonitoring(filters);
            setAllMonitoring(data);
            setMonitoring(applySearch(data, searchKeyword));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSearch = (keyword) => {
        setSearchKeyword(keyword);
        setMonitoring(applySearch(allMonitoring, keyword));
    };

    const handleDateFilter = () => {
        fetchData({
            startDate: formatDateParam(startDate),
            endDate: formatDateParam(endDate),
        });
    };

    const resetFilter = () => {
        setStartDate(null);
        setEndDate(null);
        fetchData();
    };

    return (
        <Card>
            <ToastNotifier ref={toastRef} />
            <ConfirmDialog />
            <div className="mb-3">
                <h3 className="text-xl font-semibold" style={{ margin: '0 0 1.25rem 0' }}>
                    Manajemen Monitoring Kehadiran
                </h3>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        flexWrap: 'wrap',
                    }}
                >
                    <div>
                    <FilterTanggal
                        startDate={startDate}
                        endDate={endDate}
                        setStartDate={setStartDate}
                        setEndDate={setEndDate}
                        handleDateFilter={handleDateFilter}
                        resetFilter={resetFilter}
                    />
                    </div>

                    <div style={{ marginLeft: 'auto' }}>
                        <HeaderBar
                            title=""
                            placeholder="Cari berdasarkan nama atau kode..."
                            onSearch={handleSearch}
                        />
                    </div>
                </div>
            </div>

            <MonitoringTable
                monitoring={monitoring}
                loading={loading}
            />
        </Card>
    );
}
