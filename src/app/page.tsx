'use client';

import React, { useEffect, useState } from 'react';
import { Menu, RefreshCw } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import BetsTable from '@/components/BetsTable';
import FiltersSidebar from '@/components/FiltersSidebar';
import betApi from '@/services/api';

export default function Home() {
  const [bets, setBets] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Показывать кнопку синхронизации только если явно разрешено переменной окружения
  // Локально добавь в .env.local: NEXT_PUBLIC_SHOW_SYNC=true
  // На проде переменную НЕ задавай — кнопка будет скрыта.
  const showSync = process.env.NEXT_PUBLIC_SHOW_SYNC === 'true';

  const fetchData = async (appliedFilters: any = {}) => {
    setLoading(true);
    try {
      const [betsData, statsData] = await Promise.all([
        betApi.getBets(appliedFilters),
        betApi.getStats(appliedFilters),
      ]);
      setBets(betsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await betApi.syncNotionData('2024-2025'); // передаём сезон
      await fetchData(filters);
      alert('Синхронизация завершена успешно!');
    } catch (error) {
      alert('Ошибка синхронизации. Проверьте настройки Notion.');
    } finally {
      setSyncing(false);
    }
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    fetchData(newFilters);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <FiltersSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onApplyFilters={handleApplyFilters}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : ''}`}>
        <div className="p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-3 bg-gray-800/50 backdrop-blur rounded-xl hover:bg-gray-700/50 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                title="Открыть фильтры"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Basketball <span className="text-emerald-400">Analytics</span>
              </h1>
            </div>

            {/* Кнопка синхронизации показывается только если разрешено флагом */}
            {showSync && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className={`
                  px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg
                  flex items-center gap-2
                  ${syncing
                    ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white hover:scale-105 shadow-emerald-500/25'
                  }
                `}
              >
                <RefreshCw className={`${syncing ? 'animate-spin' : ''}`} size={18} />
                {syncing ? 'Синхронизация...' : 'Синхронизировать'}
              </button>
            )}
          </div>

          {/* Stats Cards */}
          {stats && <StatsCard stats={stats} />}

          {/* Items per page selector */}
          <div className="mb-6 flex justify-end">
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-4 py-2 bg-gray-800/50 backdrop-blur text-gray-300 rounded-xl border border-gray-700/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            >
              <option value={10}>10 записей</option>
              <option value={25}>25 записей</option>
              <option value={50}>50 записей</option>
              <option value={100}>100 записей</option>
            </select>
          </div>

          {/* Bets Table */}
          <BetsTable bets={bets} loading={loading} itemsPerPage={itemsPerPage} />
        </div>
      </div>
    </div>
  );
}
