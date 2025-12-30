import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Entry types
export const ENTRY_TYPES = {
    DAILY: 'daily',           // Daily reflection
    LESSON: 'lesson',         // Lesson learned
    GOAL_COMPLETE: 'goal_complete', // When completing a goal
    GRATITUDE: 'gratitude',   // Gratitude entry
};

// Mood levels
export const MOOD_LEVELS = [
    { value: 1, emoji: '😞', label: 'Rất tệ' },
    { value: 2, emoji: '😕', label: 'Không tốt' },
    { value: 3, emoji: '😐', label: 'Bình thường' },
    { value: 4, emoji: '🙂', label: 'Tốt' },
    { value: 5, emoji: '😊', label: 'Tuyệt vời' },
];

export const useJournalStore = create(
    persist(
        (set, get) => ({
            entries: [],

            // Add new entry
            addEntry: (entryData) => {
                const newEntry = {
                    id: generateId(),
                    type: entryData.type || ENTRY_TYPES.DAILY,
                    date: entryData.date || new Date().toISOString().split('T')[0],
                    createdAt: new Date().toISOString(),
                    // Mood (1-5)
                    mood: entryData.mood || 3,
                    // Content fields
                    highlights: entryData.highlights || '', // What went well
                    challenges: entryData.challenges || '', // What was difficult
                    lessons: entryData.lessons || '', // What I learned
                    gratitude: entryData.gratitude || [], // 3 things grateful for
                    tomorrowFocus: entryData.tomorrowFocus || '', // Tomorrow's intention
                    // Optional links
                    goalId: entryData.goalId || null,
                    tags: entryData.tags || [],
                };

                set((state) => ({
                    entries: [newEntry, ...state.entries],
                }));

                return newEntry;
            },

            // Update entry
            updateEntry: (id, updates) => {
                set((state) => ({
                    entries: state.entries.map((entry) =>
                        entry.id === id ? { ...entry, ...updates, updatedAt: new Date().toISOString() } : entry
                    ),
                }));
            },

            // Delete entry
            deleteEntry: (id) => {
                set((state) => ({
                    entries: state.entries.filter((entry) => entry.id !== id),
                }));
            },

            // Get entries by date
            getEntriesByDate: (date) => {
                return get().entries.filter((entry) => entry.date === date);
            },

            // Get entries by type
            getEntriesByType: (type) => {
                return get().entries.filter((entry) => entry.type === type);
            },

            // Get entries for date range
            getEntriesInRange: (startDate, endDate) => {
                return get().entries.filter((entry) =>
                    entry.date >= startDate && entry.date <= endDate
                );
            },

            // Get today's entry
            getTodayEntry: () => {
                const today = new Date().toISOString().split('T')[0];
                return get().entries.find((entry) =>
                    entry.date === today && entry.type === ENTRY_TYPES.DAILY
                );
            },

            // Check if today has reflection
            hasTodayReflection: () => {
                return !!get().getTodayEntry();
            },

            // Get mood trend (last N days)
            getMoodTrend: (days = 7) => {
                const entries = get().entries;
                const result = [];
                const today = new Date();

                for (let i = days - 1; i >= 0; i--) {
                    const checkDate = new Date(today);
                    checkDate.setDate(today.getDate() - i);
                    const dateStr = checkDate.toISOString().split('T')[0];

                    const dayEntry = entries.find((e) =>
                        e.date === dateStr && e.type === ENTRY_TYPES.DAILY
                    );

                    result.push({
                        date: dateStr,
                        mood: dayEntry?.mood || null,
                        hasEntry: !!dayEntry,
                    });
                }

                return result;
            },

            // Get all lessons
            getAllLessons: () => {
                return get().entries.filter((e) =>
                    e.type === ENTRY_TYPES.LESSON || (e.lessons && e.lessons.trim().length > 0)
                );
            },

            // Get streak of consecutive reflection days
            getReflectionStreak: () => {
                const entries = get().entries;
                const today = new Date();
                let streak = 0;

                for (let i = 0; i <= 365; i++) {
                    const checkDate = new Date(today);
                    checkDate.setDate(today.getDate() - i);
                    const dateStr = checkDate.toISOString().split('T')[0];

                    const hasEntry = entries.some((e) =>
                        e.date === dateStr && e.type === ENTRY_TYPES.DAILY
                    );

                    if (hasEntry) {
                        streak++;
                    } else if (i > 0) {
                        break;
                    }
                }

                return streak;
            },

            // Get statistics
            getStats: () => {
                const entries = get().entries;
                const dailyEntries = entries.filter((e) => e.type === ENTRY_TYPES.DAILY);

                const avgMood = dailyEntries.length > 0
                    ? dailyEntries.reduce((sum, e) => sum + (e.mood || 3), 0) / dailyEntries.length
                    : 0;

                return {
                    totalEntries: entries.length,
                    dailyReflections: dailyEntries.length,
                    lessonsLearned: entries.filter((e) => e.lessons && e.lessons.trim()).length,
                    averageMood: Math.round(avgMood * 10) / 10,
                    reflectionStreak: get().getReflectionStreak(),
                };
            },
        }),
        {
            name: 'workflow-journal',
        }
    )
);
