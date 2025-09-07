export interface Bet {
    id: number;
    date: string | null;
    team1: string | null;
    team2: string | null;
    tournament: string | null;
    bet_type: string | null;
    total_value: number | null;
    game_score: string | null;
    result: string | null;
    profit: number | null;
    nominal: number | null;
    bank: number | null;
    is_premium: boolean;
    screenshot: string | null;  // Добавляем поле для скриншота
    created_at: string;
    updated_at: string;
}