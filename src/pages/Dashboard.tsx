// src/pages/Dashboard.tsx
import React, { useEffect, useMemo, useState } from 'react';
import betApi from '../services/api';
import StatsCard from '../components/StatsCard';

type Stats = {
    totalBets: number;
    winRate: number;
    totalProfit: number;
    totalStaked: number;
    totalWon: number;
    roi: number;
    wins: number;
    losses: number;
    currentNominal: number;
    currentBank: number;
};

type Bet = {
    id: number | string;
    date?: string;
    tournament?: string;
    team1?: string;
    team2?: string;
    market?: string;
    odds?: number;
    stake?: number;
    result?: 'win' | 'loss' | 'push' | string;
    profit?: number;
};

type Filters = {
    from?: string;
    to?: string;
    tournament?: string;
    result?: string;
};

const initialStats: Stats = {
    totalBets: 0,
    winRate: 0,
    totalProfit: 0,
    totalStaked: 0,
    totalWon: 0,
    roi: 0,
    wins: 0,
    losses: 0,
    currentNominal: 100,
    currentBank: 2000,
};

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats>(initialStats);
    const [bets, setBets] = useState<Bet[]>([]);
    const [tournaments, setTournaments] = useState<string[]>([]);
    const [filters, setFilters] = useState<Filters>({});
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadStats = async (f: Filters = filters) => {
        try {
            const data = await betApi.getStats(f);
            setStats({ ...initialStats, ...(data || {}) });
        } catch {
            setStats(initialStats);
        }
    };

    const loadBets = async (f: Filters = filters) => {
        try {
            const data = await betApi.getBets(f);
            setBets(Array.isArray(data) ? data : []);
        } catch {
            setBets([]);
        }
    };

    const loadTournaments = async () => {
        try {
            const data = await betApi.getTournaments();
            setTournaments(Array.isArray(data) ? data : []);
        } catch {
            setTournaments([]);
        }
    };

    const fetchAll = async (f: Filters = filters) => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([loadStats(f), loadBets(f), loadTournaments()]);
        } catch {
            setError('Не удалось загрузить данные');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const applyFilters = async () => {
        await fetchAll(filters);
    };

    const clearFilters = async () => {
        const empty: Filters = {};
        setFilters(empty);
        await fetchAll(empty);
    };

    const onSync = async () => {
        setSyncing(true);
        setError(null);
        try {
            await betApi.syncNotionData("2024-2025");
            await fetchAll(filters);
        } catch {
            setError('Синхронизация завершилась с ошибкой');
        } finally {
            setSyncing(false);
        }
    };

    const filteredCount = useMemo(() => bets.length, [bets]);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Дашборд ставок</h1>
                <div className="flex gap-3">
                    {/* Кнопка синхронизации видна только локально */}
                    {process.env.NEXT_PUBLIC_ENABLE_SYNC === 'true' && (
                        <button
                            onClick={onSync}
                            disabled={syncing}
                            className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-60"
                        >
                            {syncing ? 'Синхронизация…' : 'Синхронизировать (Notion)'}
                        </button>
                    )}
                    <button
                        onClick={() => fetchAll(filters)}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl bg-gray-800 text-white disabled:opacity-60"
                    >
                        {loading ? 'Обновление…' : 'Обновить'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-8">
                <StatsCard stats={stats} />
            </div>

            {/* Фильтры */}
            <div className="mb-8 rounded-2xl border p-4">
                <h2 className="text-lg font-medium mb-4">Фильтры</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* поля фильтров как раньше */}
                    ...
                </div>
            </div>

            {/* Таблица ставок */}
            <div className="rounded-2xl border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                    <h2 className="text-lg font-medium">Ставки</h2>
                    <div className="text-sm text-gray-600">Всего: {filteredCount}</div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Дата</th>
                                <th className="px-4 py-2 text-left">Турнир</th>
                                <th className="px-4 py-2 text-left">Матч</th>
                                <th className="px-4 py-2 text-left">Маркет</th>
                                <th className="px-4 py-2 text-right">Кэф</th>
                                <th className="px-4 py-2 text-right">Ставка</th>
                                <th className="px-4 py-2 text-right">Профит</th>
                                <th className="px-4 py-2 text-center">Результат</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bets.length > 0 ? (
                                bets.map((b) => (
                                    <tr key={String(b.id)} className="border-t">
                                        <td className="px-4 py-2">{b.date ?? '-'}</td>
                                        <td className="px-4 py-2">{b.tournament ?? '-'}</td>
                                        <td className="px-4 py-2">
                                            {(b.team1 || '-') + ' vs ' + (b.team2 || '-')}
                                        </td>
                                        <td className="px-4 py-2">{b.market ?? '-'}</td>
                                        <td className="px-4 py-2 text-right">{b.odds ?? '-'}</td>
                                        <td className="px-4 py-2 text-right">{b.stake ?? '-'}</td>
                                        <td className="px-4 py-2 text-right">
                                            {typeof b.profit === 'number' ? b.profit.toFixed(2) : '-'}
                                        </td>
                                        <td className="px-4 py-2 text-center">{b.result ?? '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                                        Нет данных
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
