import axios from 'axios';
import { Bet } from '@/types/bet';

const API_BASE_URL = 'http://localhost:8000/api';

export const betApi = {
    getBets: async (params?: any): Promise<Bet[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/bets`, { params });
            return response.data || [];
        } catch (error) {
            console.error('Error fetching bets:', error);
            return [];
        }
    },

    getStats: async (params?: any) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/stats`, { params });
            return response.data || {
                totalBets: 0,
                winRate: 0,
                totalProfit: 0,
                roi: 0,
                wins: 0,
                losses: 0,
                currentNominal: 100,
                currentBank: 2000,
            };
        } catch (error) {
            console.error('Error fetching stats:', error);
            return {
                totalBets: 0,
                winRate: 0,
                totalProfit: 0,
                roi: 0,
                wins: 0,
                losses: 0,
                currentNominal: 100,
                currentBank: 2000,
            };
        }
    },

    syncWithNotion: async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/sync`);
            return response.data;
        } catch (error) {
            console.error('Error syncing with Notion:', error);
            throw error;
        }
    },

    getTournaments: async (): Promise<string[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/tournaments`);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching tournaments:', error);
            return [];
        }
    },
};