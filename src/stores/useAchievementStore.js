import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Achievement definitions
export const ACHIEVEMENTS = {
    // Task achievements
    first_task: { id: 'first_task', name: 'Khởi đầu!', description: 'Hoàn thành task đầu tiên', icon: '🌱', xp: 50 },
    task_10: { id: 'task_10', name: 'Làm việc chăm chỉ', description: 'Hoàn thành 10 tasks', icon: '💪', xp: 100 },
    task_50: { id: 'task_50', name: 'Productivity Pro', description: 'Hoàn thành 50 tasks', icon: '🚀', xp: 300 },
    task_100: { id: 'task_100', name: 'Task Master', description: 'Hoàn thành 100 tasks', icon: '🏆', xp: 500 },

    // Streak achievements
    streak_3: { id: 'streak_3', name: 'Bắt đầu thói quen', description: '3 ngày liên tiếp', icon: '🔥', xp: 50 },
    streak_7: { id: 'streak_7', name: 'Tuần lễ năng suất', description: '7 ngày liên tiếp', icon: '⚡', xp: 150 },
    streak_30: { id: 'streak_30', name: 'Tháng của chiến binh', description: '30 ngày liên tiếp', icon: '🎖️', xp: 500 },
    streak_100: { id: 'streak_100', name: 'Huyền thoại', description: '100 ngày liên tiếp', icon: '👑', xp: 1000 },

    // Goal achievements
    first_goal: { id: 'first_goal', name: 'Có định hướng', description: 'Tạo mục tiêu đầu tiên', icon: '🎯', xp: 50 },
    goal_complete: { id: 'goal_complete', name: 'Đạt mục tiêu', description: 'Hoàn thành một mục tiêu', icon: '🏅', xp: 200 },
    all_areas: { id: 'all_areas', name: 'Cuộc sống cân bằng', description: 'Có mục tiêu ở tất cả 6 lĩnh vực', icon: '☯️', xp: 300 },

    // Habit achievements
    first_habit: { id: 'first_habit', name: 'Xây dựng thói quen', description: 'Tạo thói quen đầu tiên', icon: '🔄', xp: 50 },
    habit_streak_7: { id: 'habit_streak_7', name: 'Thói quen tuần', description: 'Streak 7 ngày cho 1 thói quen', icon: '📅', xp: 100 },
    habit_streak_30: { id: 'habit_streak_30', name: 'Thói quen tháng', description: 'Streak 30 ngày cho 1 thói quen', icon: '💎', xp: 300 },

    // Level achievements
    level_5: { id: 'level_5', name: 'Người học việc', description: 'Đạt Level 5', icon: '⭐', xp: 100 },
    level_10: { id: 'level_10', name: 'Chuyên gia', description: 'Đạt Level 10', icon: '🌟', xp: 300 },

    // Focus achievements
    focus_1h: { id: 'focus_1h', name: 'Tập trung cao', description: 'Focus 1 giờ trong 1 ngày', icon: '🧘', xp: 50 },
    focus_3h: { id: 'focus_3h', name: 'Deep Work', description: 'Focus 3 giờ trong 1 ngày', icon: '🎧', xp: 150 },

    // Special
    early_bird: { id: 'early_bird', name: 'Chim đầu đàn', description: 'Hoàn thành task trước 7 giờ sáng', icon: '🌅', xp: 100 },
    night_owl: { id: 'night_owl', name: 'Cú đêm', description: 'Hoàn thành task sau 11 giờ đêm', icon: '🦉', xp: 100 },
};

// Daily challenges
export const DAILY_CHALLENGES = [
    { id: 'complete_3', name: 'Hoàn thành 3 tasks', target: 3, type: 'tasks', xp: 30 },
    { id: 'complete_5', name: 'Hoàn thành 5 tasks', target: 5, type: 'tasks', xp: 50 },
    { id: 'focus_30', name: 'Focus 30 phút', target: 1800, type: 'focus', xp: 30 },
    { id: 'focus_60', name: 'Focus 1 giờ', target: 3600, type: 'focus', xp: 50 },
    { id: 'all_habits', name: 'Check-in tất cả thói quen', target: 100, type: 'habits', xp: 40 },
    { id: 'high_priority', name: 'Hoàn thành 1 task quan trọng', target: 1, type: 'high_priority', xp: 30 },
];

export const useAchievementStore = create(
    persist(
        (set, get) => ({
            unlockedAchievements: [], // Array of achievement IDs
            challengeProgress: {}, // { date: { challengeId: progress } }
            dailyChallenges: [], // Today's challenges
            lastChallengeDate: null,

            // Unlock an achievement
            unlockAchievement: (achievementId) => {
                const state = get();
                if (state.unlockedAchievements.includes(achievementId)) return false;

                set({
                    unlockedAchievements: [...state.unlockedAchievements, achievementId],
                });

                // Add XP (would need to call useStatsStore)
                const achievement = ACHIEVEMENTS[achievementId];
                if (achievement) {
                    try {
                        const { useStatsStore } = require('./useStatsStore');
                        useStatsStore.getState().addXP(achievement.xp);
                    } catch (e) { }
                }

                return true;
            },

            // Check and unlock achievements based on stats
            checkAchievements: (stats) => {
                const unlock = get().unlockAchievement;

                // Task achievements
                if (stats.totalTasksCompleted >= 1) unlock('first_task');
                if (stats.totalTasksCompleted >= 10) unlock('task_10');
                if (stats.totalTasksCompleted >= 50) unlock('task_50');
                if (stats.totalTasksCompleted >= 100) unlock('task_100');

                // Streak achievements
                if (stats.currentStreak >= 3) unlock('streak_3');
                if (stats.currentStreak >= 7) unlock('streak_7');
                if (stats.currentStreak >= 30) unlock('streak_30');
                if (stats.currentStreak >= 100) unlock('streak_100');
            },

            // Generate daily challenges
            generateDailyChallenges: () => {
                const today = new Date().toISOString().split('T')[0];
                const state = get();

                if (state.lastChallengeDate === today) return state.dailyChallenges;

                // Pick 3 random challenges
                const shuffled = [...DAILY_CHALLENGES].sort(() => Math.random() - 0.5);
                const selected = shuffled.slice(0, 3);

                set({
                    dailyChallenges: selected,
                    lastChallengeDate: today,
                    challengeProgress: {
                        ...state.challengeProgress,
                        [today]: {},
                    },
                });

                return selected;
            },

            // Update challenge progress
            updateChallengeProgress: (type, amount) => {
                const today = new Date().toISOString().split('T')[0];
                const state = get();

                const progress = { ...(state.challengeProgress[today] || {}) };
                state.dailyChallenges.forEach(challenge => {
                    if (challenge.type === type) {
                        progress[challenge.id] = (progress[challenge.id] || 0) + amount;
                    }
                });

                set({
                    challengeProgress: {
                        ...state.challengeProgress,
                        [today]: progress,
                    },
                });
            },

            // Get challenge completion status
            getChallengeStatus: () => {
                const today = new Date().toISOString().split('T')[0];
                const state = get();
                const progress = state.challengeProgress[today] || {};

                return state.dailyChallenges.map(challenge => ({
                    ...challenge,
                    current: progress[challenge.id] || 0,
                    completed: (progress[challenge.id] || 0) >= challenge.target,
                }));
            },

            // Check if achievement is unlocked
            isUnlocked: (achievementId) => {
                return get().unlockedAchievements.includes(achievementId);
            },
        }),
        {
            name: 'workflow-achievements',
        }
    )
);
