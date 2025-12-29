import { useState } from 'react';
import { Plus, Trash2, X, Flame, Check, Target, BarChart2 } from 'lucide-react';
import { useHabitStore } from '../stores/useHabitStore';
import { useGoalStore, LIFE_AREAS } from '../stores/useGoalStore';
import HabitHeatmap from './HabitHeatmap';

const HABIT_ICONS = ['✅', '💪', '📚', '🧘', '🏃', '💧', '🌙', '📝', '🎯', '💰'];
const HABIT_COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f97316', '#ef4444', '#ec4899'];

export default function HabitTracker() {
    const { habits, checkIns, addHabit, deleteHabit, toggleCheckIn, getTodayStatus } = useHabitStore();
    const goals = useGoalStore((state) => state.goals);

    const [showForm, setShowForm] = useState(false);
    const [expandedHabit, setExpandedHabit] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        icon: '✅',
        color: '#22c55e',
        goalId: '',
    });

    const todayStatus = getTodayStatus();
    const today = new Date().toISOString().split('T')[0];

    // Format date in local timezone (not UTC)
    const formatLocalDate = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Calculate streak reactively from checkIns state
    const calculateStreak = (habitId) => {
        const habitCheckIns = checkIns[habitId] || {};
        if (Object.keys(habitCheckIns).length === 0) return 0;

        let streak = 0;
        const todayDate = new Date();

        for (let i = 0; i <= 365; i++) {
            const checkDate = new Date(todayDate);
            checkDate.setDate(todayDate.getDate() - i);
            const dateStr = formatLocalDate(checkDate);

            if (habitCheckIns[dateStr]) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
        return streak;
    };

    // Check if habit is checked for a date (reactive)
    const isChecked = (habitId, date) => {
        return !!(checkIns[habitId] && checkIns[habitId][date]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;
        addHabit(formData);
        setFormData({ title: '', icon: '✅', color: '#22c55e', goalId: '' });
        setShowForm(false);
    };

    // Get last 7 days for display
    const getLast7Days = () => {
        const days = [];
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push({
                date: d.toISOString().split('T')[0],
                dayName: dayNames[d.getDay()],
                isToday: i === 0,
            });
        }
        return days;
    };

    const last7Days = getLast7Days();

    return (
        <div className="habit-tracker">
            <div className="page-header">
                <div>
                    <h1 className="page-title">🔄 Thói quen</h1>
                    <p className="page-subtitle">
                        Hôm nay: {todayStatus.completed}/{todayStatus.total} ({todayStatus.percentage}%)
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={18} />
                    Thêm thói quen
                </button>
            </div>

            {/* Today's Progress */}
            <div className="today-progress">
                <div className="progress-ring">
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-secondary)" strokeWidth="8" />
                        <circle
                            cx="50" cy="50" r="40"
                            fill="none"
                            stroke="var(--primary)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${todayStatus.percentage * 2.51} 251`}
                            transform="rotate(-90 50 50)"
                        />
                    </svg>
                    <div className="progress-text">
                        <span className="progress-value">{todayStatus.percentage}%</span>
                        <span className="progress-label">Hôm nay</span>
                    </div>
                </div>
                <div className="today-stats">
                    <div className="stat-item">
                        <Check size={20} className="stat-icon success" />
                        <span>{todayStatus.completed} hoàn thành</span>
                    </div>
                    <div className="stat-item">
                        <Target size={20} className="stat-icon" />
                        <span>{todayStatus.pending} còn lại</span>
                    </div>
                </div>
            </div>

            {/* Habit Form Modal */}
            {showForm && (
                <div className="modal-overlay">
                    <form className="modal-form" onSubmit={handleSubmit}>
                        <div className="form-header">
                            <h3>🔄 Thêm thói quen</h3>
                            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="form-group">
                            <label>Tên thói quen</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="VD: Chạy bộ 30 phút"
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label>Icon</label>
                            <div className="icon-picker">
                                {HABIT_ICONS.map(icon => (
                                    <button
                                        key={icon}
                                        type="button"
                                        className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                                        onClick={() => setFormData({ ...formData, icon })}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Màu</label>
                            <div className="color-picker">
                                {HABIT_COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={`color-option ${formData.color === color ? 'selected' : ''}`}
                                        style={{ background: color }}
                                        onClick={() => setFormData({ ...formData, color })}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Liên kết với mục tiêu (tùy chọn)</label>
                            <select
                                value={formData.goalId}
                                onChange={(e) => setFormData({ ...formData, goalId: e.target.value })}
                            >
                                <option value="">-- Không liên kết --</option>
                                {goals.filter(g => g.status === 'active').map(goal => (
                                    <option key={goal.id} value={goal.id}>
                                        {LIFE_AREAS[goal.area]?.icon} {goal.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Hủy</button>
                            <button type="submit" className="btn btn-primary">Thêm</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Habits List */}
            {habits.filter(h => h.active).length === 0 ? (
                <div className="empty-state">
                    <p>Chưa có thói quen nào. Hãy bắt đầu xây dựng những thói quen tốt!</p>
                </div>
            ) : (
                <div className="habits-list">
                    {habits.filter(h => h.active).map(habit => {
                        const streak = calculateStreak(habit.id);
                        const checkedToday = isChecked(habit.id, today);
                        const linkedGoal = goals.find(g => g.id === habit.goalId);

                        return (
                            <div key={habit.id} className="habit-card" style={{ '--habit-color': habit.color }}>
                                <div className="habit-header">
                                    <button
                                        className={`habit-check ${checkedToday ? 'checked' : ''}`}
                                        onClick={() => toggleCheckIn(habit.id, today)}
                                    >
                                        {checkedToday ? <Check size={20} /> : <span className="habit-icon">{habit.icon}</span>}
                                    </button>
                                    <div className="habit-info">
                                        <h3 className={checkedToday ? 'completed' : ''}>{habit.title}</h3>
                                        <div className="habit-meta">
                                            <span className="habit-streak">
                                                <Flame size={14} /> {streak} ngày
                                            </span>
                                            {linkedGoal && (
                                                <span className="habit-goal-link" title={`Mục tiêu: ${linkedGoal.title}`}>
                                                    <Target size={12} />
                                                    {linkedGoal.title}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        className={`btn btn-ghost btn-sm ${expandedHabit === habit.id ? 'active' : ''}`}
                                        onClick={() => setExpandedHabit(expandedHabit === habit.id ? null : habit.id)}
                                        title="Xem lịch sử"
                                    >
                                        <BarChart2 size={16} />
                                    </button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => deleteHabit(habit.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="habit-week">
                                    {last7Days.map(day => {
                                        const checked = isChecked(habit.id, day.date);
                                        return (
                                            <div
                                                key={day.date}
                                                className={`day-cell ${checked ? 'checked' : ''} ${day.isToday ? 'today' : ''}`}
                                                onClick={() => toggleCheckIn(habit.id, day.date)}
                                            >
                                                <span className="day-name">{day.dayName}</span>
                                                <span className="day-dot">{checked ? '✓' : '○'}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Habit Heatmap (expandable) */}
                                {expandedHabit === habit.id && (
                                    <HabitHeatmap habitId={habit.id} months={3} />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
        .habit-tracker { max-width: 700px; }
        
        .today-progress {
          display: flex;
          align-items: center;
          gap: var(--spacing-xl);
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }
        
        .progress-ring {
          position: relative;
          width: 100px;
          height: 100px;
        }
        
        .progress-ring svg { width: 100%; height: 100%; }
        
        .progress-text {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .progress-value { font-size: 1.5rem; font-weight: 700; color: var(--primary); }
        .progress-label { font-size: 0.75rem; color: var(--text-muted); }
        
        .today-stats { display: flex; flex-direction: column; gap: var(--spacing-sm); }
        .stat-item { display: flex; align-items: center; gap: var(--spacing-sm); color: var(--text-secondary); }
        .stat-icon { color: var(--text-muted); }
        .stat-icon.success { color: var(--success); }
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .modal-form { background: var(--bg-surface); border-radius: var(--radius-xl); padding: var(--spacing-xl); width: 90%; max-width: 400px; }
        .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg); }
        .form-group { margin-bottom: var(--spacing-md); }
        .form-group label { display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: var(--spacing-xs); }
        .form-group input, .form-group select { width: 100%; padding: var(--spacing-sm) var(--spacing-md); border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-secondary); color: var(--text-primary); }
        .form-actions { display: flex; justify-content: flex-end; gap: var(--spacing-sm); margin-top: var(--spacing-lg); }
        
        .icon-picker, .color-picker { display: flex; flex-wrap: wrap; gap: var(--spacing-xs); }
        .icon-option { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: 2px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-secondary); font-size: 1.25rem; cursor: pointer; }
        .icon-option.selected { border-color: var(--primary); background: var(--primary-glow); }
        .color-option { width: 28px; height: 28px; border: 2px solid transparent; border-radius: var(--radius-full); cursor: pointer; }
        .color-option.selected { border-color: white; box-shadow: 0 0 0 2px var(--primary); }
        
        .habits-list { display: flex; flex-direction: column; gap: var(--spacing-md); }
        
        .habit-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-md);
        }
        
        .habit-header { display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: var(--spacing-sm); }
        
        .habit-check {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-lg);
          border: 2px solid var(--habit-color);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .habit-check.checked { background: var(--habit-color); color: white; }
        .habit-icon { font-size: 1.25rem; }
        
        .habit-info { flex: 1; }
        .habit-info h3 { font-size: 1rem; color: var(--text-primary); margin-bottom: 2px; }
        .habit-info h3.completed { text-decoration: line-through; opacity: 0.6; }
        
        .habit-meta { display: flex; align-items: center; gap: var(--spacing-sm); flex-wrap: wrap; }
        .habit-streak { display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--warning); font-weight: 500; }
        
        .habit-goal-link { 
            display: inline-flex; 
            align-items: center; 
            gap: 4px; 
            font-size: 0.75rem; 
            color: var(--text-muted);           
            padding: 2px 6px;
            background: var(--bg-secondary);
            border-radius: var(--radius-sm);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 150px;
        }
        
        .habit-week {
          display: flex;
          gap: var(--spacing-xs);
          justify-content: space-between;
        }
        
        .day-cell {
          flex: 1;
          text-align: center;
          padding: var(--spacing-xs);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        
        .day-cell:hover { background: var(--bg-secondary); }
        .day-cell.today { background: var(--primary-glow); }
        .day-cell.checked .day-dot { color: var(--habit-color); font-weight: bold; }
        
        .day-name { display: block; font-size: 0.7rem; color: var(--text-muted); }
        .day-dot { display: block; font-size: 0.9rem; color: var(--text-muted); margin-top: 2px; }
        
        .empty-state { text-align: center; padding: var(--spacing-2xl); color: var(--text-muted); }
        .btn-sm { padding: var(--spacing-xs) var(--spacing-sm); }
      `}</style>
        </div>
    );
}
