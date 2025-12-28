import { Zap, Target, Clock, Flame, Trophy, TrendingUp } from 'lucide-react';
import { useStatsStore, getLevelInfo } from '../stores/useStatsStore';
import { useTaskStore } from '../stores/useTaskStore';
import Heatmap from './Heatmap';

export default function StatsPanel() {
    const {
        totalXP,
        currentStreak,
        longestStreak,
        tasksCompletedToday,
        totalTasksCompleted,
        focusTimeToday,
        weeklyData
    } = useStatsStore();

    const tasks = useTaskStore((state) => state.tasks);
    const levelInfo = getLevelInfo(totalXP);

    const formatFocusTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes} phút`;
    };

    // Calculate weekly stats
    const getLast7Days = () => {
        const days = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayData = weeklyData[dateStr] || { completed: 0, focusTime: 0 };

            days.push({
                date: dateStr,
                day: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
                completed: dayData.completed,
                focusTime: dayData.focusTime,
            });
        }

        return days;
    };

    const weekDays = getLast7Days();
    const maxCompleted = Math.max(...weekDays.map(d => d.completed), 1);

    return (
        <div className="stats-panel">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Thống kê</h1>
                    <p className="page-subtitle">Theo dõi tiến độ và năng suất của bạn</p>
                </div>
            </div>

            {/* XP Progress */}
            <div className="xp-bar-container">
                <div className="xp-bar-header">
                    <div className="xp-level">
                        <div className="xp-level-badge">{levelInfo.level}</div>
                        <div>
                            <h3>Level {levelInfo.level}</h3>
                            <p>{totalXP} XP tổng cộng</p>
                        </div>
                    </div>
                    <div className="xp-next-level">
                        <span>{levelInfo.xpNeeded} XP</span>
                        <small>đến level {levelInfo.level + 1}</small>
                    </div>
                </div>
                <div className="xp-bar">
                    <div
                        className="xp-bar-fill"
                        style={{ width: `${levelInfo.progress * 100}%` }}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon primary">
                        <Target size={24} />
                    </div>
                    <div className="stat-value">{tasksCompletedToday}</div>
                    <div className="stat-label">Hoàn thành hôm nay</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon success">
                        <Trophy size={24} />
                    </div>
                    <div className="stat-value">{totalTasksCompleted}</div>
                    <div className="stat-label">Tổng đã hoàn thành</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon warning">
                        <Flame size={24} />
                    </div>
                    <div className="stat-value">{currentStreak}</div>
                    <div className="stat-label">Chuỗi ngày hiện tại</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon accent">
                        <Clock size={24} />
                    </div>
                    <div className="stat-value">{formatFocusTime(focusTimeToday)}</div>
                    <div className="stat-label">Thời gian tập trung</div>
                </div>
            </div>

            {/* Weekly Chart */}
            <div className="card weekly-chart">
                <h3>
                    <TrendingUp size={20} />
                    Hoạt động 7 ngày qua
                </h3>

                <div className="chart-container">
                    {weekDays.map((day) => (
                        <div key={day.date} className="chart-bar-container">
                            <div className="chart-bar-wrapper">
                                <div
                                    className="chart-bar"
                                    style={{
                                        height: `${(day.completed / maxCompleted) * 100}%`,
                                        minHeight: day.completed > 0 ? '10%' : '4px',
                                    }}
                                >
                                    {day.completed > 0 && (
                                        <span className="chart-bar-value">{day.completed}</span>
                                    )}
                                </div>
                            </div>
                            <span className="chart-label">{day.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Achievements Preview */}
            <div className="card achievements-preview">
                <h3>
                    <Trophy size={20} />
                    Thành tựu
                </h3>

                <div className="achievements-grid">
                    <div className={`achievement ${totalTasksCompleted >= 1 ? 'unlocked' : 'locked'}`}>
                        <div className="achievement-icon">🎯</div>
                        <div className="achievement-info">
                            <span className="achievement-name">Khởi đầu</span>
                            <span className="achievement-desc">Hoàn thành task đầu tiên</span>
                        </div>
                    </div>

                    <div className={`achievement ${currentStreak >= 3 ? 'unlocked' : 'locked'}`}>
                        <div className="achievement-icon">🔥</div>
                        <div className="achievement-info">
                            <span className="achievement-name">Nhiệt huyết</span>
                            <span className="achievement-desc">Chuỗi 3 ngày</span>
                        </div>
                    </div>

                    <div className={`achievement ${currentStreak >= 7 ? 'unlocked' : 'locked'}`}>
                        <div className="achievement-icon">⚡</div>
                        <div className="achievement-info">
                            <span className="achievement-name">Không thể cản</span>
                            <span className="achievement-desc">Chuỗi 7 ngày</span>
                        </div>
                    </div>

                    <div className={`achievement ${totalXP >= 500 ? 'unlocked' : 'locked'}`}>
                        <div className="achievement-icon">💎</div>
                        <div className="achievement-info">
                            <span className="achievement-name">Chuyên gia</span>
                            <span className="achievement-desc">Đạt 500 XP</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Heatmap */}
            <Heatmap />

            <style>{`
        .stats-panel {
          max-width: 900px;
        }
        
        .xp-next-level {
          text-align: right;
        }
        
        .xp-next-level span {
          display: block;
          font-weight: 700;
          color: var(--primary);
          font-size: 1.25rem;
        }
        
        .xp-next-level small {
          color: var(--text-muted);
          font-size: 0.8rem;
        }
        
        .weekly-chart {
          margin-bottom: var(--spacing-xl);
        }
        
        .weekly-chart h3 {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-lg);
        }
        
        .chart-container {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 200px;
          padding: var(--spacing-md) 0;
          gap: var(--spacing-sm);
        }
        
        .chart-bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }
        
        .chart-bar-wrapper {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        
        .chart-bar {
          width: 80%;
          max-width: 50px;
          background: linear-gradient(180deg, var(--primary), var(--primary-dark));
          border-radius: var(--radius-md) var(--radius-md) 0 0;
          position: relative;
          transition: height var(--transition-base);
        }
        
        .chart-bar-value {
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--primary);
        }
        
        .chart-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: var(--spacing-sm);
          text-transform: capitalize;
        }
        
        .achievements-preview h3 {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-lg);
        }
        
        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md);
        }
        
        .achievement {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          transition: all var(--transition-fast);
        }
        
        .achievement.unlocked {
          background: linear-gradient(135deg, var(--primary-glow), transparent);
          border-color: var(--primary);
        }
        
        .achievement.locked {
          opacity: 0.5;
          filter: grayscale(1);
        }
        
        .achievement-icon {
          font-size: 2rem;
        }
        
        .achievement-info {
          display: flex;
          flex-direction: column;
        }
        
        .achievement-name {
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .achievement-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
      `}</style>
        </div>
    );
}
