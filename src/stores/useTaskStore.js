import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Stage constants - tasks flow through these stages sequentially
export const STAGES = {
    INBOX: 'inbox',           // New tasks, not yet processed
    PRIORITIZED: 'prioritized', // Assigned to Eisenhower quadrant
    SCHEDULED: 'scheduled',    // Has date/time assigned
    IN_PROGRESS: 'in_progress', // Currently being worked on
    DONE: 'done',              // Completed
    SOMEDAY: 'someday',        // GTD: Someday/Maybe list
};

// Valid stage transitions
const VALID_TRANSITIONS = {
    [STAGES.INBOX]: [STAGES.PRIORITIZED, STAGES.DONE, STAGES.SOMEDAY],
    [STAGES.PRIORITIZED]: [STAGES.SCHEDULED, STAGES.INBOX, STAGES.DONE, STAGES.SOMEDAY],
    [STAGES.SCHEDULED]: [STAGES.IN_PROGRESS, STAGES.PRIORITIZED, STAGES.DONE],
    [STAGES.IN_PROGRESS]: [STAGES.DONE, STAGES.SCHEDULED],
    [STAGES.DONE]: [STAGES.INBOX], // Can reset to inbox
    [STAGES.SOMEDAY]: [STAGES.INBOX, STAGES.PRIORITIZED], // Can activate later
};

const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Helper function to calculate next recurrence date
function calculateNextRecurrence(currentDate, recurrence) {
    if (!currentDate || !recurrence) return null;

    const date = new Date(currentDate);

    switch (recurrence.type) {
        case 'daily':
            date.setDate(date.getDate() + (recurrence.interval || 1));
            break;
        case 'weekly':
            date.setDate(date.getDate() + 7 * (recurrence.interval || 1));
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + (recurrence.interval || 1));
            break;
        default:
            return null;
    }

    return date.toISOString().split('T')[0];
}

