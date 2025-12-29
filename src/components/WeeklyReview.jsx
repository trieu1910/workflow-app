import { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Clock, Zap, CheckCircle, Flame, Calendar, Target, MessageCircle, Plus, Check, Heart, AlertTriangle } from 'lucide-react';
import { useStatsStore, getLevelInfo } from '../stores/useStatsStore';
import { useTaskStore, STAGES } from '../stores/useTaskStore';
import { useWellbeingStore, MOOD_LEVELS } from '../stores/useWellbeingStore';
import { useGoalStore, LIFE_AREAS } from '../stores/useGoalStore';

export default function WeeklyReview() {
  const { totalXP, weeklyData, currentStreak, longestStreak, totalTasksCompleted } = useStatsStore();
  const tasks = useTaskStore((state) => state.tasks);
  const {
    getCurrentWeekReflection, setWeeklyReflection,
    getCurrentWeekCommitments, setWeeklyCommitment, toggleCommitment,
    getAverageMood, getAverageEnergy
  } = useWellbeingStore();

  const [newCommitment, setNewCommitment] = useState('');
  const [reflection, setReflection] = useState(getCurrentWeekReflection() || {
    proud: '',
    challenge: '',
    lesson: '',
    nextWeek: '',
  });

  const commitments = getCurrentWeekCommitments();
  const avgMood = getAverageMood(7);
  const avgEnergy = getAverageEnergy(7);

  const handleAddCommitment = () => {
    if (!newCommitment.trim()) return;
    setWeeklyCommitment(newCommitment.trim());
    setNewCommitment('');
  };

  const handleReflectionChange = (field, value) => {
    const updated = { ...reflection, [field]: value };
    setReflection(updated);
    setWeeklyReflection(updated);
  };

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

  // Goal progress stats
  const { goals, milestones } = useGoalStore();

  const goalProgress = useMemo(() => {
    const activeGoals = goals.filter(g => g.status === 'active');

    return activeGoals.map(goal => {
      const goalMilestones = milestones.filter(m => m.goalId === goal.id);
      const goalTasks = tasks.filter(t =>
        t.goalId === goal.id || goalMilestones.some(m => m.id === t.milestoneId)
      );

      // Tasks completed this week vs last week
      const completedThisWeek = goalTasks.filter(t =>
        t.completed && weeklyStats.currentWeekDays.includes(t.completedAt?.split('T')[0])
      ).length;

      const lastWeekDays = weeklyStats.currentWeekDays.map(d => {
        const date = new Date(d);
        date.setDate(date.getDate() - 7);
        return date.toISOString().split('T')[0];
      });

      const completedLastWeek = goalTasks.filter(t =>
        t.completed && lastWeekDays.includes(t.completedAt?.split('T')[0])
      ).length;

      // Total progress
      const totalTasks = goalTasks.length;
      const completedTotal = goalTasks.filter(t => t.completed).length;
      const progress = totalTasks > 0 ? Math.round((completedTotal / totalTasks) * 100) : 0;

      // Stuck detection: no progress this week AND last week
      const isStuck = completedThisWeek === 0 && completedLastWeek === 0 && totalTasks > 0;

      return {
        goal,
        area: LIFE_AREAS[goal.area],
        completedThisWeek,
        completedLastWeek,
        progress,
        isStuck,
        pendingTasks: totalTasks - completedTotal,
      };
    });
  }, [goals, milestones, tasks, weeklyStats.currentWeekDays]);

  const stuckGoals = goalProgress.filter(g => g.isStuck);
  const activeProgress = goalProgress.filter(g => g.completedThisWeek > 0);

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

      {/* Goal Progress Section */}
      <div className="goal-progress-section">
        <h3><Target size={18} /> Tiến độ Mục tiêu</h3>

        {/* Stuck Goals Warning */}
        {stuckGoals.length > 0 && (
          <div className="stuck-goals-warning">
            <div className="warning-header">
              <AlertTriangle size={18} />
              <span>{stuckGoals.length} mục tiêu đang "stuck" (không tiến triển 2 tuần)</span>
            </div>
            <div className="stuck-list">
              {stuckGoals.map(item => (
                <div key={item.goal.id} className="stuck-item">
                  <span className="goal-icon">{item.area?.icon}</span>
                  <span className="goal-name">{item.goal.title}</span>
                  <span className="pending-tasks">{item.pendingTasks} tasks còn lại</span>
                </div>
              ))}
            </div>
            <div className="suggestion">
              💡 <strong>Gợi ý:</strong> Xem xét chia nhỏ tasks hoặc điều chỉnh Priority
            </div>
          </div>
        )}

        {/* Active Goals Progress */}
        {goalProgress.length > 0 ? (
          <div className="goals-grid">
            {goalProgress.map(item => (
              <div
                key={item.goal.id}
                className={`goal-card ${item.isStuck ? 'stuck' : ''}`}
                style={{ '--goal-color': item.area?.color }}
              >
                <div className="goal-header">
                  <span className="goal-icon">{item.area?.icon}</span>
                  <span className="goal-name">{item.goal.title}</span>
                </div>
                <div className="goal-progress-bar">
                  <div className="progress-fill" style={{ width: `${item.progress}%` }} />
                </div>
                <div className="goal-stats">
                  <span className="progress-percent">{item.progress}%</span>
                  <span className="week-comparison">
                    Tuần này: <strong>{item.completedThisWeek}</strong>
                    {item.completedLastWeek > 0 && (
                      <span className={item.completedThisWeek >= item.completedLastWeek ? 'positive' : 'negative'}>
                        {' '}({item.completedThisWeek >= item.completedLastWeek ? '↑' : '↓'})
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-goals">
            <p>Chưa có mục tiêu nào. Tạo mục tiêu để theo dõi tiến độ!</p>
          </div>
        )}
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

      {/* Wellbeing Summary */}
      {(avgMood || avgEnergy) && (
        <div className="wellbeing-section">
          <h3><Heart size={18} /> Sức khỏe tinh thần tuần này</h3>
          <div className="wellbeing-stats">
            {avgMood && (
              <div className="wellbeing-stat">
                <span className="wellbeing-emoji">{MOOD_LEVELS[Math.round(avgMood)]?.emoji}</span>
                <span>Tâm trạng TB: {avgMood}/5</span>
              </div>
            )}
            {avgEnergy && (
              <div className="wellbeing-stat">
                <span className="wellbeing-emoji">⚡</span>
                <span>Năng lượng TB: {avgEnergy}/5</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weekly Commitments */}
      <div className="commitments-section">
        <h3><Target size={18} /> Cam kết tuần này</h3>
        <div className="commitment-input-row">
          <input
            type="text"
            value={newCommitment}
            onChange={(e) => setNewCommitment(e.target.value)}
            placeholder="Tuần này tôi cam kết..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddCommitment()}
          />
          <button className="btn btn-primary" onClick={handleAddCommitment}>
            <Plus size={18} />
          </button>
        </div>
        {commitments.length > 0 && (
          <div className="commitments-list">
            {commitments.map(c => (
              <div
                key={c.id}
                className={`commitment-item ${c.completed ? 'done' : ''}`}
                onClick={() => toggleCommitment(c.id)}
              >
                <span className="commitment-check">
                  {c.completed ? <Check size={16} /> : <div className="empty-check" />}
                </span>
                <span className="commitment-text">{c.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guided Reflection */}
      <div className="reflection-section">
        <h3><MessageCircle size={18} /> Reflection tuần này</h3>
        <div className="reflection-prompts">
          <div className="prompt-item">
            <label>🏆 Điều tôi tự hào nhất tuần này:</label>
            <textarea
              value={reflection.proud}
              onChange={(e) => handleReflectionChange('proud', e.target.value)}
              placeholder="Tôi đã hoàn thành..."
            />
          </div>
          <div className="prompt-item">
            <label>💪 Thử thách lớn nhất:</label>
            <textarea
              value={reflection.challenge}
              onChange={(e) => handleReflectionChange('challenge', e.target.value)}
              placeholder="Điều khó khăn nhất là..."
            />
          </div>
          <div className="prompt-item">
            <label>💡 Bài học rút ra:</label>
            <textarea
              value={reflection.lesson}
              onChange={(e) => handleReflectionChange('lesson', e.target.value)}
              placeholder="Tôi học được rằng..."
            />
          </div>
          <div className="prompt-item">
            <label>🎯 Ưu tiên tuần tới:</label>
            <textarea
              value={reflection.nextWeek}
              onChange={(e) => handleReflectionChange('nextWeek', e.target.value)}
              placeholder="Tuần tới tôi sẽ tập trung vào..."
            />
          </div>
        </div>
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

        .wellbeing-section, .commitments-section, .reflection-section {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
        }

        .wellbeing-section h3, .commitments-section h3, .reflection-section h3 {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
          color: var(--text-secondary);
        }

        .wellbeing-stats {
          display: flex;
          gap: var(--spacing-xl);
        }

        .wellbeing-stat {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          color: var(--text-primary);
        }

        .wellbeing-emoji { font-size: 1.5rem; }

        .commitment-input-row {
          display: flex;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
        }

        .commitment-input-row input {
          flex: 1;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .commitments-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .commitment-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .commitment-item:hover { background: var(--bg-tertiary); }
        .commitment-item.done { opacity: 0.6; }
        .commitment-item.done .commitment-text { text-decoration: line-through; }

        .commitment-check { color: var(--success); }
        .empty-check {
          width: 16px;
          height: 16px;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-sm);
        }

        .commitment-text { flex: 1; color: var(--text-primary); }

        .reflection-prompts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-md);
        }

        .prompt-item label {
          display: block;
          margin-bottom: var(--spacing-xs);
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .prompt-item textarea {
          width: 100%;
          min-height: 80px;
          padding: var(--spacing-sm);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          color: var(--text-primary);
          resize: vertical;
          font-family: inherit;
        }

        .prompt-item textarea:focus {
          outline: none;
          border-color: var(--primary);
        }

        /* Goal Progress Section */
        .goal-progress-section {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
        }

        .goal-progress-section h3 {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          margin-bottom: var(--spacing-md);
        }

        .stuck-goals-warning {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--danger);
          border-radius: var(--radius-lg);
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }

        .warning-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          color: var(--danger);
          font-weight: 600;
          margin-bottom: var(--spacing-sm);
        }

        .stuck-list { display: flex; flex-direction: column; gap: var(--spacing-xs); }
        .stuck-item { 
          display: flex; 
          align-items: center; 
          gap: var(--spacing-sm); 
          padding: var(--spacing-xs);
        }
        .stuck-item .pending-tasks { 
          margin-left: auto; 
          font-size: 0.75rem; 
          color: var(--text-muted); 
        }

        .suggestion {
          margin-top: var(--spacing-sm);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .goals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--spacing-md);
        }

        .goal-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-left: 4px solid var(--goal-color, var(--primary));
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
        }

        .goal-card.stuck { 
          opacity: 0.7; 
          border-left-color: var(--danger); 
        }

        .goal-card .goal-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          margin-bottom: var(--spacing-sm);
        }

        .goal-card .goal-name {
          font-weight: 500;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .goal-progress-bar {
          height: 6px;
          background: rgba(0,0,0,0.2);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-bottom: var(--spacing-sm);
        }

        .goal-progress-bar .progress-fill {
          height: 100%;
          background: var(--goal-color, var(--primary));
          border-radius: var(--radius-full);
        }

        .goal-stats {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .progress-percent { font-weight: 600; color: var(--goal-color, var(--primary)); }
        .week-comparison .positive { color: var(--success); }
        .week-comparison .negative { color: var(--danger); }
        .empty-goals { text-align: center; color: var(--text-muted); padding: var(--spacing-lg); }
      `}</style>
    </div>
  );
}
