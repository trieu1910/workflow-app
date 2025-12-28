import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const DEFAULT_PROJECTS = [
    { id: 'personal', name: 'Cá nhân', color: '#22c55e', icon: '🏠' },
    { id: 'work', name: 'Công việc', color: '#3b82f6', icon: '💼' },
    { id: 'learning', name: 'Học tập', color: '#a855f7', icon: '📚' },
];

export const useProjectStore = create(
    persist(
        (set, get) => ({
            projects: DEFAULT_PROJECTS,

            addProject: (project) => {
                set((state) => ({
                    projects: [
                        ...state.projects,
                        {
                            ...project,
                            id: generateId(),
                            createdAt: new Date().toISOString(),
                        },
                    ],
                }));
            },

            updateProject: (id, updates) => {
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === id ? { ...p, ...updates } : p
                    ),
                }));
            },

            deleteProject: (id) => {
                set((state) => ({
                    projects: state.projects.filter((p) => p.id !== id),
                }));
            },

            getProject: (id) => get().projects.find((p) => p.id === id),
        }),
        {
            name: 'workflow-projects',
        }
    )
);
