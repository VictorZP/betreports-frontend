// src/components/NominalsTable.tsx
import React from 'react';

type PeriodRow = {
  start: string;      // 'YYYY-MM-DD'
  end: string;        // 'YYYY-MM-DD'
  nominal: number;
  bank: number;
  bets: number;
  wins: number;
  losses: number;
  profit: number;
};

export default function NominalsTable({ periods }: { periods: PeriodRow[] }) {
  const fmtNum = (n: number) =>
    new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(n);

  const fmtMoney = (n: number) =>
    (n >= 0 ? '$' : '-$') +
    fmtNum(Math.abs(n));

  const fmtDate = (iso: string) => {
    // ожидаем YYYY-MM-DD -> DD.MM.YYYY
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return iso;
    return `${d}.${m}.${y}`;
  };

  if (!periods || periods.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Mobile: карточки */}
      <div className="md:hidden space-y-3">
        {periods.map((p, idx) => {
          const wl = `${p.wins} / ${p.losses}`;
          const profitColor = p.profit >= 0 ? 'text-emerald-300' : 'text-rose-300';
          return (
            <div
              key={idx}
              className="rounded-2xl border border-gray-700/40 bg-gray-800/40 p-4 shadow-sm"
            >
              <div className="text-sm text-gray-300/90 mb-2">
                <span className="font-medium">Период:</span>{' '}
                {fmtDate(p.start)} — {fmtDate(p.end)}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-800/50 border border-gray-700/40 p-3">
                  <div className="text-xs text-gray-400 uppercase">Номинал</div>
                  <div className="text-base text-gray-100 mt-1">{fmtNum(p.nominal)}</div>
                </div>

                <div className="rounded-xl bg-gray-800/50 border border-gray-700/40 p-3">
                  <div className="text-xs text-gray-400 uppercase">Банк</div>
                  <div className="text-base text-gray-100 mt-1">{fmtMoney(p.bank)}</div>
                </div>

                <div className="rounded-xl bg-gray-800/50 border border-gray-700/40 p-3">
                  <div className="text-xs text-gray-400 uppercase">Ставок</div>
                  <div className="text-base text-gray-100 mt-1">{fmtNum(p.bets)}</div>
                </div>

                <div className="rounded-xl bg-gray-800/50 border border-gray-700/40 p-3">
                  <div className="text-xs text-gray-400 uppercase">W/L</div>
                  <div className="text-base text-gray-100 mt-1">{wl}</div>
                </div>

                <div className="rounded-xl bg-gray-800/50 border border-gray-700/40 p-3 col-span-2">
                  <div className="text-xs text-gray-400 uppercase">Профит</div>
                  <div className={`text-base mt-1 ${profitColor}`}>{fmtMoney(p.profit)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: таблица */}
      <div className="hidden md:block">
        <div className="w-full overflow-x-auto rounded-2xl border border-gray-700/40 bg-gray-800/30">
          <table className="min-w-full text-sm text-gray-200">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700/40">
                <th className="px-4 py-3">Период</th>
                <th className="px-4 py-3">Номинал</th>
                <th className="px-4 py-3">Банк</th>
                <th className="px-4 py-3">Ставок</th>
                <th className="px-4 py-3">W/L</th>
                <th className="px-4 py-3">Профит</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p, idx) => {
                const profitColor = p.profit >= 0 ? 'text-emerald-300' : 'text-rose-300';
                return (
                  <tr key={idx} className="border-b border-gray-700/30 last:border-b-0">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {fmtDate(p.start)} — {fmtDate(p.end)}
                    </td>
                    <td className="px-4 py-3">{fmtNum(p.nominal)}</td>
                    <td className="px-4 py-3">{fmtMoney(p.bank)}</td>
                    <td className="px-4 py-3">{fmtNum(p.bets)}</td>
                    <td className="px-4 py-3">
                      {fmtNum(p.wins)} / {fmtNum(p.losses)}
                    </td>
                    <td className={`px-4 py-3 ${profitColor}`}>{fmtMoney(p.profit)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
