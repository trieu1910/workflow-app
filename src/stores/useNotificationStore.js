import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNotificationStore = create(
    persist(
        (set, get) => ({
            // Permission status
            permission: 'default',
            enabled: false,
            reminderMinutes: 15,
            soundEnabled: true,

            // Scheduled reminders
            scheduledReminders: {
                mitReminder: { enabled: true, time: '15:00' },
                shutdownRitual: { enabled: true, time: '18:00' },
                morningHabits: { enabled: true, time: '07:00' },
                // NEW - Sleep Reminder
                sleepReminder: {
                    enabled: true,
                    time: '22:00',
                    message: 'Đến giờ đi ngủ rồi! Nghỉ ngơi để có sức khỏe tốt 😴'
                },
            },

            // NEW - Break reminder settings (interval-based)
            breakReminder: {
                enabled: true,
                intervalMinutes: 45,  // Nhắc mỗi 45 phút
                showExercises: true,  // Hiển thị bài tập
                lastBreakTime: null,  // Timestamp lần nghỉ cuối
            },

            // State for break modal
            showBreakModal: false,

            lastShownDates: {},

            // In-app toasts
            toasts: [],

            requestPermission: async () => {
                if (!('Notification' in window)) {
                    set({ permission: 'denied' });
                    return false;
                }
                const result = await Notification.requestPermission();
                set({ permission: result, enabled: result === 'granted' });
                return result === 'granted';
            },

            updateSettings: (updates) => set((state) => ({ ...state, ...updates })),

            updateScheduledReminder: (key, updates) => set((state) => ({
                scheduledReminders: {
                    ...state.scheduledReminders,
                    [key]: { ...state.scheduledReminders[key], ...updates },
                },
            })),

            // NEW - Update break reminder settings
            updateBreakReminder: (updates) => set((state) => ({
                breakReminder: { ...state.breakReminder, ...updates },
            })),

            // NEW - Show/hide break modal
            setShowBreakModal: (show) => set({ showBreakModal: show }),

            // NEW - Record break taken
            recordBreakTaken: () => set((state) => ({
                breakReminder: { ...state.breakReminder, lastBreakTime: Date.now() },
                showBreakModal: false,
            })),

            // NEW - Check if break reminder should show
            checkBreakReminder: () => {
                const { breakReminder, enabled } = get();
                if (!breakReminder.enabled) return false;

                const now = Date.now();
                const intervalMs = breakReminder.intervalMinutes * 60 * 1000;
                const lastBreak = breakReminder.lastBreakTime || (now - intervalMs - 1);

                if (now - lastBreak >= intervalMs) {
                    // Time for a break!
                    get().addToast({
                        type: 'break',
                        title: '🧘 Nghỉ ngơi thôi!',
                        message: `Bạn đã làm việc ${breakReminder.intervalMinutes} phút rồi`,
                        duration: 15000,
                    });

                    if (enabled) {
                        get().sendNotification('🧘 Nghỉ ngơi thôi!', {
                            body: 'Đứng dậy vươn vai và nghỉ ngơi 5 phút',
                        });
                    }

                    // Show break modal if exercises enabled
                    if (breakReminder.showExercises) {
                        set({ showBreakModal: true });
                    } else {
                        // Just record the break without modal
                        get().recordBreakTaken();
                    }
                    return true;
                }
                return false;
            },

            // NEW - Skip break (snooze for 10 min)
            skipBreak: () => set((state) => ({
                breakReminder: {
                    ...state.breakReminder,
                    lastBreakTime: Date.now() - (state.breakReminder.intervalMinutes - 10) * 60 * 1000
                },
                showBreakModal: false,
            })),

            sendNotification: (title, options = {}) => {
                const state = get();
                if (!state.enabled || state.permission !== 'granted') return;
                try {
                    const notification = new Notification(title, {
                        icon: '/favicon.ico',
                        ...options,
                    });
                    notification.onclick = () => { window.focus(); notification.close(); };
                    setTimeout(() => notification.close(), 10000);
                    return notification;
                } catch (e) {
                    console.error('Notification error:', e);
                }
            },

            addToast: (toast) => {
                const id = Date.now().toString();
                const newToast = {
                    id,
                    type: toast.type || 'info',
                    title: toast.title,
                    message: toast.message,
                    duration: toast.duration || 5000,
                };
                set((state) => ({ toasts: [...state.toasts, newToast] }));
                if (newToast.duration > 0) {
                    setTimeout(() => get().dismissToast(id), newToast.duration);
                }
                return id;
            },

            dismissToast: (id) => set((state) => ({
                toasts: state.toasts.filter(t => t.id !== id),
            })),

            shouldShowReminder: (reminderId) => {
                const today = new Date().toISOString().split('T')[0];
                return get().lastShownDates[reminderId] !== today;
            },

            markReminderShown: (reminderId) => {
                const today = new Date().toISOString().split('T')[0];
                set((state) => ({
                    lastShownDates: { ...state.lastShownDates, [reminderId]: today },
                }));
            },

            checkAndNotify: (tasks) => {
                const state = get();
                if (!state.enabled) return;
                const now = new Date();
                const reminderMs = state.reminderMinutes * 60 * 1000;

                tasks.forEach((task) => {
                    if (task.completed || task.stage === 'done' || !task.dueDate) return;
                    const dueDate = new Date(task.dueDate);
                    if (task.dueTime) {
                        const [hours, minutes] = task.dueTime.split(':');
                        dueDate.setHours(parseInt(hours), parseInt(minutes));
                    }
                    const timeDiff = dueDate.getTime() - now.getTime();
                    if (timeDiff > 0 && timeDiff <= reminderMs) {
                        get().sendNotification(`⏰ Sắp đến hạn: ${task.title}`, {
                            body: `Còn ${Math.ceil(timeDiff / 60000)} phút`,
                            tag: `reminder-${task.id}`,
                        });
                    }
                });
            },

            checkScheduledReminders: (getMITs, getHabits) => {
                const now = new Date();
                const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                const { scheduledReminders, enabled } = get();

                // MIT Reminder
                if (scheduledReminders.mitReminder?.enabled && currentTime === scheduledReminders.mitReminder.time) {
                    if (get().shouldShowReminder('mit')) {
                        const mits = getMITs?.() || [];
                        const pending = mits.filter(t => !t.completed);
                        if (pending.length > 0) {
                            get().addToast({
                                type: 'reminder',
                                title: '⭐ MIT Reminder',
                                message: `Còn ${pending.length} MIT chưa hoàn thành!`,
                                duration: 10000,
                            });
                            if (enabled) get().sendNotification('⭐ MIT Reminder', { body: `Còn ${pending.length} MIT!` });
                            get().markReminderShown('mit');
                        }
                    }
                }

                // Shutdown Ritual
                if (scheduledReminders.shutdownRitual?.enabled && currentTime === scheduledReminders.shutdownRitual.time) {
                    if (get().shouldShowReminder('shutdown')) {
                        get().addToast({
                            type: 'reminder',
                            title: '🌅 Shutdown Ritual',
                            message: 'Đến giờ kết thúc ngày làm việc!',
                            duration: 10000,
                        });
                        if (enabled) get().sendNotification('🌅 Shutdown Ritual', { body: 'Review và lên kế hoạch!' });
                        get().markReminderShown('shutdown');
                    }
                }

                // Morning Habits
                if (scheduledReminders.morningHabits?.enabled && currentTime === scheduledReminders.morningHabits.time) {
                    if (get().shouldShowReminder('morning')) {
                        const habits = getHabits?.() || [];
                        if (habits.length > 0) {
                            get().addToast({
                                type: 'reminder',
                                title: '🌟 Chào buổi sáng!',
                                message: `${habits.length} thói quen cần check-in`,
                                duration: 10000,
                            });
                            if (enabled) get().sendNotification('🌟 Chào buổi sáng!', { body: `${habits.length} thói quen!` });
                            get().markReminderShown('morning');
                        }
                    }
                }

                // NEW - Sleep Reminder
                if (scheduledReminders.sleepReminder?.enabled && currentTime === scheduledReminders.sleepReminder.time) {
                    if (get().shouldShowReminder('sleep')) {
                        get().addToast({
                            type: 'reminder',
                            title: '😴 Đến giờ đi ngủ!',
                            message: scheduledReminders.sleepReminder.message || 'Nghỉ ngơi để có sức khỏe tốt!',
                            duration: 15000,
                        });
                        if (enabled) {
                            get().sendNotification('😴 Đến giờ đi ngủ!', {
                                body: scheduledReminders.sleepReminder.message || 'Nghỉ ngơi để có sức khỏe tốt!'
                            });
                        }
                        get().markReminderShown('sleep');
                    }
                }
            },
        }),
        {
            name: 'workflow-notifications',
            partialize: (state) => ({
                enabled: state.enabled,
                reminderMinutes: state.reminderMinutes,
                soundEnabled: state.soundEnabled,
                scheduledReminders: state.scheduledReminders,
                breakReminder: state.breakReminder,
                lastShownDates: state.lastShownDates,
            }),
        }
    )
);

