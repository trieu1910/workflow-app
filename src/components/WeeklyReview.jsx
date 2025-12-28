import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Clock, Zap, CheckCircle, Flame, Calendar, Target } from 'lucide-react';
import { useStatsStore, getLevelInfo } from '../stores/useStatsStore';
import { useTaskStore, STAGES } from '../stores/useTaskStore';

export default function WeeklyReview() {
    const { totalXP, weeklyData, currentStreak, longestStreak, totalTasksCompleted } = useStatsStore();
    const tasks = useTaskStore((state) => state.tasks);

    // Calculate current week and last week dates
    const weeklyStats = useMemo(() => {
        const today = new Date();
        const currentWeekDays = [];
        const lastWeekDays = [];

        // Get current week (Mon-Sun)
        const dayOfWeek = today.getDay() || 7; // Sunday = 7
        const mondayThisWeek = new Date(today);
        mondayThisWeek.setDate(today.getDate() - dayOfWeek + 1);

        for (let i = 0; i < 7; i++) {
            const d = new Date(mondayThisWeek);
            d.setDate(mondayThisWeek.getDate() + i);
            currentWeekDays.push(d.toISOString().split('T')[0]);

            const lastWeekD = new Date(d);
            lastWeekD.setDate(d.getDate() - 7);
            lastWeekDays.push(lastWeekD.toISOString().split('T')[0]);
        }

        // Calculate stats for each week
        const calcWeekStats = (days) => {
            let completed = 0;
            let focusTime = 0;

            days.forEach(day => {
                if (weeklyData[day]) {
                    completed += weeklyData[day].completed || 0;
                    focusTime += weeklyData[day].focusTime || 0;
                }
            });

            return { completed, focusTime };
        };

        const thisWeek = calcWeekStats(currentWeekDays);
        const lastWeek = calcWeekStats(lastWeekDays);

        // Calculate change percentages
        const calcChange = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        return {
            thisWeek,
            lastWeek,
            completedChange: calcChange(thisWeek.completed, lastWeek.completed),
            focusTimeChange: calcChange(thisWeek.focusTime, lastWeek.focusTime),
            currentWeekDays,
        };
    }, [weeklyData]);

    // Daily breakdown for chart
    const dailyBreakdown = useMemo(() => {
        const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        return weeklyStats.currentWeekDays.map((day, index) => ({
            day: dayNames[index],
            date: day,
            completed: weeklyData[day]?.completed || 0,
            focusTime: Math.round((weeklyData[day]?.focusTime || 0) / 60), // convert to minutes
        }));
    }, [weeklyStats.currentWeekDays, weeklyData]);

    const maxCompleted = Math.max(...dailyBreakdown.map(d => d.completed), 1);
    const maxFocusTime = Math.max(...dailyBreakdown.map(d => d.focusTime), 1);

    // Tasks completed this week by stage
    const tasksThisWeek = useMemo(() => {
        const doneThisWeek = tasks.filter(t => {
            if (t.stage !== STAGES.DONE || !t.completedAt) return false;
            const completedDate = t.completedAt.split('T')[0];
            return weeklyStats.currentWeekDays.includes(completedDate);
        });
        return doneThisWeek;
    }, [tasks, weeklyStats.currentWeekDays]);

    const levelInfo = getLevelInfo(totalXP);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    const TrendIcon = ({ change }) => {
        if (change > 0) return <TrendingUp size={16} className="trend-up" />;
        if (change < 0) return <TrendingDown size={16} className="trend-down" />;
        return <Minus size={16} className="trend-neutral" />;
    };

    return (
        <div className="weekly-review">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📊 Tổng kết tuần</h1>
                    <p className="page-subtitle">
                        Tuần này từ {new Date(weeklyStats.currentWeekDays[0]).toLocaleDateString('vi-VN')}
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card">
                    <div className="card-icon tasks">
                        <CheckCircle size={24} />
                    </div>
                    <div className="card-content">
                        <span className="card-value">{weeklyStats.thisWeek.completed}</span>
                        <span className="card-label">Tasks hoàn thành</span>
                        <div className="card-change">
                            <TrendIcon change={weeklyStats.completedChange} />
                            <span className={weeklyStats.completedChange >= 0 ? 'positive' : 'negative'}>
                                {weeklyStats.completedChange >= 0 ? '+' : ''}{weeklyStats.completedChange}% so với tuần trước
                            </span>
                        </div>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-icon focus">
                        <Clock size={24} />
                    </div>
                    <div className="card-content">
                        <span className="card-value">{formatTime(weeklyStats.thisWeek.focusTime)}</span>
                        <span className="card-label">Thời gian Focus</span>
                        <div className="card-change">
                            <TrendIcon change={weeklyStats.focusTimeChange} />
                            <span className={weeklyStats.focusTimeChange >= 0 ? 'positive' : 'negative'}>
                                {weeklyStats.focusTimeChange >= 0 ? '+' : ''}{weeklyStats.focusTimeChange}% so với tuần trước
                            </span>
                        </div>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-icon streak">
                        <Flame size={24} />
                    </div>
                    <div className="card-content">
                        <span className="card-value">{currentStreak}</span>
                        <span className="card-label">Ngày streak hiện tại</span>
                        <div className="card-change">
                            <Target size={14} />
                            <span>Kỷ lục: {longestStreak} ngày</span>
                        </div>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-icon xp">
                        <Zap size={24} />
                    </div>
                    <div className="card-content">
                        <span className="card-value">Level {levelInfo.level}</span>
                        <span className="card-label">{totalXP} XP tổng cộng</span>
                        <div className="card-change">
                            <span>{levelInfo.xpNeeded} XP đến level tiếp</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Chart */}
            <div className="chart-section">
                <h3>📈 Hoạt động theo ngày</h3>
                <div className="daily-chart">
                    {dailyBreakdown.map((day, index) => {
                        const isToday = day.date === new Date().toISOString().split('T')[0];
                        return (
                            <div key={day.day} className={`chart-day ${isToday ? 'today' : ''}`}>
                                <div className="chart-bars">
                                    <div
                                        className="chart-bar tasks-bar"
                                        style={{ height: `${(day.completed / maxCompleted) * 100}%` }}
                                        title={`${day.completed} tasks`}
                                    />
                                    <div
                                        className="chart-bar focus-bar"
                                        style={{ height: `${(day.focusTime / maxFocusTime) * 100}%` }}
                                        title={`${day.focusTime}m focus`}
                                    />
                                </div>
                                <span className="chart-label">{day.day}</span>
                                <div className="chart-values">
                                    <span>{day.completed}</span>
                                    <span>{day.focusTime}m</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="chart-legend">
                    <span className="legend-item"><span className="dot tasks"></span> Tasks</span>
                    <span className="legend-item"><span className="dot focus"></span> Focus (phút)</span>
                </div>
            </div>

            {/* Tasks Completed This Week */}
            <div className="completed-section">
                <h3>✅ Đã hoàn thành tuần này ({tasksThisWeek.length})</h3>
                {tasksThisWeek.length === 0 ? (
                    <div className="empty-completed">
                        <p>Chưa có task nào hoàn thành tuần này</p>
                    </div>
                ) : (
                    <div className="completed-list">
                        {tasksThisWeek.slice(0, 10).map((task) => (
                            <div key={task.id} className="completed-item">
                                <span className="completed-check">✓</span>
                                <span className="completed-title">{task.title}</span>
                                <span className="completed-date">
                                    {new Date(task.completedAt).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        ))}
                        {tasksThisWeek.length > 10 && (
                            <div className="completed-more">
                                +{tasksThisWeek.length - 10} tasks khác
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
        .weekly-review {
          max-width: 900px;
        }
        
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }
        
        .summary-card {
          display: flex;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
        }
        
        .card-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-lg);
          flex-shrink: 0;
        }
        
        .card-icon.tasks { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
        .card-icon.focus { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
        .card-icon.streak { background: rgba(249, 115, 22, 0.15); color: #f97316; }
        .card-icon.xp { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
        
        .card-content {
          display: flex;
          flex-direction: column;
        }
        
        .card-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        
        .card-label {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        
        .card-change {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: var(--spacing-xs);
          font-size: 0.75rem;
        }
        
        .card-change .positive { color: #22c55e; }
        .card-change .negative { color: #ef4444; }
        
        .trend-up { color: #22c55e; }
        .trend-down { color: #ef4444; }
        .trend-neutral { color: var(--text-muted); }
        
        .chart-section {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }
        
        .chart-section h3 {
          margin-bottom: var(--spacing-lg);
          color: var(--text-secondary);
        }
        
        .daily-chart {
          display: flex;
          justify-content: space-between;
          gap: var(--spacing-sm);
          height: 180px;
          padding-bottom: var(--spacing-lg);
        }
        
        .chart-day {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .chart-day.today .chart-label {
          color: var(--primary);
          font-weight: 600;
        }
        
        .chart-bars {
          flex: 1;
          display: flex;
          gap: 4px;
          align-items: flex-end;
          width: 100%;
          justify-content: center;
        }
        
        .chart-bar {
          width: 16px;
          min-height: 4px;
          border-radius: 4px 4px 0 0;
          transition: height var(--transition-base);
        }
        
        .chart-bar.tasks-bar { background: #22c55e; }
        .chart-bar.focus-bar { background: #3b82f6; }
        
        .chart-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: var(--spacing-xs);
        }
        
        .chart-values {
          display: flex;
          gap: var(--spacing-xs);
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        
        .chart-legend {
          display: flex;
          justify-content: center;
          gap: var(--spacing-lg);
          margin-top: var(--spacing-md);
          padding-top: var(--spacing-md);
          border-top: 1px solid var(--border-light);
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        
        .legend-item .dot {
          width: 10px;
          height: 10px;
          border-radius: 2px;
        }
        
        .dot.tasks { background: #22c55e; }
        .dot.focus { background: #3b82f6; }
        
        .completed-section {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-lg);
        }
        
        .completed-section h3 {
          margin-bottom: var(--spacing-md);
          color: var(--text-secondary);
        }
        
        .empty-completed {
          text-align: center;
          padding: var(--spacing-lg);
          color: var(--text-muted);
        }
        
        .completed-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        
        .completed-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }
        
        .completed-check {
          color: #22c55e;
          font-weight: 600;
        }
        
        .completed-title {
          flex: 1;
          color: var(--text-primary);
          text-decoration: line-through;
          opacity: 0.8;
        }
        
        .completed-date {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        
        .completed-more {
          text-align: center;
          padding: var(--spacing-sm);
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        
        @media (max-width: 600px) {
          .summary-cards {
            grid-template-columns: 1fr 1fr;
          }
          
          .chart-bar {
            width: 12px;
          }
        }
      `}</style>
        </div>
    );
}
