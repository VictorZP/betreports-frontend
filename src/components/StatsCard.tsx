// src/components/StatsCard.tsx
import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Target,
  Activity,
  DollarSign,
} from 'lucide-react';

type Stats = {
  totalProfit: number;
  roi: number;
  wins: number;
  losses: number;
  currentBank: number;
};

interface Props {
  stats: Stats;
}

const fmtMoney = (n: number) =>
  (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

const fmtNumber = (n: number) =>
  n.toLocaleString('en-US', { maximumFractionDigits: 0 });

const fmtPercent = (n: number) =>
  `${(Math.round(n * 10) / 10).toFixed(1)}%`;

export default function StatsCard({ stats }: Props) {
  const profit = Number(stats?.totalProfit ?? 0);
  const roi = Number(stats?.roi ?? 0);
  const wins = Number(stats?.wins ?? 0);
  const losses = Number(stats?.losses ?? 0);
  const bank = Number(stats?.currentBank ?? 0);

  const profitPositive = profit >= 0;
  const roiPositive = roi >= 0;

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-5 mb-6">
      {/* Profit */}
      <div className={`rounded-2xl border backdrop-blur p-5 md:p-6 shadow-sm
        ${profitPositive
          ? 'from-emerald-700/25 to-emerald-600/10 border-emerald-500/30 bg-gradient-to-br'
          : 'from-rose-700/25 to-rose-600/10 border-rose-500/30 bg-gradient-to-br'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300/80">Прибыль</div>
          {profitPositive ? (
            <TrendingUp className="text-emerald-400" size={20} />
          ) : (
            <TrendingDown className="text-rose-400" size={20} />
          )}
        </div>
        <div className={`mt-3 text-3xl font-semibold
          ${profitPositive ? 'text-emerald-300' : 'text-rose-300'}`}
        >
          {fmtMoney(profit)}
        </div>
        <div className="text-xs mt-1 text-gray-400">за выбранный период</div>
      </div>

      {/* ROI — динамический цвет */}
      <div className={`rounded-2xl border backdrop-blur p-5 md:p-6 shadow-sm
        ${roiPositive
          ? 'from-emerald-700/20 to-emerald-600/5 border-emerald-500/25 bg-gradient-to-br'
          : 'from-rose-700/20 to-rose-600/5 border-rose-500/25 bg-gradient-to-br'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300/80">ROI</div>
          <Percent className={`${roiPositive ? 'text-emerald-400' : 'text-rose-400'}`} size={20} />
        </div>
        <div className={`mt-3 text-3xl font-semibold
          ${roiPositive ? 'text-emerald-300' : 'text-rose-300'}`}
        >
          {fmtPercent(roi)}
        </div>
        <div className="text-xs mt-1 text-gray-400">эффективность</div>
      </div>

      {/* Results */}
      <div className="rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-700/20 to-indigo-600/5 backdrop-blur p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300/80">Результаты</div>
          <Target className="text-indigo-300" size={20} />
        </div>
        <div className="mt-3 text-3xl font-semibold text-indigo-200">
          {fmtNumber(wins)} <span className="text-gray-400">/</span> {fmtNumber(losses)}
        </div>
        <div className="text-xs mt-1 text-gray-400">победы / поражения</div>
      </div>

      {/* WinRate */}
      <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-700/20 to-amber-600/5 backdrop-blur p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300/80">WinRate</div>
          <Activity className="text-amber-300" size={20} />
        </div>
        <div className="mt-3 text-3xl font-semibold text-amber-200">
          {fmtPercent((wins + losses) ? (wins / (wins + losses)) * 100 : 0)}
        </div>
        <div className="text-xs mt-1 text-gray-400">точность</div>
      </div>

      {/* Bank (фиксированный) */}
      <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-700/20 to-emerald-600/5 backdrop-blur p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300/80">Банк</div>
          <DollarSign className="text-emerald-300" size={20} />
        </div>
        <div className="mt-3 text-3xl font-semibold text-emerald-200">
          {fmtMoney(bank)}
        </div>
        <div className="text-xs mt-1 text-gray-400">текущий банк</div>
      </div>
    </div>
  );
}
