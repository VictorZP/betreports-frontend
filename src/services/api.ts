// src/services/api.ts
import axios from 'axios';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// helper для querystring
function toQuery(params: Record<string, any> = {}) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') p.append(k, String(v));
  });
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

const betApi = {
  // NB: обязательно прокидываем season
  async getBets(filters: any = {}) {
    const res = await api.get(`/bets${toQuery(filters)}`);
    return res.data;
  },

  async getStats(filters: any = {}) {
    const res = await api.get(`/stats${toQuery(filters)}`);
    return res.data;
  },

  async getTournaments() {
    const res = await api.get(`/tournaments`);
    return res.data;
  },

  // локальный админ-синк (на проде кнопки нет — и вызова тоже не будет)
  async syncNotionData(season: string) {
    const token = process.env.NEXT_PUBLIC_ADMIN_TOKEN; // локально можешь задать, на проде — не нужно
    const headers: Record<string, string> = {};
    if (token) headers['X-ADMIN-TOKEN'] = token;

    const res = await api.post(`/sync${toQuery({ season })}`, null, { headers });
    return res.data;
  },
};

export default betApi;
