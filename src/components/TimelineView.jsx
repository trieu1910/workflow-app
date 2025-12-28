import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Play } from 'lucide-react';
import { useTaskStore } from '../stores/useTaskStore';
import { formatEstimatedTime } from '../utils/smartParser';

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6:00 - 22:00

export default function TimelineView({ onStartFocus }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const tasks = useTaskStore((state) => state.tasks);
    const updateTask = useTaskStore((state) => state.updateTask);
    const [draggedTask, setDraggedTask] = useState(null);

    const dateStr = currentDate.toISOString().split('T')[0];

    // Get tasks for current day
    const dayTasks = tasks.filter(t =>
        !t.completed && (t.dueDate === dateStr || t.scheduledFor === dateStr)
    );

    // Separate scheduled and unscheduled tasks
    const scheduledTasks = dayTasks.filter(t => t.scheduledTime);
    const unscheduledTasks = dayTasks.filter(t => !t.scheduledTime);

    // Calculate total scheduled hours
    const totalScheduledMinutes = scheduledTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);
    const totalAvailableMinutes = 16 * 60; // 6:00 - 22:00
    const isOverloaded = totalScheduledMinutes > totalAvailableMinutes;

    const prevDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    const nextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 1);
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e, hour) => {
        e.preventDefault();
        if (draggedTask) {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            updateTask(draggedTask.id, {
                scheduledTime: timeStr,
                scheduledFor: dateStr,
            });
            setDraggedTask(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const removeFromTimeline = (taskId) => {
        updateTask(taskId, { scheduledTime: null });
    };

    // Get tasks for a specific hour
    const getTasksAtHour = (hour) => {
        return scheduledTasks.filter(t => {
            if (!t.scheduledTime) return false;
            const taskHour = parseInt(t.scheduledTime.split(':')[0]);
            return taskHour === hour;
        });
    };

    const isToday = currentDate.toDateString() === new Date().toDateString();
    const currentHour = new Date().getHours();

    return (
        <div className="timeline-view">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Lịch theo giờ</h1>
                    <p className="page-subtitle">Lên lịch công việc theo khung giờ cụ thể</p>
                </div>
            </div>

            {/* Date Navigation */}
            <div className="timeline-nav">
                <button className="btn btn-ghost" onClick={prevDay}>
                    <ChevronLeft size={20} />
                </button>
                <div className="timeline-date">
                    <h2>
                        {currentDate.toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </h2>
                    {!isToday && (
                        <button className="btn btn-ghost btn-sm" onClick={goToToday}>
                            Hôm nay
                        </button>
                    )}
                </div>
                <button className="btn btn-ghost" onClick={nextDay}>
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Overload Warning */}
            {isOverloaded && (
                <div className="overload-warning">
                    ⚠️ Bạn đang lên lịch quá nhiều! ({Math.round(totalScheduledMinutes / 60)}h / {Math.round(totalAvailableMinutes / 60)}h)
                </div>
            )}

            <div className="timeline-container">
                {/* Unscheduled Tasks */}
                <div className="unscheduled-panel">
                    <h4>📥 Chưa lên lịch ({unscheduledTasks.length})</h4>
                    <div className="unscheduled-list">
                        {unscheduledTasks.map((task) => (
                            <div
                                key={task.id}
                                className="timeline-task-card"
                                draggable
                                onDragStart={(e) => handleDragStart(e, task)}
                            >
                                <span className={`priority-dot priority-${task.priority}`} />
                                <div className="timeline-task-content">
                                    <span className="timeline-task-title">{task.title}</span>
                                    {task.estimatedMinutes && (
                                        <span className="timeline-task-duration">
                                            <Clock size={12} />
                                            {formatEstimatedTime(task.estimatedMinutes)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {unscheduledTasks.length === 0 && (
                            <div className="unscheduled-empty">
                                Tất cả đã được lên lịch! ✨
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline Grid */}
                <div className="timeline-grid">
                    {HOURS.map((hour) => {
                        const hourTasks = getTasksAtHour(hour);
                        const isPast = isToday && hour < currentHour;
                        const isCurrent = isToday && hour === currentHour;

                        return (
                            <div
                                key={hour}
                                className={`timeline-row ${isPast ? 'past' : ''} ${isCurrent ? 'current' : ''}`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, hour)}
                            >
                                <div className="timeline-hour">
                                    {hour.toString().padStart(2, '0')}:00
                                </div>
                                <div className="timeline-slot">
                                    {hourTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className={`scheduled-task priority-${task.priority}`}
                                            style={{
                                                height: `${Math.max((task.estimatedMinutes || 30) / 60 * 60, 40)}px`,
                                            }}
                                        >
                                            <div className="scheduled-task-content">
                                                <span className="scheduled-task-title">{task.title}</span>
                                                {task.estimatedMinutes && (
                                                    <span className="scheduled-task-duration">
                                                        {formatEstimatedTime(task.estimatedMinutes)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="scheduled-task-actions">
                                                <button
                                                    onClick={() => onStartFocus && onStartFocus(task)}
                                                    title="Focus"
                                                >
                                                    <Play size={14} />
                                                </button>
                                                <button
                                                    onClick={() => removeFromTimeline(task.id)}
                                                    title="Bỏ lịch"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {hourTasks.length === 0 && (
                                        <div className="timeline-slot-empty">
                                            Kéo thả task vào đây
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
        .timeline-view {
          max-width: 1100px;
        }
        
        .timeline-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-lg);
        }
        
        .timeline-date {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          text-align: center;
        }
        
        .timeline-date h2 {
          font-size: 1.1rem;
          text-transform: capitalize;
        }
        
        .btn-sm {
          padding: var(--spacing-xs) var(--spacing-sm);
          font-size: 0.85rem;
        }
        
        .overload-warning {
          background: var(--danger-bg);
          border: 1px solid var(--danger);
          color: var(--danger);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-lg);
          margin-bottom: var(--spacing-lg);
          text-align: center;
          font-weight: 500;
        }
        
        .timeline-container {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: var(--spacing-xl);
        }
        
        .unscheduled-panel {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-md);
          height: fit-content;
          position: sticky;
          top: var(--spacing-lg);
        }
        
        .unscheduled-panel h4 {
          margin-bottom: var(--spacing-md);
          color: var(--text-secondary);
        }
        
        .unscheduled-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }
        
        .unscheduled-empty {
          text-align: center;
          padding: var(--spacing-lg);
          color: var(--text-muted);
        }
        
        .timeline-task-card {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: grab;
          transition: all var(--transition-fast);
        }
        
        .timeline-task-card:hover {
          border-color: var(--primary);
        }
        
        .timeline-task-card:active {
          cursor: grabbing;
        }
        
        .priority-dot {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          flex-shrink: 0;
          margin-top: 4px;
        }
        
        .priority-dot.priority-high { background: var(--priority-high); }
        .priority-dot.priority-medium { background: var(--priority-medium); }
        .priority-dot.priority-low { background: var(--priority-low); }
        
        .timeline-task-content {
          flex: 1;
          min-width: 0;
        }
        
        .timeline-task-title {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .timeline-task-duration {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 2px;
        }
        
        .timeline-grid {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }
        
        .timeline-row {
          display: flex;
          border-bottom: 1px solid var(--border-light);
          min-height: 60px;
          transition: background var(--transition-fast);
        }
        
        .timeline-row:last-child {
          border-bottom: none;
        }
        
        .timeline-row.past {
          opacity: 0.5;
        }
        
        .timeline-row.current {
          background: var(--primary-glow);
        }
        
        .timeline-row:hover {
          background: var(--bg-surface-hover);
        }
        
        .timeline-hour {
          width: 70px;
          padding: var(--spacing-sm);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-muted);
          border-right: 1px solid var(--border-color);
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }
        
        .timeline-slot {
          flex: 1;
          padding: var(--spacing-xs);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        
        .timeline-slot-empty {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 0.8rem;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }
        
        .timeline-row:hover .timeline-slot-empty {
          opacity: 1;
        }
        
        .scheduled-task {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: var(--spacing-sm);
          border-radius: var(--radius-md);
          min-height: 40px;
        }
        
        .scheduled-task.priority-high {
          background: var(--danger-bg);
          border-left: 3px solid var(--priority-high);
        }
        
        .scheduled-task.priority-medium {
          background: var(--warning-bg);
          border-left: 3px solid var(--priority-medium);
        }
        
        .scheduled-task.priority-low {
          background: var(--success-bg);
          border-left: 3px solid var(--priority-low);
        }
        
        .scheduled-task-content {
          flex: 1;
        }
        
        .scheduled-task-title {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .scheduled-task-duration {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        
        .scheduled-task-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }
        
        .scheduled-task:hover .scheduled-task-actions {
          opacity: 1;
        }
        
        .scheduled-task-actions button {
          width: 24px;
          height: 24px;
          border: none;
          background: var(--bg-surface);
          border-radius: var(--radius-sm);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: all var(--transition-fast);
        }
        
        .scheduled-task-actions button:hover {
          background: var(--primary);
          color: white;
        }
        
        @media (max-width: 900px) {
          .timeline-container {
            grid-template-columns: 1fr;
          }
          
          .unscheduled-panel {
            position: static;
          }
        }
      `}</style>
        </div>
    );
}
