
import { authStore } from '@/stores/authStore';
import { Cell, SudokuDifficulty } from '@sudoecool/shared';

// const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;
const API_URL = '/api';

/**
 * Fetch wrapper with auth token
 */
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = authStore.getState().auth!.access_token;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export const gameApi = {
  /**
   * Get today's daily puzzle  
   */
  async getTodaysPuzzle(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    return fetchWithAuth(`/games/daily?difficulty=${difficulty}`);
  },

  /**
   * Save game progress (debounced on caller side)
   */
  async saveProgress(data: {
    puzzleId: string;
    grid: Cell[];
    moves: number;
    hints: number;
    timeSpent: number;
    isCompleted?: boolean;
  }) {
    console.log("Saving progress");
    return fetchWithAuth('/games/progress', {
      method: 'POST',
      body: JSON.stringify(
        data,
        // TODO: find something better, this prevent Set from being deleted
        (k, v) => v instanceof Set ? [...v] : v
      ),
    });
  },

  /**
   * Save completed game
   */
  async completeGame(data: {
    puzzleId: string;
    timeTaken: number;
    moves: number;
    hints: number;
    difficulty: SudokuDifficulty;
  }) {
    return fetchWithAuth('/games/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get game history
   */
  async getHistory() {
    return fetchWithAuth('/games/history');
  },

  /**
   * Get user stats
   */
  async getStats() {
    return fetchWithAuth('/api/games/stats');
  },
};
