import React from 'react';
import { TrendingUp, TrendingDown, Target, DollarSign, Percent, Activity } from 'lucide-react';

interface StatsCardProps {
  stats: {
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
}

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  const isPositiveROI = stats.roi > 0;
  const isPositiveProfit = stats.totalProfit > 0;
  const currentBank = Number(stats.currentBank ?? 2000);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {/* Прибыль */}
      <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 backdrop-blur-lg p-5 rounded-2xl border border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-3">
          <TrendingUp className={`${isPositiveProfit ? 'text-emerald-400' : 'text-rose-400'}`} size={24} />
          <span className="text-xs text-emerald-300/70 font-medium">Прибыль</span>
        </div>
        <div className={`text-3xl font-bold ${isPositiveProfit ? 'text-emerald-400' : 'text-rose-400'} mb-1`}>
          {stats.totalProfit.toFixed(2)}
        </div>
        <div className="text-sm text-emerald-300/70">за выбранный период</div>
      </div>

      {/* ROI */}
      <div className="bg-gradient-to-br from-indigo-900/30 to-indigo-800/20 backdrop-blur-lg p-5 rounded-2xl border border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-3">
          <Percent className={`${isPositiveROI ? 'text-indigo-400' : 'text-rose-400'}`} size={24} />
          <span className="text-xs text-indigo-300/70 font-medium">ROI</span>
        </div>
        <div className={`text-3xl font-bold ${isPositiveROI ? 'text-indigo-400' : 'text-rose-400'} mb-1`}>
          {stats.roi.toFixed(2)}%
        </div>
        <div className="text-sm text-indigo-300/70">эффективность</div>
      </div>

      {/* Победы / Поражения */}
      <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 backdrop-blur-lg p-5 rounded-2xl border border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-3">
          <Target className="text-cyan-400" size={24} />
          <span className="text-xs text-cyan-300/70 font-medium">Результаты</span>
        </div>
        <div className="text-3xl font-bold text-cyan-400 mb-1">
          {stats.wins} / {stats.losses}
        </div>
        <div className="text-sm text-cyan-300/70">победы / поражения</div>
      </div>

      {/* WinRate */}
      <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 backdrop-blur-lg p-5 rounded-2xl border border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-3">
          <Activity className="text-amber-400" size={24} />
          <span className="text-xs text-amber-300/70 font-medium">WinRate</span>
        </div>
        <div className="text-3xl font-bold text-amber-400 mb-1">
          {stats.winRate.toFixed(2)}%
        </div>
        <div className="text-sm text-amber-300/70">точность</div>
      </div>

      {/* Текущий банк */}
      <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 backdrop-blur-lg p-5 rounded-2xl border border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-3">
          <DollarSign className="text-emerald-400" size={24} />
          <span className="text-xs text-emerald-300/70 font-medium">Банк</span>
        </div>
        <div className="text-3xl font-bold text-emerald-400 mb-1">
          ${currentBank.toFixed(0)}
        </div>
        <div className="text-sm text-emerald-300/70">текущий банк</div>
      </div>
    </div>
  );
};

export default StatsCard;
