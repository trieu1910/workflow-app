import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Life Areas (Bánh xe cuộc đời)
export const LIFE_AREAS = {
    career: { id: 'career', name: 'Sự nghiệp', icon: '💼', color: '#3b82f6' },
    finance: { id: 'finance', name: 'Tài chính', icon: '💰', color: '#22c55e' },
    health: { id: 'health', name: 'Sức khỏe', icon: '💪', color: '#ef4444' },
    relationships: { id: 'relationships', name: 'Mối quan hệ', icon: '❤️', color: '#ec4899' },
    learning: { id: 'learning', name: 'Học tập', icon: '📚', color: '#a855f7' },
    personal: { id: 'personal', name: 'Phát triển bản thân', icon: '🧘', color: '#f97316' },
};

export const useGoalStore = create(
    persist(
        (set, get) => ({
            goals: [],
            milestones: [],

            // ========== GOALS ==========
            addGoal: (goalData) => {
                const newGoal = {
                    id: generateId(),
                    title: goalData.title,
                    description: goalData.description || '',
                    why: goalData.why || '', // WHY - deeper motivation
                    identity: goalData.identity || '', // Identity statement: "Tôi là người..."
                    area: goalData.area || 'personal', // LIFE_AREAS key
                    deadline: goalData.deadline || null,
                    // SMART Criteria
                    smart: {
                        specific: goalData.smart?.specific || '', // Cụ thể: làm gì, ở đâu, với ai?
                        measurable: goalData.smart?.measurable || '', // Đo lường: con số cụ thể
                        achievable: goalData.smart?.achievable || 3, // Khả thi: 1-5 scale
                        relevant: goalData.smart?.relevant || '', // Liên quan: tại sao quan trọng
                        timeBound: goalData.smart?.timeBound || goalData.deadline || null, // Thời hạn
                    },
                    // Time categorization
                    timeframe: goalData.timeframe || 'medium', // short (<1 month), medium (1-6 months), long (>6 months)
                    // Priority Matrix (Impact vs Effort)
                    priority: {
                        impact: goalData.priority?.impact || 3, // 1-5: Tác động đến cuộc sống
                        effort: goalData.priority?.effort || 3, // 1-5: Công sức cần bỏ ra
                        quadrant: goalData.priority?.quadrant || null, // Tự tính dựa trên impact/effort
                    },
                    status: 'active', // active, completed, paused
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({
                    goals: [newGoal, ...state.goals],
                }));
                return newGoal;
            },

            updateGoal: (goalId, updates) => {
                set((state) => ({
                    goals: state.goals.map((g) =>
                        g.id === goalId ? { ...g, ...updates } : g
                    ),
                }));
            },

            deleteGoal: (goalId) => {
                // Unlink tasks from milestones of this goal
                try {
                    const { useTaskStore } = require('./useTaskStore');
                    const tasks = useTaskStore.getState().tasks;
                    const goalMilestones = get().milestones.filter(m => m.goalId === goalId);
                    const milestoneIds = goalMilestones.map(m => m.id);

                    tasks.forEach(task => {
                        if (milestoneIds.includes(task.milestoneId) || task.goalId === goalId) {
                            useTaskStore.getState().updateTask(task.id, { milestoneId: null, goalId: null });
                        }
                    });
                } catch (e) {
                    console.log('Task store not available');
                }

                set((state) => ({
                    goals: state.goals.filter((g) => g.id !== goalId),
                    // Also delete related milestones
                    milestones: state.milestones.filter((m) => m.goalId !== goalId),
                }));
            },

            completeGoal: (goalId) => {
                set((state) => ({
                    goals: state.goals.map((g) =>
                        g.id === goalId
                            ? { ...g, status: 'completed', completedAt: new Date().toISOString() }
                            : g
                    ),
                }));
            },

            getGoalsByArea: (area) => {
                return get().goals.filter((g) => g.area === area && g.status === 'active');
            },

            // ========== MILESTONES ==========
            // ========== MILESTONES (now Key Results - OKR) ==========
            addMilestone: (milestoneData) => {
                const newMilestone = {
                    id: generateId(),
                    goalId: milestoneData.goalId,
                    title: milestoneData.title,
                    description: milestoneData.description || '',
                    deadline: milestoneData.deadline || null,
                    // OKR metrics
                    targetValue: milestoneData.targetValue || null, // e.g. 100
                    currentValue: milestoneData.currentValue || 0, // e.g. 30
                    unit: milestoneData.unit || '', // e.g. "%", "books", "kg"
                    status: 'active', // active, completed
                    progress: 0, // 0-100, calculated from tasks or metrics
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({
                    milestones: [newMilestone, ...state.milestones],
                }));
                return newMilestone;
            },

            updateMilestone: (milestoneId, updates) => {
                set((state) => ({
                    milestones: state.milestones.map((m) =>
                        m.id === milestoneId ? { ...m, ...updates } : m
                    ),
                }));
            },

            deleteMilestone: (milestoneId) => {
                // Unlink tasks from this milestone
                try {
                    const { useTaskStore } = require('./useTaskStore');
                    const tasks = useTaskStore.getState().tasks;
                    tasks.forEach(task => {
                        if (task.milestoneId === milestoneId) {
                            useTaskStore.getState().updateTask(task.id, { milestoneId: null });
                        }
                    });
                } catch (e) {
                    console.log('Task store not available');
                }

                set((state) => ({
                    milestones: state.milestones.filter((m) => m.id !== milestoneId),
                }));
            },

            completeMilestone: (milestoneId) => {
                set((state) => ({
                    milestones: state.milestones.map((m) =>
                        m.id === milestoneId
                            ? { ...m, status: 'completed', progress: 100, completedAt: new Date().toISOString() }
                            : m
                    ),
                }));
            },

            getMilestonesByGoal: (goalId) => {
                return get().milestones.filter((m) => m.goalId === goalId);
            },

            // ========== PROGRESS CALCULATION ==========
            // This will be called from useTaskStore when tasks are completed
            updateMilestoneProgress: (milestoneId, progress) => {
                set((state) => ({
                    milestones: state.milestones.map((m) =>
                        m.id === milestoneId ? { ...m, progress: Math.min(100, progress) } : m
                    ),
                }));
            },

            // Calculate goal progress based on milestones
            getGoalProgress: (goalId) => {
                const milestones = get().milestones.filter((m) => m.goalId === goalId);
                if (milestones.length === 0) return 0;
                const totalProgress = milestones.reduce((sum, m) => sum + m.progress, 0);
                return Math.round(totalProgress / milestones.length);
            },

            // Get area statistics for Wheel of Life
            getAreaStats: () => {
                const goals = get().goals.filter((g) => g.status === 'active');
                const stats = {};

                Object.keys(LIFE_AREAS).forEach((areaKey) => {
                    const areaGoals = goals.filter((g) => g.area === areaKey);
                    const totalProgress = areaGoals.reduce((sum, g) => {
                        return sum + get().getGoalProgress(g.id);
                    }, 0);

                    stats[areaKey] = {
                        goalCount: areaGoals.length,
                        averageProgress: areaGoals.length > 0 ? Math.round(totalProgress / areaGoals.length) : 0,
                    };
                });

                return stats;
            },
        }),
        {
            name: 'workflow-goals',
        }
    )
);
