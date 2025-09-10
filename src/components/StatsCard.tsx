// src/components/StatsCard.tsx
import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Activity,
  DollarSign,
  Target,
} from 'lucide-react';

type Stats = {
  totalProfit: number;   // прибыль за выбранный период
  roi: number;           // эффективность, %
  wins: number;          // побед
  losses: number;        // поражений
  winRate?: number;      // точность, %
  currentBank: number;   // текущий банк (фиксированный)
};

interface Props {
  stats: Stats;
}

const formatNum = (n: number, frac = 2) =>
  (n ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: n % 1 === 0 ? 0 : Math.min(frac, 2),
    maximumFractionDigits: frac,
  });

const StatsCard: React.FC<Props> = ({ stats }) => {
  const profit = Number(stats.totalProfit ?? 0);
  const isProfitPositive = profit >= 0;
  const ArrowIcon = isProfitPositive ? TrendingUp : TrendingDown;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
      {/* Прибыль (динамичная стрелка) */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/40 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">Прибыль</span>
          <ArrowIcon
            size={18}
            className={isProfitPositive ? 'text-emerald-400' : 'text-rose-400'}
            aria-label={isProfitPositive ? 'profit up' : 'profit down'}
          />
        </div>
        <div
          className={`text-3xl font-bold ${
            isProfitPositive ? 'text-emerald-300' : 'text-rose-300'
          }`}
        >
          {isProfitPositive ? '' : '-'}
          {formatNum(Math.abs(profit))}
        </div>
        <div className="text-xs text-gray-400 mt-1">за выбранный период</div>
      </div>

      {/* ROI */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/40 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">ROI</span>
          <Percent size={18} className="text-indigo-300" />
        </div>
        <div className="text-3xl font-bold text-indigo-200">
          {formatNum(Number(stats.roi ?? 0), 1)}%
        </div>
        <div className="text-xs text-gray-400 mt-1">эффективность</div>
      </div>

      {/* Результаты */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/40 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">Результаты</span>
          <Target size={18} className="text-cyan-300" />
        </div>
        <div className="text-3xl font-bold text-cyan-200">
          {formatNum(Number(stats.wins || 0), 0)} / {formatNum(Number(stats.losses || 0), 0)}
        </div>
        <div className="text-xs text-gray-400 mt-1">победы / поражения</div>
      </div>

      {/* Точность */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/40 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">WinRate</span>
          <Activity size={18} className="text-amber-300" />
        </div>
        <div className="text-3xl font-bold text-amber-200">
          {formatNum(Number(stats.winRate ?? 0), 2)}%
        </div>
        <div className="text-xs text-gray-400 mt-1">точность</div>
      </div>

      {/* Банк */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/40 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">Банк</span>
          <DollarSign size={18} className="text-emerald-300" />
        </div>
        <div className="text-3xl font-bold text-emerald-200">
          ${formatNum(Number(stats.currentBank ?? 0), 2)}
        </div>
        <div className="text-xs text-gray-400 mt-1">текущий банк</div>
      </div>
    </div>
  );
};

export default StatsCard;
