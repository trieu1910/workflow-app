import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNotificationStore = create(
    persist(
        (set, get) => ({
            // Permission status
            permission: 'default', // 'default', 'granted', 'denied'

            // Settings
            enabled: false,
            reminderMinutes: 15, // Minutes before due
            soundEnabled: true,

            // Check and request permission
            requestPermission: async () => {
                if (!('Notification' in window)) {
                    set({ permission: 'denied' });
                    return false;
                }

                const result = await Notification.requestPermission();
                set({ permission: result, enabled: result === 'granted' });
                return result === 'granted';
            },

            // Update settings
            updateSettings: (updates) => {
                set((state) => ({ ...state, ...updates }));
            },

            // Send notification
            sendNotification: (title, options = {}) => {
                const state = get();
                if (!state.enabled || state.permission !== 'granted') return;

                try {
                    const notification = new Notification(title, {
                        icon: '/favicon.ico',
                        badge: '/favicon.ico',
                        ...options,
                    });

                    notification.onclick = () => {
                        window.focus();
                        notification.close();
                    };

                    // Auto close after 10 seconds
                    setTimeout(() => notification.close(), 10000);

                    return notification;
                } catch (e) {
                    console.error('Notification error:', e);
                }
            },

            // Check for due tasks and send reminders
            checkAndNotify: (tasks) => {
                const state = get();
                if (!state.enabled) return;

                const now = new Date();
                const reminderMs = state.reminderMinutes * 60 * 1000;

                tasks.forEach((task) => {
                    if (task.completed || task.stage === 'done') return;
                    if (!task.dueDate) return;

                    const dueDate = new Date(task.dueDate);
                    if (task.dueTime) {
                        const [hours, minutes] = task.dueTime.split(':');
                        dueDate.setHours(parseInt(hours), parseInt(minutes));
                    }

                    const timeDiff = dueDate.getTime() - now.getTime();

                    // Notify if within reminder window
                    if (timeDiff > 0 && timeDiff <= reminderMs) {
                        get().sendNotification(`⏰ Sắp đến hạn: ${task.title}`, {
                            body: `Còn ${Math.ceil(timeDiff / 60000)} phút`,
                            tag: `reminder-${task.id}`,
                        });
                    }

                    // Notify if overdue
                    if (timeDiff < 0 && timeDiff > -reminderMs) {
                        get().sendNotification(`⚠️ Quá hạn: ${task.title}`, {
                            body: `Đã quá hạn ${Math.abs(Math.ceil(timeDiff / 60000))} phút`,
                            tag: `overdue-${task.id}`,
                        });
                    }
                });
            },
        }),
        {
            name: 'workflow-notifications',
            partialize: (state) => ({
                enabled: state.enabled,
                reminderMinutes: state.reminderMinutes,
                soundEnabled: state.soundEnabled,
            }),
        }
    )
);
