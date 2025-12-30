import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// XP thresholds for each level
const LEVEL_THRESHOLDS = [
    0,      // Level 1
    100,    // Level 2
    250,    // Level 3
    500,    // Level 4
    850,    // Level 5
    1300,   // Level 6
    1850,   // Level 7
    2500,   // Level 8
    3250,   // Level 9
    4100,   // Level 10
];

const calculateLevel = (xp) => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_THRESHOLDS[i]) {
            return i + 1;
        }
    }
    return 1;
};

const getXPForNextLevel = (level) => {
    if (level >= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    return LEVEL_THRESHOLDS[level];
};

const getXPForCurrentLevel = (level) => {
    if (level <= 1) return 0;
    return LEVEL_THRESHOLDS[level - 1];
};

const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

const isYesterday = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setDate(d1.getDate() + 1);
    return isSameDay(d1, d2);
};

// Initial state
const initialState = {
    totalXP: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    tasksCompletedToday: 0,
    tasksCompletedThisWeek: 0,
    totalTasksCompleted: 0,
    focusTimeToday: 0, // in seconds
    weeklyData: {}, // { '2024-01-15': { completed: 5, focusTime: 3600 } }
};

export const useStatsStore = create(
    persist(
        (set, get) => ({
            ...initialState,

            // Actions
            addXP: (amount) => {
                const today = new Date().toISOString().split('T')[0];
                const state = get();

                // Update streak
                let newStreak = state.currentStreak;
                if (state.lastCompletedDate) {
                    if (isSameDay(state.lastCompletedDate, today)) {
                        // Same day, keep streak
                    } else if (isYesterday(state.lastCompletedDate, today)) {
                        // Yesterday, increment streak
                        newStreak += 1;
                    } else {
                        // Streak broken
                        newStreak = 1;
                    }
                } else {
                    newStreak = 1;
                }

                // Update weekly data
                const weeklyData = { ...state.weeklyData };
                if (!weeklyData[today]) {
                    weeklyData[today] = { completed: 0, focusTime: 0 };
                }
                weeklyData[today].completed += 1;

                set({
                    totalXP: state.totalXP + amount,
                    currentStreak: newStreak,
                    longestStreak: Math.max(newStreak, state.longestStreak),
                    lastCompletedDate: today,
                    tasksCompletedToday: isSameDay(state.lastCompletedDate, today)
                        ? state.tasksCompletedToday + 1
                        : 1,
                    totalTasksCompleted: state.totalTasksCompleted + 1,
                    weeklyData,
                });
            },

            addFocusTime: (seconds) => {
                const today = new Date().toISOString().split('T')[0];
                const state = get();

                const weeklyData = { ...state.weeklyData };
                if (!weeklyData[today]) {
                    weeklyData[today] = { completed: 0, focusTime: 0 };
                }
                weeklyData[today].focusTime += seconds;

                set({
                    focusTimeToday: state.focusTimeToday + seconds,
                    weeklyData,
                });

                // Update weekly challenge progress for focus time
                try {
                    const { useChallengeStore } = require('./useChallengeStore');
                    useChallengeStore.getState().updateProgress('focus_time', seconds);
                } catch (e) {
                    console.log('Challenge store not available');
                }
            },

            resetDailyStats: () => {
                const today = new Date().toISOString().split('T')[0];
                const state = get();

                if (!isSameDay(state.lastCompletedDate, today)) {
                    // Check if streak should be preserved
                    if (state.lastCompletedDate && !isYesterday(state.lastCompletedDate, today)) {
                        set({ currentStreak: 0 });
                    }
                    set({
                        tasksCompletedToday: 0,
                        focusTimeToday: 0,
                    });
                }
            },

            // Reset all stats
            resetStats: () => {
                set(initialState);
            },
        }),
        {
            name: 'workflow-stats',
            storage: createJSONStorage(() => localStorage),
            // Explicitly define what to persist
            partialize: (state) => ({
                totalXP: state.totalXP,
                currentStreak: state.currentStreak,
                longestStreak: state.longestStreak,
                lastCompletedDate: state.lastCompletedDate,
                tasksCompletedToday: state.tasksCompletedToday,
                tasksCompletedThisWeek: state.tasksCompletedThisWeek,
                totalTasksCompleted: state.totalTasksCompleted,
                focusTimeToday: state.focusTimeToday,
                weeklyData: state.weeklyData,
            }),
        }
    )
);

// Helper to get level info - PURE FUNCTION outside store
export const getLevelInfo = (xp) => {
    const level = calculateLevel(xp);
    const currentLevelXP = getXPForCurrentLevel(level);
    const nextLevelXP = getXPForNextLevel(level);
    const progress = nextLevelXP > currentLevelXP
        ? (xp - currentLevelXP) / (nextLevelXP - currentLevelXP)
        : 1;

    return {
        level,
        currentXP: xp,
        currentLevelXP,
        nextLevelXP,
        xpNeeded: Math.max(nextLevelXP - xp, 0),
        progress: Math.min(Math.max(progress, 0), 1),
    };
};

// Calculate XP based on task priority
export const getTaskXP = (priority) => {
    switch (priority) {
        case 'high': return 50;
        case 'medium': return 30;
        case 'low': return 15;
        default: return 20;
    }
};
