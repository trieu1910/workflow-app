// Goal Templates - Pre-defined goals with milestones and habits
export const GOAL_TEMPLATES = {
    ielts: {
        title: 'IELTS 7.0+',
        description: 'Đạt band 7.0 trong kỳ thi IELTS',
        area: 'learning',
        timeframe: '6months',
        smart: {
            specific: 'Đạt band 7.0 IELTS (Listening 7, Reading 7, Writing 6.5, Speaking 6.5)',
            measurable: 'Điểm IELTS chính thức',
            achievable: 'Học 2h/ngày, có lộ trình rõ ràng',
            relevant: 'Cần cho du học/dịch từ',
        },
        milestones: [
            { title: 'Foundation (1 tháng)', description: 'Nắm vững ngữ pháp, từ vựng cơ bản' },
            { title: 'Listening & Reading (2 tháng)', description: 'Practice test, đạt 6.5' },
            { title: 'Writing (2 tháng)', description: 'Task 1 & 2, feedback từ giáo viên' },
            { title: 'Speaking & Mock (1 tháng)', description: 'Practice speaking, mock test' },
        ],
        habits: [
            { title: 'Học 30 từ vựng mới', icon: '📚' },
            { title: 'Luyện Listening 30 phút', icon: '🎧' },
            { title: 'Đọc 1 passage', icon: '📖' },
        ],
    },
    fitness: {
        title: 'Giảm 5kg & Fit',
        description: 'Giảm cân và tăng cường sức khỏe',
        area: 'health',
        timeframe: '3months',
        smart: {
            specific: 'Giảm 5kg, tăng muscle, chạy được 5km',
            measurable: 'Cân nặng, body composition, thời gian chạy',
            achievable: 'Tập 4x/tuần, ăn uống lành mạnh',
            relevant: 'Sức khỏe là nền tảng mọi thứ',
        },
        milestones: [
            { title: 'Tuần 1-2: Tạo thói quen', description: 'Tập quen với lịch tập' },
            { title: 'Tháng 1: Giảm 2kg', description: 'Cardio + clean eating' },
            { title: 'Tháng 2: Tăng intensity', description: 'Weight training + HIIT' },
            { title: 'Tháng 3: Đạt mục tiêu', description: 'Duy trì và hoàn thiện' },
        ],
        habits: [
            { title: 'Tập gym/chạy bộ', icon: '💪' },
            { title: 'Uống 2L nước', icon: '💧' },
            { title: 'Không ăn sau 8pm', icon: '🌙' },
        ],
    },
    reading: {
        title: 'Đọc 12 cuốn sách/năm',
        description: 'Đọc 1 cuốn sách mỗi tháng',
        area: 'learning',
        timeframe: '1year',
        smart: {
            specific: 'Đọc xong 12 cuốn sách trong các lĩnh vực khác nhau',
            measurable: 'Số sách đọc xong, notes tóm tắt',
            achievable: 'Đọc 20-30 trang/ngày',
            relevant: 'Mở rộng kiến thức và tư duy',
        },
        milestones: [
            { title: 'Q1: 3 cuốn đầu', description: 'Tạo thói quen đọc' },
            { title: 'Q2: Thêm 3 cuốn', description: 'Đọc sâu hơn, ghi notes' },
            { title: 'Q3: Thêm 3 cuốn', description: 'Apply kiến thức' },
            { title: 'Q4: Hoàn thành 12', description: 'Review và tổng kết' },
        ],
        habits: [
            { title: 'Đọc 30 phút', icon: '📚' },
            { title: 'Viết notes sách', icon: '📝' },
        ],
    },
    financial: {
        title: 'Tiết kiệm 50 triệu',
        description: 'Xây dựng quỹ dự phòng',
        area: 'finance',
        timeframe: '1year',
        smart: {
            specific: 'Tiết kiệm 50 triệu VND trong quỹ dự phòng',
            measurable: 'Số tiền trong tài khoản tiết kiệm',
            achievable: '~4.2 triệu/tháng với thu nhập hiện tại',
            relevant: 'An toàn tài chính cá nhân',
        },
        milestones: [
            { title: 'Tháng 1-3: 12.5 triệu', description: 'Thiết lập budget' },
            { title: 'Tháng 4-6: 25 triệu', description: 'Cắt giảm chi tiêu' },
            { title: 'Tháng 7-9: 37.5 triệu', description: 'Duy trì kỷ luật' },
            { title: 'Tháng 10-12: 50 triệu', description: 'Hoàn thành mục tiêu' },
        ],
        habits: [
            { title: 'Ghi chi tiêu', icon: '💰' },
            { title: 'Review ngân sách', icon: '📊' },
        ],
    },
    coding: {
        title: 'Học React/NextJS',
        description: 'Thành thạo React ecosystem',
        area: 'career',
        timeframe: '3months',
        smart: {
            specific: 'Xây dựng 3 projects với React/NextJS',
            measurable: 'Projects hoàn thành, deploy live',
            achievable: 'Học 1-2h/ngày, follow course',
            relevant: 'Nâng cao kỹ năng frontend',
        },
        milestones: [
            { title: 'React Basics', description: 'Components, Hooks, State' },
            { title: 'Project 1: Todo App', description: 'CRUD, local storage' },
            { title: 'NextJS & APIs', description: 'Routing, SSR, API routes' },
            { title: 'Project 2-3: Full App', description: 'Auth, database, deploy' },
        ],
        habits: [
            { title: 'Code 1 giờ', icon: '💻' },
            { title: 'Xem 1 video tutorial', icon: '🎥' },
        ],
    },
};

