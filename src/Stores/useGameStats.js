import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGameStats = create(
    persist(
        (set, get) => ({
            // Dữ liệu thống kê cho TẤT CẢ game
            stats: {
                gamesPlayed: 0,
                totalCoins: 0,
                correctAnswers: 0,
                totalAnswers: 0,
                currentStreak: 0,
                bestStreak: 0,
                lastPlayedDate: null,
            },

            // Thống kê riêng cho từng game
            gameSpecificStats: {
                mathRace: {
                    gamesPlayed: 0,
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    totalQuestions: 0,
                    correctAnswers: 0,
                    bestScore: 0,
                    totalCoinsEarned: 0,
                },
                handMath: {
                    gamesPlayed: 0,
                    totalQuestions: 0,
                    correctAnswers: 0,
                    bestScore: 0,
                    totalCoinsEarned: 0,
                },
                numberLearning: {
                    numbersLearned: [], // Mảng các số đã học [0-9]
                    coinsEarned: 0,
                    completedAll: false,
                }
            },

            // === HÀNH ĐỘNG CHUNG ===
            incrementGamesPlayed: () => set((state) => ({
                stats: { ...state.stats, gamesPlayed: state.stats.gamesPlayed + 1 }
            })),

            addCoins: (amount) => set((state) => ({
                stats: { ...state.stats, totalCoins: state.stats.totalCoins + amount }
            })),

            recordAnswer: (isCorrect) => set((state) => ({
                stats: {
                    ...state.stats,
                    totalAnswers: state.stats.totalAnswers + 1,
                    correctAnswers: isCorrect ? state.stats.correctAnswers + 1 : state.stats.correctAnswers
                }
            })),

            updateStreak: () => {
                const today = new Date().toDateString();
                const { lastPlayedDate, currentStreak, bestStreak } = get().stats;
                let newStreak = currentStreak;

                if (lastPlayedDate === today) {
                    return;
                } else if (lastPlayedDate && new Date(lastPlayedDate).getTime() === new Date(today).getTime() - 86400000) {
                    newStreak++;
                } else {
                    newStreak = 1;
                }

                set((state) => ({
                    stats: {
                        ...state.stats,
                        currentStreak: newStreak,
                        bestStreak: Math.max(newStreak, bestStreak),
                        lastPlayedDate: today
                    }
                }));
            },

            // === HÀNH ĐỘNG CHO MATH RACE GAME ===
            recordMathRaceGame: (result, questions, correct, coinsEarned) => set((state) => ({
                gameSpecificStats: {
                    ...state.gameSpecificStats,
                    mathRace: {
                        ...state.gameSpecificStats.mathRace,
                        gamesPlayed: state.gameSpecificStats.mathRace.gamesPlayed + 1,
                        wins: result === 'win' ? state.gameSpecificStats.mathRace.wins + 1 : state.gameSpecificStats.mathRace.wins,
                        losses: result === 'lose' ? state.gameSpecificStats.mathRace.losses + 1 : state.gameSpecificStats.mathRace.losses,
                        draws: result === 'draw' ? state.gameSpecificStats.mathRace.draws + 1 : state.gameSpecificStats.mathRace.draws,
                        totalQuestions: state.gameSpecificStats.mathRace.totalQuestions + questions,
                        correctAnswers: state.gameSpecificStats.mathRace.correctAnswers + correct,
                        bestScore: Math.max(state.gameSpecificStats.mathRace.bestScore, correct),
                        totalCoinsEarned: state.gameSpecificStats.mathRace.totalCoinsEarned + coinsEarned,
                    }
                }
            })),

            addRaceWin: () => set((state) => ({
                gameSpecificStats: {
                    ...state.gameSpecificStats,
                    mathRace: {
                        ...state.gameSpecificStats.mathRace,
                        wins: state.gameSpecificStats.mathRace.wins + 1
                    }
                }
            })),

            // === HÀNH ĐỘNG CHO HAND MATH GAME ===
            recordHandMathGame: (questions, correct, coinsEarned) => set((state) => ({
                gameSpecificStats: {
                    ...state.gameSpecificStats,
                    handMath: {
                        ...state.gameSpecificStats.handMath,
                        gamesPlayed: state.gameSpecificStats.handMath.gamesPlayed + 1,
                        totalQuestions: state.gameSpecificStats.handMath.totalQuestions + questions,
                        correctAnswers: state.gameSpecificStats.handMath.correctAnswers + correct,
                        bestScore: Math.max(state.gameSpecificStats.handMath.bestScore, correct),
                        totalCoinsEarned: state.gameSpecificStats.handMath.totalCoinsEarned + coinsEarned,
                    }
                }
            })),

            // === HÀNH ĐỘNG CHO NUMBER LEARNING ===
            markNumberLearned: (number) => set((state) => {
                const numbers = [...new Set([...state.gameSpecificStats.numberLearning.numbersLearned, number])];
                const completedAll = numbers.length >= 10;

                return {
                    gameSpecificStats: {
                        ...state.gameSpecificStats,
                        numberLearning: {
                            ...state.gameSpecificStats.numberLearning,
                            numbersLearned: numbers,
                            completedAll: completedAll
                        }
                    }
                };
            }),

            addNumberLearningCoins: (amount) => set((state) => ({
                gameSpecificStats: {
                    ...state.gameSpecificStats,
                    numberLearning: {
                        ...state.gameSpecificStats.numberLearning,
                        coinsEarned: state.gameSpecificStats.numberLearning.coinsEarned + amount
                    }
                }
            })),

            // === HÀNH ĐỘNG TÍNH TOÁN ===


            getHandMathProgress: () => {
                const store = get();
                const { totalQuestions, correctAnswers } = store.gameSpecificStats.handMath;
                return totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
            },

            getMathRaceWinRate: () => {
                const store = get();
                const { wins, gamesPlayed } = store.gameSpecificStats.mathRace;

                // Validation: đảm bảo không bị số chia 0 và wins không lớn hơn gamesPlayed
                if (gamesPlayed === 0) return 0;
                if (wins > gamesPlayed) {
                    console.error('Data error: wins > gamesPlayed', { wins, gamesPlayed });
                    return 100; // Hoặc trả về gamesPlayed nếu muốn sửa tự động
                }

                return Math.round((wins / gamesPlayed) * 100);
            },

            getMathRaceAccuracy: () => {
                const store = get();
                const { totalQuestions, correctAnswers } = store.gameSpecificStats.mathRace;
                return totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
            },

            // Reset tất cả stats (cho testing)
            resetStats: () => set({
                stats: {
                    gamesPlayed: 0,
                    totalCoins: 0,
                    correctAnswers: 0,
                    totalAnswers: 0,
                    currentStreak: 0,
                    bestStreak: 0,
                    lastPlayedDate: null,
                },
                gameSpecificStats: {
                    mathRace: {
                        gamesPlayed: 0,
                        wins: 0,
                        losses: 0,
                        draws: 0,
                        totalQuestions: 0,
                        correctAnswers: 0,
                        bestScore: 0,
                        totalCoinsEarned: 0,
                    },
                    handMath: {
                        gamesPlayed: 0,
                        totalQuestions: 0,
                        correctAnswers: 0,
                        bestScore: 0,
                        totalCoinsEarned: 0,
                    },

                }
            }),
        }),
        {
            name: 'game-stats-storage',
        }
    )
);