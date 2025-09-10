import React, { useState } from 'react';
import { Camera, Link as LinkIcon } from 'lucide-react';
import ImageModal from './ImageModal';

// Всегда форматируем как Europe/Paris.
// Если пришла строка без часового пояса (без 'Z' или '+03:00'),
// считаем её UTC и ДОБАВЛЯЕМ 'Z', чтобы не смещалось.
const PARIS_TZ = 'Europe/Paris';

function parseAsUtc(iso?: string | null) {
  if (!iso) return null;
  const hasTz = /[zZ]|[+\-]\d\d:?\d\d/.test(iso);
  return new Date(hasTz ? iso : iso + 'Z');
}

function formatParis(iso?: string | null) {
  const d = parseAsUtc(iso);
  if (!d || isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: PARIS_TZ,
  })
    .format(d)
    .replace(',', ''); // убираем запятую между датой и временем
}


const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

interface Bet {
  id: number;
  date: string;
  tournament: string;
  match: string;
  bet_type: string;
  total_value: number;
  score: string;
  result: string;
  screenshot_url?: string;
  match_url?: string; // Изменено с match_link на match_url
}

interface BetsTableProps {
  bets: Bet[];
  loading: boolean;
  itemsPerPage: number;
}

const BetsTable: React.FC<BetsTableProps> = ({ bets, loading, itemsPerPage = 25 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const totalPages = Math.ceil(bets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedBets = bets.slice(startIndex, startIndex + itemsPerPage);

  // Функция для подсчета суммы очков из счета
  const calculateTotalPoints = (score: string): number => {
    if (!score || score === '-') return 0;

    // Убираем (ОТ) и (2ОТ) из счета
    const cleanScore = score.replace(/\s*\(.*?\)/g, '');

    // Разбиваем на команды
    const parts = cleanScore.split('-');
    if (parts.length !== 2) return 0;

    try {
      const team1Score = parseInt(parts[0].trim());
      const team2Score = parseInt(parts[1].trim());
      return team1Score + team2Score;
    } catch {
      return 0;
    }
  };

  // Функция для определения результата
  const determineResult = (bet: Bet): 'WIN' | 'LOSE' | '-' => {
    if (!bet.bet_type || !bet.total_value || !bet.score) return '-';

    const totalPoints = calculateTotalPoints(bet.score);
    if (totalPoints === 0) return '-';

    if (bet.bet_type.includes('OVER')) {
      return totalPoints > bet.total_value ? 'WIN' : 'LOSE';
    } else if (bet.bet_type.includes('UNDER')) {
      return totalPoints < bet.total_value ? 'WIN' : 'LOSE';
    }

    return '-';
  };

  const handleScreenshotClick = async (url: string) => {
    try {
      if (url.includes('prnt.sc')) {
        const response = await fetch(`${API_BASE}/screenshot?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        if (data.image_url) {
          setSelectedImage(data.image_url);
        }
      } else {
        setSelectedImage(url);
      }
    } catch (error) {
      console.error('Error loading screenshot:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700/30 shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900/50 backdrop-blur text-gray-300 text-sm">
              <th className="p-4 text-left font-medium">ДАТА</th>
              <th className="p-4 text-left font-medium">ТУРНИР</th>
              <th className="p-4 text-left font-medium">МАТЧ</th>
              <th className="p-4 text-left font-medium">СТАВКА</th>
              <th className="p-4 text-left font-medium">СЧЕТ</th>
              <th className="p-4 text-center font-medium">ОЧКИ</th>
              <th className="p-4 text-left font-medium">РЕЗУЛЬТАТ</th>
              <th className="p-4 text-center font-medium">ССЫЛКА</th>
              <th className="p-4 text-center font-medium">СКРИН</th>
            </tr>
          </thead>
          <tbody>
            {displayedBets.map((bet, index) => {
              const totalPoints = calculateTotalPoints(bet.score);
              const result = bet.result || determineResult(bet);

              return (
                <tr
                  key={bet.id}
                  className={`border-t border-gray-700/30 hover:bg-gray-700/20 transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-800/20' : 'bg-gray-900/20'
                    }`}
                >
                  <td className="p-4 text-gray-300 text-sm">
                    {new Date(bet.date).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="p-4 text-gray-300 text-sm font-medium">{bet.tournament}</td>
                  <td className="p-4 text-gray-300 text-sm">{bet.match}</td>
                  <td className="p-4">
                    <span className={`font-semibold text-sm ${bet.bet_type?.includes('OVER')
                      ? 'text-indigo-400'
                      : 'text-indigo-400'
                      }`}>
                      {bet.bet_type} {bet.total_value}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300 text-sm font-mono">{bet.score || '-'}</td>
                  <td className="p-4 text-center text-gray-200 font-semibold">
                    {totalPoints > 0 ? totalPoints : '-'}
                  </td>
                  <td className="p-4">
                    <span className={`font-bold text-sm ${result === 'WIN'
                      ? 'text-green-500'
                      : result === 'LOSE'
                        ? 'text-red-500'
                        : 'text-gray-500'
                      }`}>
                      {result === 'WIN' ? 'WIN' : result === 'LOSE' ? 'LOSE' : '-'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {bet.match_url && (
                      <a
                        href={bet.match_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-all duration-200"
                        title="Открыть ссылку на матч"
                      >
                        <LinkIcon size={18} />
                      </a>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {bet.screenshot_url && (
                      <button
                        onClick={() => handleScreenshotClick(bet.screenshot_url!)}
                        className="text-emerald-400 hover:text-emerald-300 transition-all duration-200 hover:scale-110"
                        title="Посмотреть скриншот"
                      >
                        <Camera size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {displayedBets.length === 0 && (
              <tr>
                <td colSpan={9} className="p-12 text-center text-gray-500">
                  Нет данных для отображения
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center p-4 bg-gray-900/30 backdrop-blur border-t border-gray-700/30">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-1 bg-gray-700/50 backdrop-blur text-gray-300 rounded-xl hover:bg-gray-600/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            ← Назад
          </button>
          <span className="mx-4 text-gray-300 font-medium">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-1 bg-gray-700/50 backdrop-blur text-gray-300 rounded-xl hover:bg-gray-600/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            Вперед →
          </button>
        </div>
      )}

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default BetsTable;
