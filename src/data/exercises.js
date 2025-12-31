/**
 * Danh sách bài tập ngắn cho break reminder
 * Mỗi bài tập có thể được làm trong 1-2 phút
 */
export const EXERCISES = [
    {
        id: 'stretch-arms',
        icon: '💪',
        title: 'Vươn vai',
        description: 'Đứng dậy, đưa hai tay lên cao và vươn vai 10 lần',
        duration: 30, // seconds
    },
    {
        id: 'neck-rotation',
        icon: '🔄',
        title: 'Xoay cổ',
        description: 'Xoay cổ theo chiều kim đồng hồ 5 vòng, sau đó ngược lại 5 vòng',
        duration: 30,
    },
    {
        id: 'eye-rest',
        icon: '👀',
        title: 'Nghỉ mắt',
        description: 'Nhìn ra xa (cách ít nhất 6m) trong 20 giây, sau đó nhắm mắt 20 giây',
        duration: 40,
    },
    {
        id: 'walk-around',
        icon: '🚶',
        title: 'Đi lại',
        description: 'Đứng dậy đi bộ xung quanh phòng hoặc ra ngoài hít thở',
        duration: 60,
    },
    {
        id: 'drink-water',
        icon: '💧',
        title: 'Uống nước',
        description: 'Uống một cốc nước để giữ cơ thể đủ nước',
        duration: 15,
    },
    {
        id: 'shoulder-shrug',
        icon: '🤷',
        title: 'Nhún vai',
        description: 'Nhún vai lên cao giữ 5 giây, sau đó thả xuống. Lặp lại 10 lần',
        duration: 30,
    },
    {
        id: 'wrist-stretch',
        icon: '🤲',
        title: 'Giãn cổ tay',
        description: 'Duỗi tay ra và dùng tay kia kéo nhẹ các ngón tay về phía sau',
        duration: 30,
    },
    {
        id: 'deep-breath',
        icon: '🧘',
        title: 'Thở sâu',
        description: 'Hít vào 4 giây, giữ 4 giây, thở ra 4 giây. Lặp lại 5 lần',
        duration: 60,
    },
];

/**
 * Lấy ngẫu nhiên một số bài tập
 */
export const getRandomExercises = (count = 3) => {
    const shuffled = [...EXERCISES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
};

/**
 * Lấy tổng thời gian cho các bài tập (phút)
 */
export const getTotalDuration = (exercises) => {
    const totalSeconds = exercises.reduce((sum, ex) => sum + ex.duration, 0);
    return Math.ceil(totalSeconds / 60);
};
