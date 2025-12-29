import { useMemo } from 'react';
import { TrendingUp, Target, Clock, CheckCircle, Flame, Award, Calendar, BarChart2 } from 'lucide-react';
import { useTaskStore, STAGES } from '../stores/useTaskStore';
import { useGoalStore, LIFE_AREAS } from '../stores/useGoalStore';
import { useHabitStore } from '../stores/useHabitStore';
import { useStatsStore, getLevelInfo } from '../stores/useStatsStore';

export default function InsightsView() {
    const tasks = useTaskStore((state) => state.tasks);
    const { goals, milestones } = useGoalStore();
    const { habits, getTodayStatus, getStreak } = useHabitStore();
    const totalXP = useStatsStore((state) => state.totalXP);
    const levelInfo = getLevelInfo(totalXP);

    // Calculate weekly stats
    const weeklyStats = useMemo(() => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const completedThisWeek = tasks.filter(
            t => t.stage === STAGES.DONE && new Date(t.completedAt) > weekAgo
        );

        const totalMinutes = completedThisWeek.reduce(
            (sum, t) => sum + (t.actualMinutes || t.estimatedMinutes || 0), 0
        );

        // Tasks by area
        const tasksByArea = {};
        Object.keys(LIFE_AREAS).forEach(area => {
            const areaGoals = goals.filter(g => g.area === area);
            const goalIds = areaGoals.map(g => g.id);
            const milestonesOfArea = milestones.filter(m => goalIds.includes(m.goalId));
            const milestoneIds = milestonesOfArea.map(m => m.id);

            tasksByArea[area] = completedThisWeek.filter(
                t => milestoneIds.includes(t.milestoneId) || goalIds.includes(t.goalId)
            ).length;
        });

        return {
            completed: completedThisWeek.length,
            totalMinutes,
            tasksByArea,
        };
    }, [tasks, goals, milestones]);

    // Calculate productivity score (0-100)
    const productivityScore = useMemo(() => {
        let score = 0;

        // Tasks completed (max 40 points)
        score += Math.min(40, weeklyStats.completed * 4);

        // Goal progress (max 30 points)
        const activeGoals = goals.filter(g => g.status === 'active');
        if (activeGoals.length > 0) {
            const totalProgress = activeGoals.reduce((sum, g) => {
                const gMilestones = milestones.filter(m => m.goalId === g.id);
                if (gMilestones.length === 0) return sum;
                const mProgress = gMilestones.reduce((s, m) => s + (m.progress || 0), 0) / gMilestones.length;
                return sum + mProgress;
            }, 0);
            score += Math.min(30, (totalProgress / activeGoals.length) * 0.3);
        }

        // Habits (max 30 points)
        const todayStatus = getTodayStatus();
        score += (todayStatus.percentage / 100) * 30;

        return Math.round(score);
    }, [weeklyStats, goals, milestones, getTodayStatus]);

    // Get habits with best streaks
    const topHabits = useMemo(() => {
        return habits
            .filter(h => h.active)
            .map(h => ({ ...h, streak: getStreak(h.id) }))
            .sort((a, b) => b.streak - a.streak)
            .slice(0, 3);
    }, [habits, getStreak]);

    const formatTime = (minutes) => {
        if (minutes < 60) return `${minutes} phút`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    return (
        <div className="insights-view">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📊 Productivity Insights</h1>
                    <p className="page-subtitle">Tổng quan hoạt động tuần này</p>
                </div>
            </div>

            {/* Score Card */}
            <div className="score-card">
                <div className="score-circle">
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" className="score-bg" />
                        <circle
                            cx="50" cy="50" r="45"
                            className="score-fill"
                            strokeDasharray={`${productivityScore * 2.83} 283`}
                        />
                    </svg>
                    <div className="score-value">{productivityScore}</div>
                </div>
                <div className="score-info">
                    <h3>Điểm năng suất</h3>
                    <p>
                        {productivityScore >= 80 ? '🔥 Xuất sắc! Tiếp tục phát huy!' :
                            productivityScore >= 60 ? '👍 Tốt! Có thể cải thiện thêm.' :
                                productivityScore >= 40 ? '💪 Khá! Hãy cố gắng hơn.' :
                                    '🌱 Hãy bắt đầu xây dựng thói quen!'}
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <CheckCircle size={24} className="stat-icon success" />
                    <div className="stat-info">
                        <span className="stat-value">{weeklyStats.completed}</span>
                        <span className="stat-label">Tasks hoàn thành</span>
                    </div>
                </div>

                <div className="stat-card">
                    <Clock size={24} className="stat-icon primary" />
                    <div className="stat-info">
                        <span className="stat-value">{formatTime(weeklyStats.totalMinutes)}</span>
                        <span className="stat-label">Thời gian làm việc</span>
                    </div>
                </div>

                <div className="stat-card">
                    <Target size={24} className="stat-icon accent" />
                    <div className="stat-info">
                        <span className="stat-value">{goals.filter(g => g.status === 'active').length}</span>
                        <span className="stat-label">Mục tiêu đang theo</span>
                    </div>
                </div>

                <div className="stat-card">
                    <Award size={24} className="stat-icon warning" />
                    <div className="stat-info">
                        <span className="stat-value">Lv.{levelInfo.level}</span>
                        <span className="stat-label">{totalXP} XP</span>
                    </div>
                </div>
            </div>

            {/* Time by Area */}
            <div className="section-card">
                <h3><BarChart2 size={20} /> Tasks theo lĩnh vực (tuần này)</h3>
                <div className="area-bars">
                    {Object.entries(LIFE_AREAS).map(([key, area]) => {
                        const count = weeklyStats.tasksByArea[key] || 0;
                        const maxCount = Math.max(...Object.values(weeklyStats.tasksByArea), 1);
                        const percentage = (count / maxCount) * 100;

                        return (
                            <div key={key} className="area-bar-row">
                                <span className="area-label">
                                    {area.icon} {area.name}
                                </span>
                                <div className="area-bar-container">
                                    <div
                                        className="area-bar-fill"
                                        style={{ width: `${percentage}%`, background: area.color }}
                                    />
                                </div>
                                <span className="area-count">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Top Habits */}
            <div className="section-card">
                <h3><Flame size={20} /> Top Streaks</h3>
                {topHabits.length === 0 ? (
                    <p className="empty-text">Chưa có thói quen nào</p>
                ) : (
                    <div className="top-habits">
                        {topHabits.map((habit, index) => (
                            <div key={habit.id} className="habit-row">
                                <span className="habit-rank">#{index + 1}</span>
                                <span className="habit-icon">{habit.icon}</span>
                                <span className="habit-title">{habit.title}</span>
                                <span className="habit-streak">🔥 {habit.streak} ngày</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
        .insights-view { max-width: 800px; }
        
        .score-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-xl);
          background: linear-gradient(135deg, var(--primary), var(--accent));
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
          margin-bottom: var(--spacing-lg);
          color: white;
        }
        
        .score-circle {
          position: relative;
          width: 120px;
          height: 120px;
        }
        
        .score-circle svg {
          transform: rotate(-90deg);
        }
        
        .score-bg {
          fill: none;
          stroke: rgba(255,255,255,0.2);
          stroke-width: 8;
        }
        
        .score-fill {
          fill: none;
          stroke: white;
          stroke-width: 8;
          stroke-linecap: round;
          transition: stroke-dasharray 0.5s ease;
        }
        
        .score-value {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
        }
        
        .score-info h3 { font-size: 1.25rem; margin-bottom: var(--spacing-xs); }
        .score-info p { opacity: 0.9; font-size: 0.95rem; }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
        }
        
        .stat-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
        }
        
        .stat-icon { padding: var(--spacing-sm); border-radius: var(--radius-md); }
        .stat-icon.success { background: var(--success-glow); color: var(--success); }
        .stat-icon.primary { background: var(--primary-glow); color: var(--primary); }
        .stat-icon.accent { background: var(--accent-glow); color: var(--accent); }
        .stat-icon.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        
        .stat-info { display: flex; flex-direction: column; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
        .stat-label { font-size: 0.8rem; color: var(--text-muted); }
        
        .section-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
        }
        
        .section-card h3 {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: 1rem;
          color: var(--text-primary);
          margin-bottom: var(--spacing-md);
        }
        
        .area-bars { display: flex; flex-direction: column; gap: var(--spacing-sm); }
        
        .area-bar-row {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
        
        .area-label {
          width: 150px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        
        .area-bar-container {
          flex: 1;
          height: 8px;
          background: var(--bg-secondary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        
        .area-bar-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width var(--transition-base);
        }
        
        .area-count {
          width: 30px;
          text-align: right;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .top-habits { display: flex; flex-direction: column; gap: var(--spacing-sm); }
        
        .habit-row {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }
        
        .habit-rank { font-weight: 700; color: var(--primary); width: 30px; }
        .habit-icon { font-size: 1.25rem; }
        .habit-title { flex: 1; color: var(--text-primary); }
        .habit-streak { font-weight: 600; color: var(--accent); }
        
        .empty-text { color: var(--text-muted); text-align: center; padding: var(--spacing-md); }
      `}</style>
        </div>
    );
}
