// src/components/NominalsTable.tsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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
  const [open, setOpen] = useState<Record<number, boolean>>({}); // какие периоды раскрыты

  const toggle = (idx: number) =>
    setOpen((s) => ({ ...s, [idx]: !s[idx] }));

  const fmtNum = (n: number) =>
    new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(n);

  const fmtMoney = (n: number) =>
    (n >= 0 ? '$' : '-$') + fmtNum(Math.abs(n));

  const fmtDate = (iso: string) => {
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return iso;
    return `${d}.${m}.${y}`;
  };

  if (!periods || periods.length === 0) return null;

  return (
    <div className="w-full">
      {/* Mobile: аккордеон */}
      <div className="md:hidden space-y-3">
        {periods.map((p, idx) => {
          const isOpen = !!open[idx];
          const profitColor = p.profit >= 0 ? 'text-emerald-300' : 'text-rose-300';

          return (
            <div
              key={idx}
              className="rounded-2xl border border-gray-700/40 bg-gray-800/40 overflow-hidden"
            >
              {/* Заголовок периода */}
              <button
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between p-4 text-gray-200"
                aria-expanded={isOpen}
                aria-controls={`period-${idx}`}
              >
                <div className="text-sm">
                  <span className="text-gray-300/90 font-medium">Период:</span>{' '}
                  {fmtDate(p.start)} — {fmtDate(p.end)}
                </div>
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Контент периода */}
              {isOpen && (
                <div id={`period-${idx}`} className="px-4 pb-4">
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
                      <div className="text-base text-gray-100 mt-1">
                        {fmtNum(p.wins)} / {fmtNum(p.losses)}
                      </div>
                    </div>

                    <div className="rounded-xl bg-gray-800/50 border border-gray-700/40 p-3 col-span-2">
                      <div className="text-xs text-gray-400 uppercase">Профит</div>
                      <div className={`text-base mt-1 ${profitColor}`}>{fmtMoney(p.profit)}</div>
                    </div>
                  </div>
                </div>
              )}
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
