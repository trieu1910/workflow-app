/**
 * Smart Parser - Parses natural language input into task data
 * Supports both Vietnamese and English
 */

// Date keywords mapping
const DATE_KEYWORDS = {
    // Vietnamese
    'hôm nay': 0,
    'hom nay': 0,
    'ngày mai': 1,
    'ngay mai': 1,
    'ngày mốt': 2,
    'ngay mot': 2,
    'tuần sau': 7,
    'tuan sau': 7,
    'tuần tới': 7,
    'tuan toi': 7,

    // English
    'today': 0,
    'tomorrow': 1,
    'next week': 7,
    'in a week': 7,
};

// Day of week mapping
const DAY_OF_WEEK = {
    // Vietnamese
    'thứ hai': 1, 'thu hai': 1, 't2': 1,
    'thứ ba': 2, 'thu ba': 2, 't3': 2,
    'thứ tư': 3, 'thu tu': 3, 't4': 3,
    'thứ năm': 4, 'thu nam': 4, 't5': 4,
    'thứ sáu': 5, 'thu sau': 5, 't6': 5,
    'thứ bảy': 6, 'thu bay': 6, 't7': 6,
    'chủ nhật': 0, 'chu nhat': 0, 'cn': 0,

    // English
    'monday': 1, 'mon': 1,
    'tuesday': 2, 'tue': 2,
    'wednesday': 3, 'wed': 3,
    'thursday': 4, 'thu': 4,
    'friday': 5, 'fri': 5,
    'saturday': 6, 'sat': 6,
    'sunday': 0, 'sun': 0,
};

// Priority keywords
const PRIORITY_KEYWORDS = {
    // High priority
    '#high': 'high',
    '#cao': 'high',
    '#gấp': 'high',
    '#gap': 'high',
    '#urgent': 'high',
    '#important': 'high',
    '#quan trọng': 'high',
    '#quan trong': 'high',
    'quan trọng': 'high',
    'gấp': 'high',
    'urgent': 'high',

    // Medium priority
    '#medium': 'medium',
    '#trung bình': 'medium',
    '#trung binh': 'medium',
    '#normal': 'medium',

    // Low priority
    '#low': 'low',
    '#thấp': 'low',
    '#thap': 'low',
    'khi rảnh': 'low',
    'khi ranh': 'low',
};

/**
 * Get the next occurrence of a day of week
 */
const getNextDayOfWeek = (dayOfWeek) => {
    const today = new Date();
    const todayDOW = today.getDay();
    let daysUntil = dayOfWeek - todayDOW;
    if (daysUntil <= 0) {
        daysUntil += 7;
    }
    const result = new Date(today);
    result.setDate(result.getDate() + daysUntil);
    return result;
};

/**
 * Parse time from text (e.g., "3h chiều", "15:00", "3pm")
 */
