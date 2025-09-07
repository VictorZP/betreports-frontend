import { create } from 'zustand';
import { Bet } from '@/types/bet';

interface Stats {
    totalBets: number;
    winRate: number;
    totalProfit: number;
    roi: number;
    wins: number;
    losses: number;
    currentNominal: number;
    currentBank: number;
}

interface BetStore {
    bets: Bet[];
    stats: Stats;
    loading: boolean;
    filters: {
        startDate: string;
        endDate: string;
        betType: string;
        isPremium: string;
        tournaments: string[];
    };
    setBets: (bets: Bet[]) => void;
    setStats: (stats: Stats) => void;
    setLoading: (loading: boolean) => void;
    setFilters: (filters: any) => void;
}

export const useStore = create<BetStore>((set) => ({
    bets: [],
    stats: {
        totalBets: 0,
        winRate: 0,
        totalProfit: 0,
        roi: 0,
        wins: 0,
        losses: 0,
        currentNominal: 100,
        currentBank: 2000,
    },
    loading: false,
    filters: {
        startDate: '',
        endDate: '',
        betType: '',
        isPremium: '',
        tournaments: [],
    },
    setBets: (bets) => set({ bets }),
    setStats: (stats) => set({ stats }),
    setLoading: (loading) => set({ loading }),
    setFilters: (filters) => set({ filters }),
}));