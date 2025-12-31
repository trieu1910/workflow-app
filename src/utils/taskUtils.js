/**
 * Task Utility Functions
 * Các hàm tiện ích cho task - tách khỏi store để tránh re-render không cần thiết
 */

import { STAGES } from '../stores/useTaskStore';

/**
 * Lấy tasks theo stage
 * @param {Array} tasks - Mảng tasks
 * @param {string} stage - Stage cần lọc
 * @returns {Array} Tasks trong stage đó
 */
export const getTasksByStage = (tasks, stage) => {
    return tasks.filter(t => t.stage === stage);
};

/**
 * Lấy tasks của ngày hôm nay (dueDate hoặc scheduledFor = today)
 * @param {Array} tasks - Mảng tasks
 * @returns {Array} Today tasks
 */
export const getTodayTasksFromArray = (tasks) => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => {
        if (t.stage === STAGES.DONE) return false;
        if (t.dueDate === today) return true;
        if (t.scheduledFor === today) return true;
        return false;
    });
};

/**
 * Tính stage counts từ mảng tasks
 * @param {Array} tasks - Mảng tasks
 * @returns {Object} Counts theo từng stage
 */
export const calculateStageCounts = (tasks) => ({
    inbox: tasks.filter(t => t.stage === STAGES.INBOX).length,
    prioritized: tasks.filter(t => t.stage === STAGES.PRIORITIZED).length,
    scheduled: tasks.filter(t => t.stage === STAGES.SCHEDULED).length,
    inProgress: tasks.filter(t => t.stage === STAGES.IN_PROGRESS).length,
    done: tasks.filter(t => t.stage === STAGES.DONE).length,
    someday: tasks.filter(t => t.stage === STAGES.SOMEDAY).length,
});

/**
 * Lấy MIT tasks của ngày hôm nay
 * @param {Array} tasks - Mảng tasks
 * @returns {Array} Today MITs
 */
export const getTodayMITsFromArray = (tasks) => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.isMIT && t.mitDate === today && !t.completed);
};

/**
 * Format date string sang display format
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @returns {string} Formatted date
 */
export const formatTaskDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateOnly = dateStr;
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (dateOnly === todayStr) return 'Hôm nay';
    if (dateOnly === tomorrowStr) return 'Ngày mai';

    return date.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });
};