const parseTime = (text) => {
    const lowerText = text.toLowerCase();

    // Match Vietnamese time format: "3h", "3h30", "15h", "3 giờ"
    const vnTimeMatch = lowerText.match(/(\d{1,2})\s*[hg](?:iờ)?\s*(?:(\d{2}))?\s*(sáng|chiều|tối)?/i);
    if (vnTimeMatch) {
        let hours = parseInt(vnTimeMatch[1]);
        const minutes = vnTimeMatch[2] ? parseInt(vnTimeMatch[2]) : 0;
        const period = vnTimeMatch[3];

        if (period === 'chiều' || period === 'tối') {
            if (hours < 12) hours += 12;
        } else if (period === 'sáng' && hours === 12) {
            hours = 0;
        }

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // Match English time format: "3pm", "3:30pm", "15:00"
    const enTimeMatch = lowerText.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (enTimeMatch) {
        let hours = parseInt(enTimeMatch[1]);
        const minutes = enTimeMatch[2] ? parseInt(enTimeMatch[2]) : 0;
        const period = enTimeMatch[3]?.toLowerCase();

        if (period === 'pm' && hours < 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;

        if (hours >= 0 && hours <= 23) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
    }

    return null;
};

/**
 * Parse estimated time (e.g., "1h30p", "2 hours", "30 minutes")
 */
const parseEstimatedTime = (text) => {
    const lowerText = text.toLowerCase();

    // Match Vietnamese: "1h30p", "1 tiếng", "30 phút"
    const vnMatch = lowerText.match(/(\d+)\s*(?:h|tiếng|tieng)?\s*(?:(\d+)\s*(?:p|phút|phut))?/);
    if (vnMatch) {
        const hours = parseInt(vnMatch[1]) || 0;
        const minutes = parseInt(vnMatch[2]) || 0;
        if (hours > 0 || minutes > 0) {
            return hours * 60 + minutes;
        }
    }

    // Match English: "2 hours", "30 minutes", "1h30m"
    const hoursMatch = lowerText.match(/(\d+)\s*(?:hours?|hrs?|h)/);
    const minutesMatch = lowerText.match(/(\d+)\s*(?:minutes?|mins?|m(?!on))/);

    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

    if (hours > 0 || minutes > 0) {
        return hours * 60 + minutes;
    }

    return null;
};

/**
 * Parse tags from text (e.g., "@work", "@personal")
 */
const parseTags = (text) => {
    const tagMatches = text.match(/@\w+/g);
    if (tagMatches) {
        return tagMatches.map(tag => tag.substring(1).toLowerCase());
    }
    return [];
};

/**
 * Main parser function
 */
export const parseTaskInput = (input) => {
    let text = input.trim();
    let dueDate = null;
    let dueTime = null;
    let priority = 'medium';
    let tags = [];
    let estimatedMinutes = null;

    const lowerText = text.toLowerCase();

    // Extract tags first
    tags = parseTags(text);
    text = text.replace(/@\w+/g, '').trim();

    // Extract priority
    for (const [keyword, prio] of Object.entries(PRIORITY_KEYWORDS)) {
        if (lowerText.includes(keyword)) {
            priority = prio;
            text = text.replace(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '').trim();
            break;
        }
    }

    // Extract date keywords
    for (const [keyword, daysFromNow] of Object.entries(DATE_KEYWORDS)) {
        if (lowerText.includes(keyword)) {
            const date = new Date();
            date.setDate(date.getDate() + daysFromNow);
            dueDate = date.toISOString().split('T')[0];
            text = text.replace(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '').trim();
            break;
        }
    }

    // Extract day of week if no date found
    if (!dueDate) {
        for (const [keyword, dayNum] of Object.entries(DAY_OF_WEEK)) {
            if (lowerText.includes(keyword)) {
                const date = getNextDayOfWeek(dayNum);
                dueDate = date.toISOString().split('T')[0];
                text = text.replace(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '').trim();
                break;
            }
        }
    }

    // Extract time
    const timePatterns = [
        /lúc?\s*(\d{1,2})\s*[hg](?:iờ)?\s*(?:(\d{2}))?\s*(sáng|chiều|tối)?/gi,
        /at\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/gi,
        /vào\s*(\d{1,2})\s*[hg]/gi,
    ];

    for (const pattern of timePatterns) {
        const match = text.match(pattern);
        if (match) {
            dueTime = parseTime(match[0]);
            if (dueTime) {
                text = text.replace(pattern, '').trim();
                break;
            }
        }
    }

    // Extract estimated time
    const estPatterns = [
        /(?:mất|takes?|estimate[sd]?)\s*:?\s*(\d+\s*(?:h|tiếng|hours?)?\s*\d*\s*(?:p|phút|minutes?)?)/gi,
        /\((\d+\s*(?:h|m|p|tiếng|phút|hours?|minutes?)(?:\s*\d+\s*(?:m|p|phút|minutes?))?)\)/gi,
    ];

    for (const pattern of estPatterns) {
        const match = text.match(pattern);
        if (match) {
            estimatedMinutes = parseEstimatedTime(match[0]);
            if (estimatedMinutes) {
                text = text.replace(pattern, '').trim();
                break;
            }
        }
    }

    // Clean up remaining artifacts
    text = text
        .replace(/\s+/g, ' ')
        .replace(/^[\s,.-]+|[\s,.-]+$/g, '')
        .trim();

    // If no date was found, set to today for high priority tasks
    if (!dueDate && priority === 'high') {
        dueDate = new Date().toISOString().split('T')[0];
    }

    return {
        title: text || input.trim(),
        dueDate,
        dueTime,
        priority,
        tags,
        estimatedMinutes,
    };
};

/**
 * Format date for display
 */
export const formatDueDate = (dateStr) => {
    if (!dateStr) return null;

    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return 'Hôm nay';
    if (isTomorrow) return 'Ngày mai';

    // Check if within this week
    const daysFromNow = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    if (daysFromNow > 0 && daysFromNow <= 7) {
        const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return days[date.getDay()];
    }

    // Format as date
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
};

/**
 * Format time for display
 */
export const formatTime = (timeStr) => {
    if (!timeStr) return null;

    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    if (minutes === 0) {
        return `${displayHours} ${period}`;
    }
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Format estimated minutes for display
 */
export const formatEstimatedTime = (minutes) => {
    if (!minutes) return null;

    if (minutes < 60) {
        return `${minutes} phút`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) {
        return `${hours} tiếng`;
    }
    return `${hours}h ${mins}p`;
};
