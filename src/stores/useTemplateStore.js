import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const DEFAULT_TEMPLATES = [
    {
        id: 'daily-standup',
        name: 'Daily Standup',
        title: 'Daily Standup Meeting',
        priority: 'medium',
        estimatedMinutes: 15,
        tags: ['meeting', 'daily'],
        icon: '📅',
    },
    {
        id: 'weekly-review',
        name: 'Weekly Review',
        title: 'Weekly Review & Planning',
        priority: 'high',
        estimatedMinutes: 60,
        tags: ['planning', 'weekly'],
        icon: '📊',
    },
    {
        id: 'exercise',
        name: 'Tập thể dục',
        title: 'Tập thể dục buổi sáng',
        priority: 'medium',
        estimatedMinutes: 30,
        tags: ['health', 'routine'],
        icon: '💪',
    },
];

export const useTemplateStore = create(
    persist(
        (set, get) => ({
            templates: DEFAULT_TEMPLATES,

            addTemplate: (template) => {
                set((state) => ({
                    templates: [
                        ...state.templates,
                        {
                            ...template,
                            id: generateId(),
                            createdAt: new Date().toISOString(),
                        },
                    ],
                }));
            },

            updateTemplate: (id, updates) => {
                set((state) => ({
                    templates: state.templates.map((t) =>
                        t.id === id ? { ...t, ...updates } : t
                    ),
                }));
            },

            deleteTemplate: (id) => {
                set((state) => ({
                    templates: state.templates.filter((t) => t.id !== id),
                }));
            },

            getTemplate: (id) => get().templates.find((t) => t.id === id),
        }),
        {
            name: 'workflow-templates',
        }
    )
);
