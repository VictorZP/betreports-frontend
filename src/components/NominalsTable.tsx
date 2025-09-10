'use client';

import React from 'react';

type Period = {
  start: string;    // "YYYY-MM-DD"
  end: string;      // "YYYY-MM-DD"
  month: string;    // "YYYY-MM"
  nominal: number;  // номинал периода
  bank: number;     // банк на старте периода
  bets: number;
  wins: number;
  losses: number;
  profit: number;
  staked: number;
};

function formatRangeRu(start: string, end: string) {
  const fmt = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`;
  };
  return `${fmt(start)} — ${fmt(end)}`;
}

interface Props {
  periods: Period[];
}

const NominalsTable: React.FC<Props> = ({ periods }) => {
  if (!periods || periods.length === 0) return null;

  return (
    <div className="mb-6 overflow-x-auto rounded-xl border border-gray-700/40 bg-gray-800/30 backdrop-blur">
      <table className="min-w-full divide-y divide-gray-700/50">
        <thead className="bg-gray-800/60">
          <tr className="text-left text-xs uppercase tracking-wider text-gray-300">
            <th className="px-4 py-3">Период</th>
            <th className="px-4 py-3">Номинал</th>
            <th className="px-4 py-3">Банк</th>
            <th className="px-4 py-3 hidden md:table-cell">Ставок</th>
            <th className="px-4 py-3 hidden md:table-cell">W/L</th>
            <th className="px-4 py-3 hidden lg:table-cell">Профит</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/30">
          {periods.map((p, idx) => (
            <tr key={`${p.start}-${p.end}-${idx}`} className="text-sm text-gray-200">
              <td className="px-4 py-3 whitespace-nowrap">{formatRangeRu(p.start, p.end)}</td>
              <td className="px-4 py-3">{p.nominal}</td>
              <td className="px-4 py-3">{Math.round(p.bank)}</td>
              <td className="px-4 py-3 hidden md:table-cell">{p.bets}</td>
              <td className="px-4 py-3 hidden md:table-cell">
                {p.wins}/{p.losses}
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">{p.profit.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NominalsTable;
