import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Weekly Challenge definitions
export const WEEKLY_CHALLENGES = [
    // MIT Challenges
    {
        id: 'mit_streak_5',
        name: 'MIT Master',
        description: 'Hoàn thành 3 MIT liên tiếp 5 ngày',
        icon: '⭐',
        target: 5,
        type: 'mit_streak',
        xp: 200,
        difficulty: 'medium'
    },
    {
        id: 'mit_streak_7',
        name: 'MIT Legend',
        description: 'Hoàn thành 3 MIT liên tiếp 7 ngày',
        icon: '🌟',
        target: 7,
        type: 'mit_streak',
        xp: 350,
        difficulty: 'hard'
    },

    // Task Challenges
    {
        id: 'tasks_15',
        name: 'Task Warrior',
        description: 'Hoàn thành 15 tasks trong tuần',
        icon: '⚔️',
        target: 15,
        type: 'tasks_weekly',
        xp: 150,
        difficulty: 'easy'
    },
    {
        id: 'tasks_25',
        name: 'Task Crusher',
        description: 'Hoàn thành 25 tasks trong tuần',
        icon: '💪',
        target: 25,
        type: 'tasks_weekly',
        xp: 250,
        difficulty: 'medium'
    },
    {
        id: 'tasks_40',
        name: 'Task Machine',
        description: 'Hoàn thành 40 tasks trong tuần',
        icon: '🤖',
        target: 40,
        type: 'tasks_weekly',
        xp: 400,
        difficulty: 'hard'
    },

    // Habit Challenges
    {
        id: 'habit_7',
        name: 'Thói quen vững',
        description: 'Check-in 1 habit liên tiếp 7 ngày',
        icon: '🔄',
        target: 7,
        type: 'habit_streak',
        xp: 150,
        difficulty: 'easy'
    },
    {
        id: 'habits_all_5',
        name: 'Thói quen đều đặn',
        description: 'Check-in TẤT CẢ habits 5 ngày trong tuần',
        icon: '✨',
        target: 5,
        type: 'all_habits_day',
        xp: 200,
        difficulty: 'medium'
    },

    // Focus Challenges
    {
        id: 'focus_5h',
        name: 'Deep Worker',
        description: 'Tổng 5 giờ focus trong tuần',
        icon: '🎧',
        target: 18000, // 5 hours in seconds
        type: 'focus_time',
        xp: 150,
        difficulty: 'easy'
    },
    {
        id: 'focus_10h',
        name: 'Focus Master',
        description: 'Tổng 10 giờ focus trong tuần',
        icon: '🧘',
        target: 36000, // 10 hours in seconds
        type: 'focus_time',
        xp: 300,
        difficulty: 'medium'
    },
    {
        id: 'focus_20h',
        name: 'Flow State',
        description: 'Tổng 20 giờ focus trong tuần',
        icon: '🌊',
        target: 72000, // 20 hours in seconds
        xp: 500,
        difficulty: 'hard'
    },

    // Reflection Challenges
    {
        id: 'reflect_5',
        name: 'Nhà tư duy',
        description: 'Viết nhật ký phản tư 5 ngày trong tuần',
        icon: '📔',
        target: 5,
        type: 'reflection_days',
        xp: 200,
        difficulty: 'medium'
    },
    {
        id: 'reflect_7',
        name: 'Master of Mind',
        description: 'Viết nhật ký phản tư 7 ngày liên tiếp',
        icon: '🧠',
        target: 7,
        type: 'reflection_streak',
        xp: 350,
        difficulty: 'hard'
    },

    // Goal Challenges
    {
        id: 'milestone_2',
        name: 'Progress Maker',
        description: 'Hoàn thành 2 milestones trong tuần',
        icon: '🏁',
        target: 2,
        type: 'milestones',
        xp: 250,
        difficulty: 'medium'
    },
];

// Get start of current week (Monday)
const getWeekStart = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
};

// Get end of current week (Sunday)
const getWeekEnd = (date = new Date()) => {
    const start = new Date(getWeekStart(date));
    start.setDate(start.getDate() + 6);
    return start.toISOString().split('T')[0];
};

