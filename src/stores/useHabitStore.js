import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const useHabitStore = create(
    persist(
        (set, get) => ({
            habits: [],
            checkIns: {}, // { habitId: { 'YYYY-MM-DD': true } }

            // ========== HABITS ==========
            addHabit: (habitData) => {
                const newHabit = {
                    id: generateId(),
                    title: habitData.title,
                    description: habitData.description || '',
                    icon: habitData.icon || '✅',
                    goalId: habitData.goalId || null, // Link to goal
                    frequency: habitData.frequency || 'daily', // daily, weekly
                    targetDays: habitData.targetDays || 7, // Days per week
                    color: habitData.color || '#6366f1',
                    createdAt: new Date().toISOString(),
                    active: true,
                };
                set((state) => ({
                    habits: [newHabit, ...state.habits],
                }));
                return newHabit;
            },

            updateHabit: (habitId, updates) => {
                set((state) => ({
                    habits: state.habits.map((h) =>
                        h.id === habitId ? { ...h, ...updates } : h
                    ),
                }));
            },

            deleteHabit: (habitId) => {
                set((state) => {
                    const newCheckIns = { ...state.checkIns };
                    delete newCheckIns[habitId];
                    return {
                        habits: state.habits.filter((h) => h.id !== habitId),
                        checkIns: newCheckIns,
                    };
                });
            },

            // ========== CHECK-INS ==========
            checkIn: (habitId, date = null) => {
                const dateStr = date || new Date().toISOString().split('T')[0];
                set((state) => ({
                    checkIns: {
                        ...state.checkIns,
                        [habitId]: {
                            ...(state.checkIns[habitId] || {}),
                            [dateStr]: true,
                        },
                    },
                }));
            },

            uncheckIn: (habitId, date = null) => {
                const dateStr = date || new Date().toISOString().split('T')[0];
                set((state) => {
                    const habitCheckIns = { ...(state.checkIns[habitId] || {}) };
                    delete habitCheckIns[dateStr];
                    return {
                        checkIns: {
                            ...state.checkIns,
                            [habitId]: habitCheckIns,
                        },
                    };
                });
            },

            isCheckedIn: (habitId, date = null) => {
                const dateStr = date || new Date().toISOString().split('T')[0];
                return !!get().checkIns[habitId]?.[dateStr];
            },

            toggleCheckIn: (habitId, date = null) => {
                const dateStr = date || new Date().toISOString().split('T')[0];
                if (get().isCheckedIn(habitId, dateStr)) {
                    get().uncheckIn(habitId, dateStr);
                } else {
                    get().checkIn(habitId, dateStr);
                }
            },

            // ========== STREAK CALCULATION ==========
            getStreak: (habitId) => {
                const checkIns = get().checkIns[habitId] || {};
                const dates = Object.keys(checkIns).sort().reverse();

                if (dates.length === 0) return 0;

                let streak = 0;
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                for (let i = 0; i <= 365; i++) {
                    const checkDate = new Date(today);
                    checkDate.setDate(today.getDate() - i);
                    const dateStr = checkDate.toISOString().split('T')[0];

                    if (checkIns[dateStr]) {
                        streak++;
                    } else if (i > 0) {
                        // Allow missing today, but break on any other missing day
                        break;
                    }
                }

                return streak;
            },

            // Get weekly completion rate
            getWeeklyRate: (habitId) => {
                const checkIns = get().checkIns[habitId] || {};
                const today = new Date();
                let count = 0;

                for (let i = 0; i < 7; i++) {
                    const checkDate = new Date(today);
                    checkDate.setDate(today.getDate() - i);
                    const dateStr = checkDate.toISOString().split('T')[0];
                    if (checkIns[dateStr]) count++;
                }

                return Math.round((count / 7) * 100);
            },

            // Get check-ins for last N days (for visualization)
            getRecentCheckIns: (habitId, days = 30) => {
                const checkIns = get().checkIns[habitId] || {};
                const today = new Date();
                const result = [];

                for (let i = days - 1; i >= 0; i--) {
                    const checkDate = new Date(today);
                    checkDate.setDate(today.getDate() - i);
                    const dateStr = checkDate.toISOString().split('T')[0];
                    result.push({
                        date: dateStr,
                        checked: !!checkIns[dateStr],
                    });
                }

                return result;
            },

            // Get today's habits status
            getTodayStatus: () => {
                const habits = get().habits.filter((h) => h.active);
                const today = new Date().toISOString().split('T')[0];
                const completed = habits.filter((h) => get().isCheckedIn(h.id, today)).length;

                return {
                    total: habits.length,
                    completed,
                    pending: habits.length - completed,
                    percentage: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0,
                };
            },
        }),
        {
            name: 'workflow-habits',
        }
    )
);
