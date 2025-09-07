import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Target, DollarSign, Percent, Activity } from 'lucide-react';
import axios from 'axios';

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
  const [currentBank, setCurrentBank] = useState(2000);
  const isPositiveROI = stats.roi > 0;
  const isPositiveProfit = stats.totalProfit > 0;

  useEffect(() => {
    // Получаем текущий банк без фильтров
    fetchCurrentBank();
  }, []);

  const fetchCurrentBank = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/stats');
      if (response.data && response.data.currentBank) {
        setCurrentBank(response.data.currentBank);
      }
    } catch (error) {
      console.error('Error fetching current bank:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {/* Total Bets Card */}
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg p-5 rounded-2xl border border-gray-700/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-3">
          <Activity className="text-emerald-400" size={24} />
          <span className="text-xs text-gray-500 font-medium">Всего</span>
        </div>
        <div className="text-3xl font-bold text-white mb-1">{stats.totalBets || 0}</div>
        <div className="text-sm text-gray-400">матчей</div>
      </div>
      
      {/* Win Rate Card */}
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg p-5 rounded-2xl border border-gray-700/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-3">
          <Target className="text-blue-400" size={24} />
          <span className="text-xs text-gray-500 font-medium">Точность</span>
        </div>
        <div className="text-3xl font-bold text-white mb-1">
          {stats.winRate || 0}%
        </div>
        <div className="text-sm text-gray-400">процент побед</div>
      </div>
      
      {/* Total Profit Card */}
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg p-5 rounded-2xl border border-gray-700/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-3">
          {isPositiveProfit ? 
            <TrendingUp className="text-emerald-400" size={24} /> : 
            <TrendingDown className="text-red-400" size={24} />
          }
          <span className="text-xs text-gray-500 font-medium">Профит</span>
        </div>
        <div className={`text-3xl font-bold mb-1 ${isPositiveProfit ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositiveProfit ? '+' : ''}{stats.totalProfit?.toFixed(2) || '0.00'}$
        </div>
        <div className="text-sm text-gray-400">чистая прибыль</div>
      </div>
      
      {/* ROI Card */}
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg p-5 rounded-2xl border border-gray-700/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-3">
          <Percent className={isPositiveROI ? "text-emerald-400" : "text-red-400"} size={24} />
          <span className="text-xs text-gray-500 font-medium">ROI</span>
        </div>
        <div className={`text-3xl font-bold mb-1 ${isPositiveROI ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositiveROI ? '+' : '-'}{Math.abs(stats.roi || 0)}%
        </div>
        <div className="text-sm text-gray-400">возврат инвестиций</div>
      </div>
      
      {/* Current Bank Card - показывает рассчитанный текущий банк */}
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