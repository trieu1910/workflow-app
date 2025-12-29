import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const useWellbeingStore = create(
    persist(
        (set, get) => ({
            // Daily check-ins: { date: { mood, energy, gratitude[], reflection } }
            dailyCheckIns: {},

            // Weekly commitments: { weekId: { commitments: [], reflection } }
            weeklyCommitments: {},

            // Journal entries
            journalEntries: [],

            // ========== DAILY CHECK-IN ==========
            saveDailyCheckIn: (data) => {
                const today = new Date().toISOString().split('T')[0];
                set((state) => ({
                    dailyCheckIns: {
                        ...state.dailyCheckIns,
                        [today]: {
                            ...state.dailyCheckIns[today],
                            ...data,
                            updatedAt: new Date().toISOString(),
                        },
                    },
                }));
            },

            getTodayCheckIn: () => {
                const today = new Date().toISOString().split('T')[0];
                return get().dailyCheckIns[today] || null;
            },

            getCheckIn: (date) => {
                return get().dailyCheckIns[date] || null;
            },

            // ========== MOOD & ENERGY ==========
            setMood: (mood) => { // 1-5 scale
                get().saveDailyCheckIn({ mood });
            },

            setEnergy: (energy) => { // 1-5 scale
                get().saveDailyCheckIn({ energy });
            },

            // Get average mood/energy for last N days
            getAverageMood: (days = 7) => {
                const checkIns = get().dailyCheckIns;
                const today = new Date();
                let total = 0;
                let count = 0;

                for (let i = 0; i < days; i++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    if (checkIns[dateStr]?.mood) {
                        total += checkIns[dateStr].mood;
                        count++;
                    }
                }

                return count > 0 ? Math.round((total / count) * 10) / 10 : null;
            },

            getAverageEnergy: (days = 7) => {
                const checkIns = get().dailyCheckIns;
                const today = new Date();
                let total = 0;
                let count = 0;

                for (let i = 0; i < days; i++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    if (checkIns[dateStr]?.energy) {
                        total += checkIns[dateStr].energy;
                        count++;
                    }
                }

                return count > 0 ? Math.round((total / count) * 10) / 10 : null;
            },

            // ========== GRATITUDE ==========
            addGratitude: (text) => {
                const today = new Date().toISOString().split('T')[0];
                const current = get().dailyCheckIns[today]?.gratitude || [];
                get().saveDailyCheckIn({
                    gratitude: [...current, { id: generateId(), text, createdAt: new Date().toISOString() }],
                });
            },

            getTodayGratitude: () => {
                const today = new Date().toISOString().split('T')[0];
                return get().dailyCheckIns[today]?.gratitude || [];
            },

            // ========== WEEKLY COMMITMENT ==========
            getWeekId: (date = new Date()) => {
                const d = new Date(date);
                d.setHours(0, 0, 0, 0);
                d.setDate(d.getDate() - d.getDay()); // Start of week (Sunday)
                return d.toISOString().split('T')[0];
            },

            setWeeklyCommitment: (commitment) => {
                const weekId = get().getWeekId();
                const current = get().weeklyCommitments[weekId]?.commitments || [];
                set((state) => ({
                    weeklyCommitments: {
                        ...state.weeklyCommitments,
                        [weekId]: {
                            ...state.weeklyCommitments[weekId],
                            commitments: [...current, {
                                id: generateId(),
                                text: commitment,
                                completed: false,
                                createdAt: new Date().toISOString(),
                            }],
                        },
                    },
                }));
            },

            toggleCommitment: (commitmentId) => {
                const weekId = get().getWeekId();
                const current = get().weeklyCommitments[weekId];
                if (!current) return;

                set((state) => ({
                    weeklyCommitments: {
                        ...state.weeklyCommitments,
                        [weekId]: {
                            ...current,
                            commitments: current.commitments.map(c =>
                                c.id === commitmentId ? { ...c, completed: !c.completed } : c
                            ),
                        },
                    },
                }));
            },

            getCurrentWeekCommitments: () => {
                const weekId = get().getWeekId();
                return get().weeklyCommitments[weekId]?.commitments || [];
            },

            // ========== WEEKLY REFLECTION ==========
            setWeeklyReflection: (reflection) => {
                const weekId = get().getWeekId();
                set((state) => ({
                    weeklyCommitments: {
                        ...state.weeklyCommitments,
                        [weekId]: {
                            ...state.weeklyCommitments[weekId],
                            reflection: {
                                ...reflection,
                                updatedAt: new Date().toISOString(),
                            },
                        },
                    },
                }));
            },

            getCurrentWeekReflection: () => {
                const weekId = get().getWeekId();
                return get().weeklyCommitments[weekId]?.reflection || null;
            },

            // ========== JOURNAL ==========
            addJournalEntry: (entry) => {
                const newEntry = {
                    id: generateId(),
                    title: entry.title || '',
                    content: entry.content,
                    mood: entry.mood || null,
                    tags: entry.tags || [],
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({
                    journalEntries: [newEntry, ...state.journalEntries],
                }));
                return newEntry;
            },

            getRecentJournalEntries: (limit = 10) => {
                return get().journalEntries.slice(0, limit);
            },

            // ========== PEAK HOURS ANALYSIS ==========
            // This would analyze when user completes most tasks
            // For now, just a placeholder
            getPeakHours: () => {
                // Would need to analyze task completedAt timestamps
                return { morning: 30, afternoon: 45, evening: 25 };
            },
        }),
        {
            name: 'workflow-wellbeing',
        }
    )
);

// Mood/Energy emoji helpers
export const MOOD_LEVELS = {
    1: { emoji: '😢', label: 'Rất tệ', color: '#ef4444' },
    2: { emoji: '😔', label: 'Không tốt', color: '#f97316' },
    3: { emoji: '😐', label: 'Bình thường', color: '#eab308' },
    4: { emoji: '🙂', label: 'Tốt', color: '#22c55e' },
    5: { emoji: '😄', label: 'Tuyệt vời', color: '#10b981' },
};

export const ENERGY_LEVELS = {
    1: { emoji: '🔋', label: 'Kiệt sức', color: '#ef4444', fill: 20 },
    2: { emoji: '🔋', label: 'Mệt mỏi', color: '#f97316', fill: 40 },
    3: { emoji: '🔋', label: 'Ổn', color: '#eab308', fill: 60 },
    4: { emoji: '🔋', label: 'Năng động', color: '#22c55e', fill: 80 },
    5: { emoji: '🔋', label: 'Tràn đầy', color: '#10b981', fill: 100 },
};