export const useChallengeStore = create(
    persist(
        (set, get) => ({
            activeChallenges: [], // 3 challenges for current week
            challengeProgress: {}, // { challengeId: currentProgress }
            weekStart: null, // Start of current challenge week
            completedChallenges: [], // { challengeId, weekStart, completedAt, xpEarned }
            totalXPFromChallenges: 0,

            // Generate new weekly challenges
            generateWeeklyChallenges: () => {
                const currentWeekStart = getWeekStart();
                const state = get();

                // If already generated for this week, return existing
                if (state.weekStart === currentWeekStart && state.activeChallenges.length > 0) {
                    return state.activeChallenges;
                }

                // Pick 3 random challenges with different difficulties
                const easy = WEEKLY_CHALLENGES.filter(c => c.difficulty === 'easy');
                const medium = WEEKLY_CHALLENGES.filter(c => c.difficulty === 'medium');
                const hard = WEEKLY_CHALLENGES.filter(c => c.difficulty === 'hard');

                const selected = [
                    easy[Math.floor(Math.random() * easy.length)],
                    medium[Math.floor(Math.random() * medium.length)],
                    hard[Math.floor(Math.random() * hard.length)],
                ].filter(Boolean);

                // Reset progress for new week
                const newProgress = {};
                selected.forEach(c => {
                    newProgress[c.id] = 0;
                });

                set({
                    activeChallenges: selected,
                    weekStart: currentWeekStart,
                    challengeProgress: newProgress,
                });

                return selected;
            },

            // Update progress for a challenge type
            updateProgress: (type, amount) => {
                const state = get();
                const newProgress = { ...state.challengeProgress };
                let xpEarned = 0;

                state.activeChallenges.forEach(challenge => {
                    if (challenge.type === type) {
                        const oldProgress = newProgress[challenge.id] || 0;
                        const newValue = oldProgress + amount;
                        newProgress[challenge.id] = newValue;

                        // Check if just completed
                        if (oldProgress < challenge.target && newValue >= challenge.target) {
                            xpEarned += challenge.xp;

                            // Add to completed challenges
                            const completed = {
                                challengeId: challenge.id,
                                weekStart: state.weekStart,
                                completedAt: new Date().toISOString(),
                                xpEarned: challenge.xp,
                            };

                            set(s => ({
                                completedChallenges: [...s.completedChallenges, completed],
                                totalXPFromChallenges: s.totalXPFromChallenges + challenge.xp,
                            }));

                            // Add XP to stats store
                            try {
                                const { useStatsStore } = require('./useStatsStore');
                                useStatsStore.getState().addXP(challenge.xp);
                            } catch (e) { }
                        }
                    }
                });

                set({ challengeProgress: newProgress });
                return xpEarned;
            },

            // Set absolute progress (for streak types)
            setProgress: (type, value) => {
                const state = get();
                const newProgress = { ...state.challengeProgress };
                let xpEarned = 0;

                state.activeChallenges.forEach(challenge => {
                    if (challenge.type === type) {
                        const oldProgress = newProgress[challenge.id] || 0;
                        newProgress[challenge.id] = value;

                        // Check if just completed
                        if (oldProgress < challenge.target && value >= challenge.target) {
                            xpEarned += challenge.xp;

                            const completed = {
                                challengeId: challenge.id,
                                weekStart: state.weekStart,
                                completedAt: new Date().toISOString(),
                                xpEarned: challenge.xp,
                            };

                            set(s => ({
                                completedChallenges: [...s.completedChallenges, completed],
                                totalXPFromChallenges: s.totalXPFromChallenges + challenge.xp,
                            }));

                            try {
                                const { useStatsStore } = require('./useStatsStore');
                                useStatsStore.getState().addXP(challenge.xp);
                            } catch (e) { }
                        }
                    }
                });

                set({ challengeProgress: newProgress });
                return xpEarned;
            },

            // Get challenge status with progress
            getChallengeStatus: () => {
                const state = get();
                return state.activeChallenges.map(challenge => ({
                    ...challenge,
                    current: state.challengeProgress[challenge.id] || 0,
                    completed: (state.challengeProgress[challenge.id] || 0) >= challenge.target,
                    progress: Math.min(100, ((state.challengeProgress[challenge.id] || 0) / challenge.target) * 100),
                }));
            },

            // Get time remaining in week
            getTimeRemaining: () => {
                const weekEnd = getWeekEnd();
                const endDate = new Date(weekEnd + 'T23:59:59');
                const now = new Date();
                const diff = endDate - now;

                if (diff <= 0) return { days: 0, hours: 0, expired: true };

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                return { days, hours, expired: false };
            },

            // Get stats
            getStats: () => {
                const state = get();
                return {
                    totalCompleted: state.completedChallenges.length,
                    totalXP: state.totalXPFromChallenges,
                    currentWeekCompleted: state.completedChallenges.filter(
                        c => c.weekStart === state.weekStart
                    ).length,
                };
            },

            // Check if challenge is completed this week
            isCompleted: (challengeId) => {
                const state = get();
                return (state.challengeProgress[challengeId] || 0) >=
                    (state.activeChallenges.find(c => c.id === challengeId)?.target || Infinity);
            },
        }),
        {
            name: 'workflow-challenges',
        }
    )
);
