'use client';

import React, { useEffect, useState } from 'react';
import { Menu, RefreshCw } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import BetsTable from '@/components/BetsTable';
import FiltersSidebar from '@/components/FiltersSidebar';
import betApi from '@/services/api';
import NominalsTable from '@/components/NominalsTable';

// Прод: скрываем кнопку синка
const isProd = process.env.NODE_ENV === 'production';
const showSync = !isProd && process.env.NEXT_PUBLIC_SHOW_SYNC === 'true';

// Сезон по умолчанию
const DEFAULT_SEASON = process.env.NEXT_PUBLIC_DEFAULT_SEASON || '2024-2025';

export default function Home() {
  const [bets, setBets] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Глобальный (фиксированный) банк и флаг конфликта фильтров
  const [globalBank, setGlobalBank] = useState<number | null>(null);
  const [filterConflict, setFilterConflict] = useState(false);

  // Подтянуть данные: метрики и ставки — по фильтрам; банк — общий (без фильтров)
  const fetchData = async (appliedFilters: any = {}) => {
    setLoading(true);
    try {
      const [betsData, statsFiltered, statsGlobal] = await Promise.all([
        betApi.getBets(appliedFilters),
        betApi.getStats(appliedFilters),
        betApi.getStats({}), // общий currentBank без фильтров
      ]);

      const conflict = Boolean(statsFiltered?.filterConflict);
      setFilterConflict(conflict);

      const fixedBank =
        globalBank ?? (statsGlobal?.currentBank as number | undefined) ?? 2000;

      if (globalBank === null && statsGlobal?.currentBank != null) {
        setGlobalBank(Number(statsGlobal.currentBank));
      }

      // подменяем только банк; periods и прочее остаются из фильтрованных статов
      const mergedStats = {
        ...statsFiltered,
        currentBank: Number(fixedBank),
      };

      setBets(conflict ? [] : betsData); // при конфликте не показываем таблицу ставок
      setStats(mergedStats);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await betApi.syncNotionData(DEFAULT_SEASON); // синк строго с указанием сезона
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
    fetchData({ season: DEFAULT_SEASON });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

            {/* Кнопка синхронизации (скрыта на проде) */}
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

          {/* Cards с метриками */}
          {stats && <StatsCard stats={stats} />}

          {/* Примечание о времени + селектор количества записей */}
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-gray-300/80">
              Примечание: время ставок указано в европейском часовом поясе.
            </div>
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

          {/* Таблица номиналов (периоды) — показываем только если нет конфликта и есть данные */}
          {!filterConflict && stats?.periods?.length > 0 && (
            <NominalsTable periods={stats.periods} />
          )}

          {/* Таблица ставок / сообщение о конфликте фильтров */}
          {filterConflict ? (
            <div className="w-full p-6 rounded-xl bg-amber-900/30 border border-amber-500/30 text-amber-200 text-center">
              Несогласующиеся фильтры: выбранный месяц не пересекается с диапазоном дат.
            </div>
          ) : (
            <BetsTable bets={bets} loading={loading} itemsPerPage={itemsPerPage} />
          )}
        </div>
      </div>
    </div>
  );
}
