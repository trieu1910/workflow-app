/**
 * Habit Utility Functions
 * Các hàm tiện ích cho habit - tách khỏi store để tránh re-render không cần thiết
 */

/**
 * Format date sang local timezone YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} YYYY-MM-DD format
 */
export const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Tính streak cho một habit từ checkIns object
 * @param {Object} checkIns - Object chứa tất cả check-ins { habitId: { 'YYYY-MM-DD': true } }
 * @param {string} habitId - ID của habit
 * @returns {number} Số ngày streak liên tiếp
 */
export const calculateStreak = (checkIns, habitId) => {
    const habitCheckIns = checkIns[habitId] || {};
    if (Object.keys(habitCheckIns).length === 0) return 0;

    let streak = 0;
    const today = new Date();

    for (let i = 0; i <= 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = formatLocalDate(checkDate);

        if (habitCheckIns[dateStr]) {
            streak++;
        } else if (i > 0) {
            // Cho phép bỏ lỡ hôm nay, nhưng break nếu bỏ lỡ ngày khác
            break;
        }
    }

    return streak;
};

/**
 * Tính weekly completion rate cho một habit
 * @param {Object} checkIns - Object chứa tất cả check-ins
 * @param {string} habitId - ID của habit
 * @returns {number} Phần trăm hoàn thành trong 7 ngày qua (0-100)
 */
export const getWeeklyRate = (checkIns, habitId) => {
    const habitCheckIns = checkIns[habitId] || {};
    const today = new Date();
    let count = 0;

    for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = formatLocalDate(checkDate);
        if (habitCheckIns[dateStr]) count++;
    }

    return Math.round((count / 7) * 100);
};

/**
 * Lấy 7 ngày gần nhất với tên ngày tiếng Việt
 * @returns {Array<{date: string, dayName: string, isToday: boolean}>}
 */
export const getLast7Days = () => {
    const days = [];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push({
            date: formatLocalDate(d),
            dayName: dayNames[d.getDay()],
            isToday: i === 0,
        });
    }
    return days;
};

/**
 * Kiểm tra habit có được check-in cho một ngày cụ thể không
 * @param {Object} checkIns - Object chứa tất cả check-ins
 * @param {string} habitId - ID của habit
 * @param {string} date - Date string (YYYY-MM-DD)
 * @returns {boolean}
 */
export const isHabitChecked = (checkIns, habitId, date) => {
    return !!(checkIns[habitId] && checkIns[habitId][date]);
};

/**
 * Tính today status cho tất cả habits
 * @param {Array} habits - Mảng habits 
 * @param {Object} checkIns - Object chứa tất cả check-ins
 * @returns {{total: number, completed: number, pending: number, percentage: number}}
 */
export const getTodayHabitStatus = (habits, checkIns) => {
    const activeHabits = habits.filter(h => h.active);
    const today = formatLocalDate(new Date());
    const completed = activeHabits.filter(h => isHabitChecked(checkIns, h.id, today)).length;

    return {
        total: activeHabits.length,
        completed,
        pending: activeHabits.length - completed,
        percentage: activeHabits.length > 0 ? Math.round((completed / activeHabits.length) * 100) : 0,
    };
};