export const useTaskStore = create(
    persist(
        (set, get) => ({
            tasks: [],

            // Get tasks by stage
            getTasksByStage: (stage) => get().tasks.filter(t => t.stage === stage),

            // Get stage counts
            getStageCounts: () => {
                const tasks = get().tasks;
                return {
                    inbox: tasks.filter(t => t.stage === STAGES.INBOX).length,
                    prioritized: tasks.filter(t => t.stage === STAGES.PRIORITIZED).length,
                    scheduled: tasks.filter(t => t.stage === STAGES.SCHEDULED).length,
                    inProgress: tasks.filter(t => t.stage === STAGES.IN_PROGRESS).length,
                    done: tasks.filter(t => t.stage === STAGES.DONE).length,
                };
            },

            // Legacy getters (for backward compatibility)
            getInboxTasks: () => get().tasks.filter(t => t.stage === STAGES.INBOX),
            getCompletedTasks: () => get().tasks.filter(t => t.stage === STAGES.DONE),
            getTodayTasks: () => {
                const today = new Date().toISOString().split('T')[0];
                return get().tasks.filter(t => {
                    if (t.stage === STAGES.DONE) return false;
                    if (t.dueDate === today) return true;
                    if (t.scheduledFor === today) return true;
                    return false;
                });
            },

            // Add new task - always starts in INBOX
            addTask: (taskData) => {
                const newTask = {
                    id: generateId(),
                    title: taskData.title,
                    description: taskData.description || '',
                    notes: taskData.notes || '',
                    priority: taskData.priority || 'medium',
                    dueDate: taskData.dueDate || null,
                    dueTime: taskData.dueTime || null,
                    scheduledFor: taskData.scheduledFor || null,
                    scheduledTime: taskData.scheduledTime || null,
                    quadrant: taskData.quadrant || null,
                    tags: taskData.tags || [],
                    estimatedMinutes: taskData.estimatedMinutes || null,
                    actualMinutes: null,
                    subtasks: taskData.subtasks || [],
                    recurrence: taskData.recurrence || null,
                    isRecurring: taskData.isRecurring || false,
                    // Goal alignment
                    goalId: taskData.goalId || null,
                    milestoneId: taskData.milestoneId || null,
                    // MIT - Most Important Task (Brian Tracy)
                    isMIT: false,
                    mitDate: null, // Date when marked as MIT
                    // Pomodoro tracking
                    pomodoroCount: 0,
                    // Pipeline stage - new tasks start in inbox
                    stage: STAGES.INBOX,
                    completed: false,
                    completedAt: null,
                    createdAt: new Date().toISOString(),
                };

                set((state) => ({
                    tasks: [newTask, ...state.tasks],
                }));

                return newTask;
            },

            // Move task to a new stage with validation
            moveToStage: (taskId, newStage) => {
                const task = get().tasks.find(t => t.id === taskId);
                if (!task) return { success: false, error: 'Task not found' };

                const currentStage = task.stage || STAGES.INBOX;
                const validNext = VALID_TRANSITIONS[currentStage] || [];

                if (!validNext.includes(newStage)) {
                    return {
                        success: false,
                        error: `Cannot move from ${currentStage} to ${newStage}`
                    };
                }

                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === taskId ? { ...t, stage: newStage } : t
                    ),
                }));

                return { success: true };
            },

            // Prioritize task (assign quadrant, move to PRIORITIZED stage)
            prioritizeTask: (taskId, quadrant) => {
                const task = get().tasks.find(t => t.id === taskId);
                if (!task) return;

                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === taskId
                            ? { ...t, quadrant, stage: STAGES.PRIORITIZED }
                            : t
                    ),
                }));
            },

            // Schedule task (assign date/time, move to SCHEDULED stage)
            scheduleTask: (taskId, scheduledFor, scheduledTime = null) => {
                const task = get().tasks.find(t => t.id === taskId);
                if (!task) return;

                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === taskId
                            ? { ...t, scheduledFor, scheduledTime, stage: STAGES.SCHEDULED }
                            : t
                    ),
                }));
            },

            // Start working on task (move to IN_PROGRESS)
            startTask: (taskId) => {
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === taskId ? { ...t, stage: STAGES.IN_PROGRESS } : t
                    ),
                }));
            },

            updateTask: (id, updates) => {
                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === id ? { ...task, ...updates } : task
                    ),
                }));
            },

            deleteTask: (id) => {
                set((state) => ({
                    tasks: state.tasks.filter((task) => task.id !== id),
                }));
            },

            // ========== MIT - Most Important Tasks ==========
            setMIT: (taskId, isMIT) => {
                const today = new Date().toISOString().split('T')[0];
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === taskId
                            ? { ...t, isMIT, mitDate: isMIT ? today : null }
                            : t
                    ),
                }));
            },

            getTodayMITs: () => {
                const today = new Date().toISOString().split('T')[0];
                return get().tasks.filter(t => t.isMIT && t.mitDate === today && !t.completed);
            },

            clearExpiredMITs: () => {
                const today = new Date().toISOString().split('T')[0];
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.isMIT && t.mitDate !== today && !t.completed
                            ? { ...t, isMIT: false, mitDate: null }
                            : t
                    ),
                }));
            },

            // ========== Someday/Maybe ==========
            moveToSomeday: (taskId) => {
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === taskId ? { ...t, stage: STAGES.SOMEDAY } : t
                    ),
                }));
            },

            activateFromSomeday: (taskId) => {
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === taskId ? { ...t, stage: STAGES.INBOX } : t
                    ),
                }));
            },

            // ========== Pomodoro Tracking ==========
            incrementPomodoro: (taskId) => {
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === taskId ? { ...t, pomodoroCount: (t.pomodoroCount || 0) + 1 } : t
                    ),
                }));
            },

            // Subtask actions
            addSubtask: (taskId, subtaskTitle) => {
                const subtask = {
                    id: generateId(),
                    title: subtaskTitle,
                    completed: false,
                };
                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === taskId
                            ? { ...task, subtasks: [...(task.subtasks || []), subtask] }
                            : task
                    ),
                }));
            },

            toggleSubtask: (taskId, subtaskId) => {
                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === taskId
                            ? {
                                ...task,
                                subtasks: (task.subtasks || []).map((st) =>
                                    st.id === subtaskId ? { ...st, completed: !st.completed } : st
                                ),
                            }
                            : task
                    ),
                }));
            },

            deleteSubtask: (taskId, subtaskId) => {
                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === taskId
                            ? { ...task, subtasks: (task.subtasks || []).filter((st) => st.id !== subtaskId) }
                            : task
                    ),
                }));
            },

            // Complete task - moves to DONE stage
            completeTask: (id, actualMinutes = null) => {
                const task = get().tasks.find(t => t.id === id);
                if (!task) return null;

                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id
                            ? {
                                ...t,
                                stage: STAGES.DONE,
                                completed: true,
                                completedAt: new Date().toISOString(),
                                actualMinutes: actualMinutes || t.actualMinutes,
                            }
                            : t
                    ),
                }));

                // Handle recurrence
                if (task.isRecurring && task.recurrence) {
                    const nextDate = calculateNextRecurrence(task.dueDate, task.recurrence);
                    if (nextDate) {
                        get().addTask({
                            ...task,
                            id: undefined,
                            dueDate: nextDate,
                            stage: STAGES.INBOX,
                            completed: false,
                            completedAt: null,
                            subtasks: (task.subtasks || []).map(st => ({ ...st, completed: false })),
                        });
                    }
                }

                // Auto-update milestone progress
                if (task.milestoneId) {
                    const allTasks = get().tasks;
                    const milestoneTasks = allTasks.filter(t => t.milestoneId === task.milestoneId);
                    const completedCount = milestoneTasks.filter(t => t.stage === STAGES.DONE || t.id === id).length;
                    const progress = milestoneTasks.length > 0
                        ? Math.round((completedCount / milestoneTasks.length) * 100)
                        : 0;

                    // Update milestone progress in goal store
                    try {
                        const { useGoalStore } = require('./useGoalStore');
                        useGoalStore.getState().updateMilestoneProgress(task.milestoneId, progress);
                    } catch (e) {
                        console.log('Goal store not available');
                    }
                }

                return task;
            },

            // Uncomplete task - moves back to previous stage
            uncompleteTask: (id) => {
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id
                            ? {
                                ...t,
                                stage: t.scheduledFor ? STAGES.SCHEDULED : (t.quadrant ? STAGES.PRIORITIZED : STAGES.INBOX),
                                completed: false,
                                completedAt: null
                            }
                            : t
                    ),
                }));
            },

            // Reset task back to inbox
            resetToInbox: (id) => {
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id
                            ? {
                                ...t,
                                stage: STAGES.INBOX,
                                quadrant: null,
                                scheduledFor: null,
                                scheduledTime: null,
                                completed: false,
                                completedAt: null,
                            }
                            : t
                    ),
                }));
            },

            clearCompleted: () => {
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.stage !== STAGES.DONE),
                }));
            },

            // Export/Import
            exportData: () => {
                const tasks = get().tasks;
                const stats = localStorage.getItem('workflow-stats');
                const data = {
                    version: '2.0',
                    exportedAt: new Date().toISOString(),
                    tasks,
                    stats: stats ? JSON.parse(stats) : null,
                };
                return JSON.stringify(data, null, 2);
            },

            importData: (jsonString) => {
                try {
                    const data = JSON.parse(jsonString);
                    if (data.tasks && Array.isArray(data.tasks)) {
                        // Migrate old tasks without stage
                        const migratedTasks = data.tasks.map(t => ({
                            ...t,
                            stage: t.stage || (t.completed ? STAGES.DONE : STAGES.INBOX),
                        }));
                        set({ tasks: migratedTasks });
                        if (data.stats) {
                            localStorage.setItem('workflow-stats', JSON.stringify(data.stats));
                        }
                        return { success: true, count: migratedTasks.length };
                    }
                    return { success: false, error: 'Invalid data format' };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            },

            // Migrate existing tasks to have stage field
            migrateTasksToStages: () => {
                set((state) => ({
                    tasks: state.tasks.map((t) => ({
                        ...t,
                        stage: t.stage || (t.completed ? STAGES.DONE : STAGES.INBOX),
                    })),
                }));
            },
        }),
        {
            name: 'workflow-tasks',
            onRehydrate: () => (state) => {
                // Auto-migrate on load
                if (state) {
                    state.migrateTasksToStages();
                }
            },
        }
    )
);
