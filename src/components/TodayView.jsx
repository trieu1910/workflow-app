import { useMemo } from 'react';
import { Target, Star, Zap, CheckCircle, TrendingUp, Calendar, Flame, ArrowRight, Clock, Settings } from 'lucide-react';
import { useTaskStore, STAGES } from '../stores/useTaskStore';
import { useGoalStore, LIFE_AREAS } from '../stores/useGoalStore';
import { useHabitStore } from '../stores/useHabitStore';
import { useStatsStore } from '../stores/useStatsStore';

export default function TodayView({ onNavigate, onStartFocus }) {
    const tasks = useTaskStore((state) => state.tasks);
    const getTodayMITs = useTaskStore((state) => state.getTodayMITs);
    const completeTask = useTaskStore((state) => state.completeTask);
    const { goals, getMilestonesByGoal } = useGoalStore();
    const { habits, checkIns, checkIn } = useHabitStore();
    const { weeklyData, currentStreak } = useStatsStore();

    const today = new Date().toISOString().split('T')[0];
    const todayMITs = getTodayMITs ? getTodayMITs() : [];

    // Date formatting
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
    };

    // Calculate Focus Time
    const todayFocusSeconds = weeklyData?.[today]?.focusTime || 0;
    const focusHours = Math.floor(todayFocusSeconds / 3600);
    const focusMins = Math.floor((todayFocusSeconds % 3600) / 60);
    const focusDisplay = focusHours > 0 ? `${focusHours}h ${focusMins}p` : `${focusMins}p`;

    // Habit Progress
    const activeHabits = habits.filter(h => h.active);
    const habitsDoneCount = activeHabits.filter(h => checkIns[h.id]?.[today]).length;
    const habitsProgress = activeHabits.length > 0 ? Math.round((habitsDoneCount / activeHabits.length) * 100) : 0;

    // Get Active Focus Goal (Quick Win)
    const focusGoal = useMemo(() => {
        return goals
            .filter(g => g.status === 'active')
            .sort((a, b) => {
                const aScore = (a.priority?.impact || 3) - (a.priority?.effort || 3);
                const bScore = (b.priority?.impact || 3) - (b.priority?.effort || 3);
                return bScore - aScore;
            })[0];
    }, [goals]);

    const focusGoalArea = focusGoal ? LIFE_AREAS[focusGoal.area] : null;

    // Calculate focus goal progress
    const focusGoalProgress = useMemo(() => {
        if (!focusGoal) return 0;
        const goalMilestones = getMilestonesByGoal(focusGoal.id);
        if (goalMilestones.length === 0) return 0;
        const goalTasks = tasks.filter(t => goalMilestones.some(m => m.id === t.milestoneId));
        if (goalTasks.length === 0) return 0;
        const completed = goalTasks.filter(t => t.completed).length;
        return Math.round((completed / goalTasks.length) * 100);
    }, [focusGoal, tasks, getMilestonesByGoal]);

    // Tasks stats
    const todayCompleted = tasks.filter(t => t.completedAt?.startsWith(today)).length;
    const scheduledToday = tasks.filter(t => t.scheduledFor === today && !t.completed)
        .sort((a, b) => (a.scheduledTime || '23:59').localeCompare(b.scheduledTime || '23:59'));

    // Week time remaining
    const weekTimeRemaining = useMemo(() => {
        const now = new Date();
        const day = now.getDay();
        const daysUntilSunday = day === 0 ? 0 : 7 - day;

        // End of Sunday (23:59:59)
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + daysUntilSunday);
        endOfWeek.setHours(23, 59, 59, 999);

        const diff = endOfWeek - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return { days, hours, percent: Math.round(((7 - daysUntilSunday) / 7) * 100) };
    }, [today]);

    return (
        <div className="today-view">
            {/* Header / Command Bar */}
            <div className="command-header">
                <div>
                    <h1 className="date-title">{formatDate(today)}</h1>
                    <p className="greeting-text">Sẵn sàng bứt phá hôm nay chưa?</p>
                </div>
                <div className="quick-stats">
                    <div className="stat-pill week-timer" title="Thời gian còn lại trong tuần">
                        <Calendar size={16} className="text-purple-500" />
                        <span>{weekTimeRemaining.days}d {weekTimeRemaining.hours}h</span>
                        <div className="week-progress-mini" style={{ '--week-percent': `${weekTimeRemaining.percent}%` }} />
                    </div>
                    <div className="stat-pill" title="Streak">
                        <Flame size={16} className="text-orange-500" />
                        <span>{currentStreak} ngày</span>
                    </div>
                    <div className="stat-pill" title="Focus Time">
                        <Clock size={16} className="text-blue-500" />
                        <span>{focusDisplay} focus</span>
                    </div>
                    <div className="stat-pill" title="Tasks Done">
                        <CheckCircle size={16} className="text-green-500" />
                        <span>{todayCompleted} xong</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Left Column: Focus & MITs */}
                <div className="dashboard-col main-col">
                    {/* Focus Goal Card */}
                    {focusGoal && (
                        <div className="card focus-card" style={{ '--card-color': focusGoalArea?.color }}>
                            <div className="card-header">
                                <div className="card-title-group">
                                    <Target size={20} />
                                    <h3>Mục tiêu trọng tâm</h3>
                                </div>
                                <span className="progress-text">{focusGoalProgress}%</span>
                            </div>
                            <div className="goal-content">
                                <h4>{focusGoalArea?.icon} {focusGoal.title}</h4>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${focusGoalProgress}%` }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MIT Section */}
                    <div className="card mit-card-group">
                        <div className="card-header">
                            <h3><Star size={20} className="text-yellow-500" /> 3 Nhiệm vụ quan trọng (MIT)</h3>
                            {todayMITs.length === 0 && (
                                <button className="btn btn-sm btn-ghost" onClick={() => onNavigate?.('inbox')}>+ Chọn</button>
                            )}
                        </div>
                        <div className="mit-list">
                            {todayMITs.length > 0 ? todayMITs.map((task, index) => (
                                <div key={task.id} className="mit-item">
                                    <span className="mit-index">#{index + 1}</span>
                                    <div className="mit-info">
                                        <span className="task-title">{task.title}</span>
                                    </div>
                                    <button className="btn btn-primary btn-sm" onClick={() => onStartFocus?.(task)}>
                                        <Zap size={14} /> Focus
                                    </button>
                                </div>
                            )) : (
                                <div className="empty-state">Chọn 3 việc quan trọng nhất để làm hôm nay!</div>
                            )}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="card timeline-card">
                        <div className="card-header">
                            <h3><Calendar size={20} className="text-purple-500" /> Lịch trình</h3>
                            <span className="badge">{scheduledToday.length}</span>
                        </div>
                        <div className="timeline-list">
                            {scheduledToday.length > 0 ? scheduledToday.map(task => (
                                <div key={task.id} className="timeline-item">
                                    <div className="time-col">
                                        <span className="time-text">{task.scheduledTime || 'Anytime'}</span>
                                        <div className="time-line"></div>
                                    </div>
                                    <div className="task-col">
                                        <span className="task-title">{task.title}</span>
                                        <button className="check-btn" onClick={() => completeTask(task.id)}>
                                            <div className="circle" />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="empty-state">Không có lịch trình cụ thể.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Habits & Quick Actions */}
                <div className="dashboard-col side-col">
                    {/* Habits Widget */}
                    <div className="card habits-widget">
                        <div className="card-header">
                            <h3><TrendingUp size={20} className="text-green-500" /> Thói quen</h3>
                            <span className="badge success">{habitsDoneCount}/{activeHabits.length}</span>
                        </div>
                        <div className="habit-mini-list">
                            {activeHabits.slice(0, 5).map(habit => {
                                const isDone = !!checkIns[habit.id]?.[today];
                                return (
                                    <div
                                        key={habit.id}
                                        className={`habit-mini-item ${isDone ? 'done' : ''}`}
                                        onClick={() => !isDone && checkIn(habit.id)}
                                        title={habit.title}
                                    >
                                        <span className="habit-icon">{habit.icon}</span>
                                        <span className="habit-label">{habit.title}</span>
                                        {isDone && <CheckCircle size={14} className="done-icon" />}
                                    </div>
                                );
                            })}
                        </div>
                        <button className="btn btn-ghost btn-block" onClick={() => onNavigate?.('habits')}>Xem tất cả</button>
                    </div>

                    {/* Quick Navigation */}
                    <div className="quick-grid">
                        <button className="quick-btn" onClick={() => onNavigate?.('goals')}>
                            <Target size={24} />
                            <span>Mục tiêu</span>
                        </button>
                        <button className="quick-btn" onClick={() => onNavigate?.('inbox')}>
                            <Zap size={24} />
                            <span>Inbox</span>
                        </button>
                        <button className="quick-btn" onClick={() => onNavigate?.('weekly')}>
                            <Calendar size={24} />
                            <span>Review</span>
                        </button>
                        <button className="quick-btn" onClick={() => onNavigate?.('settings')}>
                            <Settings size={24} />
                            <span>Cài đặt</span>
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .today-view { max-width: 1200px; margin: 0 auto; color: var(--text-primary); }
                
                .command-header {
                    display: flex; justify-content: space-between; align-items: flex-end;
                    margin-bottom: var(--spacing-xl); padding-bottom: var(--spacing-md);
                    border-bottom: 1px solid var(--border-color);
                }
                .date-title { font-size: 2rem; font-weight: 800; margin: 0; line-height: 1.2; }
                .greeting-text { color: var(--text-secondary); margin: 0; }
                
                .quick-stats { display: flex; gap: var(--spacing-md); }
                .stat-pill {
                    display: flex; align-items: center; gap: 8px;
                    padding: 8px 16px; background: var(--bg-secondary);
                    border-radius: 20px; font-weight: 500; font-size: 0.9rem;
                    position: relative; overflow: hidden;
                }
                
                .stat-pill.week-timer {
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.1));
                    border: 1px solid rgba(139, 92, 246, 0.3);
                }
                
                .week-progress-mini {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    width: var(--week-percent, 50%);
                    background: linear-gradient(90deg, #8b5cf6, #a855f7);
                    border-radius: 0 3px 3px 0;
                }

                .dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: var(--spacing-lg); }
                .dashboard-col { display: flex; flex-direction: column; gap: var(--spacing-lg); }

                .card {
                    background: var(--bg-surface); border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg); padding: var(--spacing-lg);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                }
                .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md); }
                .card-header h3 { display: flex; align-items: center; gap: 8px; font-size: 1.1rem; margin: 0; }
                
                /* Focus Card */
                .focus-card { background: linear-gradient(135deg, var(--bg-surface), var(--bg-secondary)); border-color: var(--card-color); }
                .goal-content h4 { font-size: 1.2rem; margin-bottom: var(--spacing-sm); }
                .progress-bar { height: 8px; background: rgba(0,0,0,0.1); border-radius: 4px; overflow: hidden; }
                .progress-fill { height: 100%; background: var(--card-color, var(--primary)); border-radius: 4px; }
                
                /* MIT List */
                .mit-item { display: flex; align-items: center; gap: var(--spacing-md); padding: 12px; background: var(--bg-secondary); border-radius: var(--radius-md); margin-bottom: 8px; }
                .mit-index { font-weight: 700; color: var(--text-muted); opacity: 0.5; }
                .mit-info { flex: 1; }
                .task-title { font-weight: 500; }

                /* Timeline */
                .timeline-list { display: flex; flex-direction: column; gap: 0; }
                .timeline-item { display: flex; gap: var(--spacing-md); position: relative; padding-bottom: 16px; }
                .time-col { display: flex; flex-direction: column; align-items: flex-end; min-width: 60px; position: relative; }
                .time-text { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }
                .time-line { position: absolute; right: -13px; top: 20px; bottom: -20px; width: 2px; background: var(--border-color); }
                .timeline-item:last-child .time-line { display: none; }
                .task-col { flex: 1; display: flex; align-items: center; justify-content: space-between; background: var(--bg-secondary); padding: 10px 14px; border-radius: var(--radius-md); position: relative; }
                .task-col::before { content: ''; position: absolute; left: -21px; top: 50%; width: 10px; height: 10px; background: var(--primary); border-radius: 50%; transform: translateY(-50%); z-index: 1; outline: 4px solid var(--bg-surface); }
                
                /* Habits Widget */
                .habit-mini-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
                .habit-mini-item { display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-secondary); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; }
                .habit-mini-item:hover { background: var(--primary-glow); }
                .habit-mini-item.done { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); }
                .habit-label { flex: 1; font-weight: 500; }
                .done-icon { color: var(--success); }

                /* Quick Grid */
                .quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .quick-btn { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); transition: all 0.2s; }
                .quick-btn:hover { border-color: var(--primary); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

                .empty-state { text-align: center; color: var(--text-muted); font-style: italic; padding: 20px; }
                .badge { background: var(--bg-secondary); padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
                .badge.success { background: rgba(34, 197, 94, 0.1); color: var(--success); }
                
                @media (max-width: 900px) {
                    .dashboard-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
