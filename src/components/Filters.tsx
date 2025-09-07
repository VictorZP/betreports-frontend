import React, { useState, useEffect } from 'react';
import { betApi } from '@/lib/api';
import { Calendar, Clock, Filter, X } from 'lucide-react';

interface FiltersProps {
    onApply: (filters: any) => void;
}

export const Filters: React.FC<FiltersProps> = ({ onApply }) => {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        betType: '',
        isPremium: '',
        tournaments: [] as string[],
    });

    const [availableTournaments, setAvailableTournaments] = useState<string[]>([]);
    const [tournamentSearch, setTournamentSearch] = useState('');

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        try {
            const data = await betApi.getTournaments();
            setAvailableTournaments(data || []);
        } catch (error) {
            console.error('Error fetching tournaments:', error);
            setAvailableTournaments([]);
        }
    };

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleTournamentToggle = (tournament: string) => {
        setFilters(prev => ({
            ...prev,
            tournaments: prev.tournaments.includes(tournament)
                ? prev.tournaments.filter(t => t !== tournament)
                : [...prev.tournaments, tournament]
        }));
    };

    const handleApply = () => {
        const apiParams: any = {};
        if (filters.startDate) apiParams.start_date = filters.startDate;
        if (filters.endDate) apiParams.end_date = filters.endDate;
        if (filters.startTime) apiParams.start_time = filters.startTime;
        if (filters.endTime) apiParams.end_time = filters.endTime;
        if (filters.betType) apiParams.bet_type = filters.betType;
        if (filters.isPremium) apiParams.is_premium = filters.isPremium === 'true';
        if (filters.tournaments.length > 0) {
            apiParams.tournaments = filters.tournaments.join(',');
        }

        onApply(apiParams);
    };

    const handleReset = () => {
        setFilters({
            startDate: '',
            endDate: '',
            startTime: '',
            endTime: '',
            betType: '',
            isPremium: '',
            tournaments: [],
        });
        setTournamentSearch('');
        onApply({});
    };

    const filteredTournaments = availableTournaments.filter(t => {
        if (!tournamentSearch) return true;
        if (!t) return false;
        return t.toLowerCase().includes(tournamentSearch.toLowerCase());
    });

    return (
        <div className="space-y-6">
            {/* Даты и время */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-400" />
                        Дата начала
                    </label>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-400" />
                        Дата окончания
                    </label>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-400" />
                        Время от
                    </label>
                    <input
                        type="time"
                        value={filters.startTime}
                        onChange={(e) => handleFilterChange('startTime', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-400" />
                        Время до
                    </label>
                    <input
                        type="time"
                        value={filters.endTime}
                        onChange={(e) => handleFilterChange('endTime', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white transition-all"
                    />
                </div>
            </div>

            {/* Тип ставки и премиум */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-green-400" />
                        Тип ставки
                    </label>
                    <select
                        value={filters.betType}
                        onChange={(e) => handleFilterChange('betType', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white transition-all"
                    >
                        <option value="">Все</option>
                        <option value="OVER">OVER</option>
                        <option value="UNDER">UNDER</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Премиум
                    </label>
                    <select
                        value={filters.isPremium}
                        onChange={(e) => handleFilterChange('isPremium', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white transition-all"
                    >
                        <option value="">Все</option>
                        <option value="true">Да</option>
                        <option value="false">Нет</option>
                    </select>
                </div>
            </div>

            {/* Турниры */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Турниры
                </label>

                <input
                    type="text"
                    placeholder="Поиск турниров..."
                    value={tournamentSearch}
                    onChange={(e) => setTournamentSearch(e.target.value)}
                    className="w-full px-3 py-2 mb-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400 transition-all"
                />

                <div className="max-h-40 overflow-y-auto border border-gray-600 rounded-lg p-3 bg-gray-700/30">
                    {filteredTournaments.length > 0 ? (
                        filteredTournaments.map(tournament => (
                            <label key={tournament} className="flex items-center mb-2 cursor-pointer hover:bg-gray-700/50 p-2 rounded transition-all">
                                <input
                                    type="checkbox"
                                    checked={filters.tournaments.includes(tournament)}
                                    onChange={() => handleTournamentToggle(tournament)}
                                    className="mr-3 w-4 h-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                                />
                                <span className="text-gray-300 text-sm">
                                    {tournament}
                                </span>
                            </label>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm text-center">
                            Нет доступных турниров
                        </p>
                    )}
                </div>

                {filters.tournaments.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {filters.tournaments.map(tournament => (
                            <span key={tournament} className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                                {tournament}
                                <button
                                    onClick={() => handleTournamentToggle(tournament)}
                                    className="hover:text-green-300"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Кнопки */}
            <div className="flex gap-4">
                <button
                    onClick={handleApply}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all font-medium shadow-lg shadow-green-500/20"
                >
                    Применить фильтры
                </button>
                <button
                    onClick={handleReset}
                    className="flex-1 px-4 py-3 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-all font-medium border border-gray-600"
                >
                    Сбросить
                </button>
            </div>
        </div>
    );
};