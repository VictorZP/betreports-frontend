import React, { useState, useEffect } from 'react';
import { X, Search, ChevronDown, ChevronUp, Award } from 'lucide-react';
import axios from 'axios';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

interface FiltersSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({ isOpen, onClose, onApplyFilters }) => {
  const [selectedSeason, setSelectedSeason] =
    useState<'2024-2025' | '2025-2026'>('2024-2025');

  const [tournaments, setTournaments] = useState<string[]>([]);
  const [selectedTournaments, setSelectedTournaments] = useState<string[]>([]);
  const [tournamentSearch, setTournamentSearch] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minDate, setMinDate] = useState('');   // <-- больше не хардкодим
  const [maxDate, setMaxDate] = useState('');   // <-- подтягиваем с бэка

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [betType, setBetType] = useState<'all' | 'OVER' | 'UNDER'>('all');
  const [isPremium, setIsPremium] = useState<'all' | 'premium' | 'regular'>('all');
  const [result, setResult] = useState<'all' | 'WIN' | 'LOSE'>('all');

  const [availableMonths, setAvailableMonths] =
    useState<Array<{ value: string; label: string }>>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const [sections, setSections] = useState({
    season: true,
    tournaments: false,
    dates: false,
    time: false,
    month: false,
    betType: false,
    premium: false,
    result: false,
  });

  useEffect(() => {
    fetchSeasonData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeason]);

  const fetchSeasonData = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/season-data?season=${selectedSeason}`);

      setTournaments(data.tournaments || []);
      setSelectedTournaments(data.tournaments || []);

      // Самые ранние/поздние даты берём из базы (Notion -> БД)
      setMinDate(data?.dateRange?.min || '');
      setMaxDate(data?.dateRange?.max || '');

      // Доступные месяцы
      setAvailableMonths(data?.months || []);
    } catch (error) {
      // В случае ошибки НЕ подставляем искусственную дату.
      // Оставляем min/max пустыми — инпуты будут без ограничений.
      setMinDate('');
      setMaxDate('');
      console.error('season-data load failed', error);
      // запасной список турниров (если эндпоинт недоступен)
      try {
        const t = await axios.get(`${API_BASE}/tournaments`);
        setTournaments(t.data || []);
        setSelectedTournaments(t.data || []);
      } catch (e) {
        console.error('fallback tournaments failed', e);
      }
    }
  };

  const toggleSection = (section: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const filteredTournaments = tournaments.filter((t) =>
    t.toLowerCase().includes(tournamentSearch.toLowerCase())
  );

  const selectAllTournaments = () => setSelectedTournaments(tournaments);
  const deselectAllTournaments = () => setSelectedTournaments([]);

  const toggleTournament = (tournament: string) => {
    setSelectedTournaments((prev) =>
      prev.includes(tournament)
        ? prev.filter((t) => t !== tournament)
        : [...prev, tournament]
    );
  };

  const handleSeasonChange = (season: '2024-2025' | '2025-2026') => {
    setSelectedSeason(season);
    // Полный сброс зависимых фильтров — новые границы придут из /season-data
    setStartDate('');
    setEndDate('');
    setSelectedMonth('');
    setMinDate('');
    setMaxDate('');
  };

  // единая сборка объекта фильтров из текущего состояния
  const buildFilters = (overrides: Partial<Record<string, any>> = {}) => {
    const tournamentsParam =
      selectedTournaments.length === tournaments.length || selectedTournaments.length === 0
        ? null
        : selectedTournaments.join(',');

    return {
      season: selectedSeason,
      tournaments: tournamentsParam,
      start_date: startDate || null,
      end_date: endDate || null,
      start_time: startTime || null,
      end_time: endTime || null,
      bet_type: betType === 'all' ? null : betType,
      is_premium: isPremium === 'all' ? null : isPremium === 'premium',
      result: result === 'all' ? null : result,
      month: selectedMonth || null,
      ...overrides,
    };
  };

  const handleApply = () => {
    onApplyFilters(buildFilters());
    onClose();
  };

  // СБРОС ТОЛЬКО ДАТ (и месяца, чтобы исключить конфликт)
  const handleResetDates = () => {
    setStartDate('');
    setEndDate('');
    setSelectedMonth('');
    onApplyFilters(
      buildFilters({
        start_date: null,
        end_date: null,
        month: null,
      })
    );
  };

  // Глобальный сброс всех фильтров
  const handleReset = () => {
    setSelectedTournaments(tournaments);
    setStartDate('');
    setEndDate('');
    setStartTime('');
    setEndTime('');
    setBetType('all');
    setIsPremium('all');
    setResult('all');
    setSelectedMonth('');
    onApplyFilters({ season: selectedSeason });
  };

  // При выборе месяца очищаем диапазон дат (чтобы не было конфликта)
  const handleMonthChange = (val: string) => {
    setSelectedMonth(val);
    if (val) {
      setStartDate('');
      setEndDate('');
    }
  };

  const timeOptions: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

  const inputStyles =
    'w-full mt-1 px-3 py-2 bg-gray-700/40 text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all border border-gray-600/30';
  const selectStyles =
    'w-full px-3 py-2 bg-gray-700/40 text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all border border-gray-600/30 appearance-none cursor-pointer';

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
        fixed top-0 left-0 h-full bg-gradient-to-b from-gray-800/95 to-gray-900/95 backdrop-blur-xl z-50 
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 shadow-2xl shadow-emerald-500/10' : '-translate-x-full'}
        w-80 overflow-y-auto border-r border-gray-700/30
      `}
      >
        <div className="p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Фильтры</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors lg:hidden"
            >
              <X size={24} />
            </button>
          </div>

          {/* Сезоны */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('season')}
              className="flex items-center justify-between w-full text-left text-white p-3 bg-gray-700/30 hover:bg-gray-700/40 rounded-2xl transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <Award className="text-amber-400" size={18} />
                <span className="font-medium">🏆 Сезон</span>
              </div>
              {sections.season ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {sections.season && (
              <div className="mt-2 p-3 bg-gray-700/20 rounded-2xl">
                <div className="space-y-2">
                  <label className="flex items-center p-2 hover:bg-gray-600/20 rounded-xl cursor-pointer transition-all">
                    <input
                      type="radio"
                      checked={selectedSeason === '2024-2025'}
                      onChange={() => handleSeasonChange('2024-2025')}
                      className="mr-3 w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600"
                    />
                    <span className="text-gray-200">Сезон 2024-2025</span>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-600/20 rounded-xl cursor-pointer transition-all opacity-50">
                    <input
                      type="radio"
                      checked={selectedSeason === '2025-2026'}
                      onChange={() => handleSeasonChange('2025-2026')}
                      disabled
                      className="mr-3 w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600"
                    />
                    <span className="text-gray-400">Сезон 2025-2026 (скоро)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Турниры */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('tournaments')}
              className="flex items-center justify-between w-full text-left text-white p-3 bg-gray-700/30 hover:bg-gray-700/40 rounded-2xl transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">🏀 Турниры</span>
              </div>
              {sections.tournaments ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {sections.tournaments && (
              <div className="mt-2 p-3 bg-gray-700/20 rounded-2xl">
                <div className="mb-3 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Поиск турниров..."
                    value={tournamentSearch}
                    onChange={(e) => setTournamentSearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-700/40 text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all border border-gray-600/30"
                  />
                </div>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={selectAllTournaments}
                    className="flex-1 px-3 py-1.5 bg-emerald-600/80 text-white rounded-xl text-sm hover:bg-emerald-500 transition-all duration-200"
                  >
                    Выбрать всё
                  </button>
                  <button
                    onClick={deselectAllTournaments}
                    className="flex-1 px-3 py-1.5 bg-gray-600/50 text-white rounded-xl text-sm hover:bg-gray-600/70 transition-all duration-200"
                  >
                    Снять всё
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                  {filteredTournaments.map((tournament) => (
                    <label key={tournament} className="flex items-center p-2 hover:bg-gray-600/20 rounded-xl cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={selectedTournaments.includes(tournament)}
                        onChange={() => toggleTournament(tournament)}
                        className="mr-3 w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded-full focus:ring-emerald-500"
                      />
                      <span className="text-gray-300 text-sm">{tournament}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Даты */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('dates')}
              className="flex items-center justify-between w-full text-left text-white p-3 bg-gray-700/30 hover:bg-gray-700/40 rounded-2xl transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">📅 Даты</span>
              </div>
              {sections.dates ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {sections.dates && (
              <div className="mt-2 p-3 bg-gray-700/20 rounded-2xl">
                <div className="mb-3">
                  <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Дата начала</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={minDate || undefined}
                    max={maxDate || undefined}
                    className={inputStyles}
                  />
                </div>
                <div className="mb-3">
                  <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Дата окончания</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={minDate || undefined}
                    max={maxDate || undefined}
                    className={inputStyles}
                  />
                </div>

                <button
                  onClick={handleResetDates}
                  className="mt-1 w-full px-3 py-2 bg-gray-700/50 text-gray-300 rounded-xl text-sm hover:bg-gray-700/70 transition-all duration-200"
                >
                  Сбросить даты
                </button>
              </div>
            )}
          </div>

          {/* Время */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('time')}
              className="flex items-center justify-between w-full text-left text-white p-3 bg-gray-700/30 hover:bg-gray-700/40 rounded-2xl transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">⏰ Время</span>
              </div>
              {sections.time ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {sections.time && (
              <div className="mt-2 p-3 bg-gray-700/20 rounded-2xl">
                <div className="mb-3">
                  <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Время от</label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={selectStyles}
                  >
                    <option value="">--:--</option>
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Время до</label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={selectStyles}
                  >
                    <option value="">--:--</option>
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Месяц */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('month')}
              className="flex items-center justify-between w-full text-left text-white p-3 bg-gray-700/30 hover:bg-gray-700/40 rounded-2xl transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">📆 Месяц</span>
              </div>
              {sections.month ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {sections.month && (
              <div className="mt-2 p-3 bg-gray-700/20 rounded-2xl">
                <select
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className={selectStyles}
                >
                  <option value="">Все месяцы</option>
                  {availableMonths.map((month) => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Тип ставки */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('betType')}
              className="flex items-center justify-between w-full text-left text-white p-3 bg-gray-700/30 hover:bg-gray-700/40 rounded-2xl transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">📊 Ставка</span>
              </div>
              {sections.betType ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {sections.betType && (
              <div className="mt-2 p-3 bg-gray-700/20 rounded-2xl">
                <select
                  value={betType}
                  onChange={(e) => setBetType(e.target.value as any)}
                  className={selectStyles}
                >
                  <option value="all">Все</option>
                  <option value="OVER">OVER</option>
                  <option value="UNDER">UNDER</option>
                </select>
              </div>
            )}
          </div>

          {/* Вид ставки */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('premium')}
              className="flex items-center justify-between w-full text-left text-white p-3 bg-gray-700/30 hover:bg-gray-700/40 rounded-2xl transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">👑 Вид ставки</span>
              </div>
              {sections.premium ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {sections.premium && (
              <div className="mt-2 p-3 bg-gray-700/20 rounded-2xl">
                <select
                  value={isPremium}
                  onChange={(e) => setIsPremium(e.target.value as any)}
                  className={selectStyles}
                >
                  <option value="all">Все</option>
                  <option value="premium">Премиум</option>
                  <option value="regular">Обычные</option>
                </select>
              </div>
            )}
          </div>

          {/* Результат */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('result')}
              className="flex items-center justify-between w-full text-left text-white p-3 bg-gray-700/30 hover:bg-gray-700/40 rounded-2xl transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">🎯 Результат</span>
              </div>
              {sections.result ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {sections.result && (
              <div className="mt-2 p-3 bg-gray-700/20 rounded-2xl">
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value as any)}
                  className={selectStyles}
                >
                  <option value="all">Все</option>
                  <option value="WIN">WIN</option>
                  <option value="LOSE">LOSE</option>
                </select>
              </div>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex gap-3">
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-200 shadow-lg shadow-emerald-500/25"
            >
              Применить фильтры
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3 bg-gray-700/50 text-gray-300 rounded-2xl font-medium hover:bg-gray-700/70 transition-all duration-200"
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FiltersSidebar;