// Habit Bundle Templates
export const HABIT_BUNDLES = {
    morning: {
        name: 'Morning Routine',
        icon: '🌅',
        description: 'Thói quen buổi sáng năng lượng',
        habits: [
            { title: 'Dậy sớm 6:00', icon: '⏰', color: '#f97316' },
            { title: 'Uống 1 ly nước', icon: '💧', color: '#3b82f6' },
            { title: 'Tập thể dục 15 phút', icon: '💪', color: '#22c55e' },
            { title: 'Thiền 10 phút', icon: '🧘', color: '#a855f7' },
            { title: 'Viết 3 điều biết ơn', icon: '📝', color: '#ec4899' },
        ],
    },
    evening: {
        name: 'Evening Routine',
        icon: '🌙',
        description: 'Thói quen buổi tối thư giãn',
        habits: [
            { title: 'Không screen sau 9pm', icon: '📵', color: '#ef4444' },
            { title: 'Đọc sách 20 phút', icon: '📚', color: '#3b82f6' },
            { title: 'Chuẩn bị cho ngày mai', icon: '📋', color: '#22c55e' },
            { title: 'Ngủ trước 11pm', icon: '😴', color: '#6366f1' },
        ],
    },
    productivity: {
        name: 'Productivity Boost',
        icon: '🚀',
        description: 'Thói quen tăng năng suất',
        habits: [
            { title: 'Review mục tiêu', icon: '🎯', color: '#f97316' },
            { title: 'Làm MIT đầu tiên', icon: '⭐', color: '#eab308' },
            { title: 'Time blocking', icon: '📊', color: '#3b82f6' },
            { title: 'Weekly review', icon: '📈', color: '#22c55e' },
        ],
    },
    health: {
        name: 'Health Essentials',
        icon: '❤️',
        description: 'Thói quen sức khỏe cơ bản',
        habits: [
            { title: 'Uống đủ 2L nước', icon: '💧', color: '#3b82f6' },
            { title: 'Đi bộ 10.000 bước', icon: '🚶', color: '#22c55e' },
            { title: 'Ăn rau xanh', icon: '🥗', color: '#84cc16' },
            { title: 'Ngủ đủ 7-8h', icon: '😴', color: '#6366f1' },
        ],
    },
    learning: {
        name: 'Daily Learning',
        icon: '📚',
        description: 'Thói quen học tập mỗi ngày',
        habits: [
            { title: 'Đọc 30 phút', icon: '📖', color: '#3b82f6' },
            { title: 'Học từ vựng mới', icon: '🔤', color: '#22c55e' },
            { title: 'Xem 1 video học', icon: '🎥', color: '#ef4444' },
            { title: 'Viết notes', icon: '📝', color: '#f97316' },
        ],
    },
};
