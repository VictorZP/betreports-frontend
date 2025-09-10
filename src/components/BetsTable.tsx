'use client';

import React, { useMemo, useState } from 'react';

// Базовый URL API (для загрузки скриншотов и т.п.)
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

// Всегда показываем время в европейском часовом поясе (без «GMT» и без подстройки под устройство)
const EURO_TZ = 'Europe/Paris';
function formatEuroDate(iso: string | null | undefined) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d
    .toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: EURO_TZ,
    })
    .replace(',', ''); // убираем запятую между датой и временем
}

// Тип можно упростить под твои данные
export interface BetRow {
  id: number;
  date: string | null;
  team1: string | null;
  team2: string | null;
  tournament: string | null;
  bet_type: string | null;
  total_value: number | null;
  game_score: string | null;
  result: string | null;     // напр. 'win' | 'lose' | 'refund' и т.п.
  profit: number | null;
  nominal: number | null;
  bank: number | null;
  is_premium: boolean;
  screenshot: string | null; // URL скриншота (или prnt.sc)
  created_at?: string | null;
  updated_at?: string | null;
}

interface BetsTableProps {
  bets: BetRow[];
  loading: boolean;
  itemsPerPage: number;
}

const BetsTable: React.FC<BetsTableProps> = ({ bets, loading, itemsPerPage }) => {
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Пагинация на клиенте
  const total = bets?.length || 0;
  const totalPages = Math.max(1, Math.ceil(total / (itemsPerPage || 1)));
  const currentPage = Math.min(page, totalPages);

  const visibleRows = useMemo(() => {
    const start = (currentPage - 1) * (itemsPerPage || 1);
    const end = start + (itemsPerPage || 1);
    return (bets || []).slice(start, end);
  }, [bets, currentPage, itemsPerPage]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const handleScreenshotClick = async (url: string) => {
    try {
      if (!url) return;
      // Если это prnt.sc – просим бэкенд сделать прокси-картинку
      if (url.includes('prnt.sc')) {
        const response = await fetch(`${API_BASE}/screenshot?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        if (data?.image_url) {
          setSelectedImage(data.image_url);
          return;
        }
      }
      // Иначе открываем как есть
      setSelectedImage(url);
    } catch (e) {
      console.error('Error loading screenshot:', e);
    }
  };

  return (
    <div className="w-full">
      {/* Состояние загрузки */}
      {loading && (
        <div className="w-full p-6 rounded-xl bg-gray-800/40 border border-gray-700/40 text-gray-300 text-center">
          Загрузка...
        </div>
      )}

      {/* Пусто */}
      {!loading && total === 0 && (
        <div className="w-full p-6 rounded-xl bg-gray-800/40 border border-gray-700/40 text-gray-300 text-center">
          Нет данных для отображения
        </div>
      )}

      {/* Таблица */}
      {!loading && total > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-700/40 bg-gray-800/30 backdrop-blur">
          <table className="min-w-full divide-y divide-gray-700/50">
            <thead className="bg-gray-800/60">
              <tr className="text-left text-xs uppercase tracking-wider text-gray-300">
                <th className="px-4 py-3">Дата</th>
                <th className="px-4 py-3">Матч</th>
                <th className="px-4 py-3">Турнир</th>
                <th className="px-4 py-3">Тип ставки</th>
                <th className="px-4 py-3">Сумма</th>
                <th className="px-4 py-3">Счёт</th>
                <th className="px-4 py-3">Результат</th>
                <th className="px-4 py-3">Профит</th>
                <th className="px-4 py-3">Номинал</th>
                <th className="px-4 py-3">Банк</th>
                <th className="px-4 py-3">Премиум</th>
                <th className="px-4 py-3">Скрин</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {visibleRows.map((bet) => {
                const match = [bet.team1, bet.team2].filter(Boolean).join(' — ');
                const isWin = String(bet.result || '').toLowerCase() === 'win';
                const isLose = String(bet.result || '').toLowerCase() === 'lose';

                return (
                  <tr key={bet.id} className="text-sm text-gray-200 hover:bg-gray-800/40 transition">
                    {/* Дата — фиксированная европейская зона */}
                    <td className="px-4 py-3 whitespace-nowrap">{formatEuroDate(bet.date)}</td>

                    {/* Матч */}
                    <td className="px-4 py-3">{match || '-'}</td>

                    {/* Турнир */}
                    <td className="px-4 py-3">{bet.tournament || '-'}</td>

                    {/* Тип ставки */}
                    <td className="px-4 py-3">{bet.bet_type || '-'}</td>

                    {/* Сумма */}
                    <td className="px-4 py-3">{bet.total_value != null ? bet.total_value : '-'}</td>

                    {/* Счёт игры */}
                    <td className="px-4 py-3">{bet.game_score || '-'}</td>

                    {/* Результат */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-md text-xs ${
                          isWin
                            ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/20'
                            : isLose
                            ? 'bg-rose-900/40 text-rose-300 border border-rose-500/20'
                            : 'bg-gray-700/40 text-gray-300 border border-gray-500/20'
                        }`}
                      >
                        {bet.result || '-'}
                      </span>
                    </td>

                    {/* Профит */}
                    <td className="px-4 py-3">{bet.profit != null ? bet.profit.toFixed(2) : '-'}</td>

                    {/* Номинал */}
                    <td className="px-4 py-3">{bet.nominal != null ? bet.nominal : '-'}</td>

                    {/* Банк */}
                    <td className="px-4 py-3">{bet.bank != null ? bet.bank : '-'}</td>

                    {/* Премиум */}
                    <td className="px-4 py-3">
                      {bet.is_premium ? (
                        <span className="px-2 py-1 rounded-md text-xs bg-amber-900/40 text-amber-200 border border-amber-500/20">
                          Премиум
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-md text-xs bg-gray-700/40 text-gray-300 border border-gray-500/20">
                          Обычная
                        </span>
                      )}
                    </td>

                    {/* Скриншот */}
                    <td className="px-4 py-3">
                      {bet.screenshot ? (
                        <button
                          onClick={() => handleScreenshotClick(bet.screenshot as string)}
                          className="px-2 py-1 rounded-md text-xs bg-indigo-900/40 text-indigo-200 border border-indigo-500/20 hover:bg-indigo-800/40 transition"
                        >
                          Открыть
                        </button>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Пагинация */}
      {!loading && total > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-300">
          <div>
