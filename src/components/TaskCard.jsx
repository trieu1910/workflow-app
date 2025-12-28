import { useState } from 'react';
import { Check, Calendar, Clock, Tag, Trash2, Play, Repeat } from 'lucide-react';
import { useTaskStore } from '../stores/useTaskStore';
import { useStatsStore, getTaskXP } from '../stores/useStatsStore';
import { formatDueDate, formatTime, formatEstimatedTime } from '../utils/smartParser';

export default function TaskCard({ task, onStartFocus, onTaskClick }) {
    const [isHovered, setIsHovered] = useState(false);
    const { deleteTask, completeTask, uncompleteTask } = useTaskStore();
    const addXP = useStatsStore((state) => state.addXP);

    const handleToggleComplete = (e) => {
        e.stopPropagation();
        if (task.completed) {
            uncompleteTask(task.id);
        } else {
            completeTask(task.id);
            const xp = getTaskXP(task.priority);
            addXP(xp);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        deleteTask(task.id);
    };

    const handleStartFocus = (e) => {
        e.stopPropagation();
        if (onStartFocus) onStartFocus(task);
    };

    const handleClick = () => {
        if (onTaskClick) onTaskClick(task);
    };

    const isOverdue = () => {
        if (!task.dueDate || task.completed) return false;
        const today = new Date().toISOString().split('T')[0];
        return task.dueDate < today;
    };

    const subtaskProgress = () => {
        if (!task.subtasks || task.subtasks.length === 0) return null;
        const completed = task.subtasks.filter(st => st.completed).length;
        return `${completed}/${task.subtasks.length}`;
    };

    return (
        <div
            className={`task-card ${task.completed ? 'completed' : ''} ${isOverdue() ? 'overdue' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
        >
            <div
                className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                onClick={handleToggleComplete}
            >
                {task.completed && <Check size={14} />}
            </div>

            <div className="task-content">
                <div className="task-title">{task.title}</div>
                <div className="task-meta">
                    {task.dueDate && (
                        <span className={`task-due ${isOverdue() ? 'overdue' : ''}`}>
                            <Calendar size={14} />
                            {formatDueDate(task.dueDate)}
                            {task.dueTime && ` ${formatTime(task.dueTime)}`}
                        </span>
                    )}
                    {task.estimatedMinutes && (
                        <span className="task-estimate">
                            <Clock size={14} />
                            {formatEstimatedTime(task.estimatedMinutes)}
                        </span>
                    )}
                    {task.isRecurring && (
                        <span className="task-recurring">
                            <Repeat size={14} />
                        </span>
                    )}
                    {subtaskProgress() && (
                        <span className="task-subtasks">
                            ✓ {subtaskProgress()}
                        </span>
                    )}
                    {task.tags && task.tags.length > 0 && (
                        <span className="task-tags">
                            <Tag size={14} />
                            {task.tags.join(', ')}
                        </span>
                    )}
                    <span className={`priority-badge priority-${task.priority}`}>
                        {task.priority === 'high' ? 'Cao' :
                            task.priority === 'medium' ? 'TB' : 'Thấp'}
                    </span>
                    <span className="task-xp">+{getTaskXP(task.priority)} XP</span>
                </div>
            </div>

            <div className="task-actions">
                {!task.completed && (
                    <button
                        className="btn btn-icon btn-ghost"
                        onClick={handleStartFocus}
                        title="Bắt đầu Focus"
                    >
                        <Play size={16} />
                    </button>
                )}
                <button
                    className="btn btn-icon btn-ghost"
                    onClick={handleDelete}
                    title="Xóa"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <style>{`
        .task-card {
          cursor: pointer;
        }
        
        .task-card:hover {
          border-color: var(--primary);
        }
        
        .task-card.overdue {
          border-color: var(--danger);
          background: var(--danger-bg);
        }
        
        .task-due.overdue {
          color: var(--danger) !important;
          font-weight: 600;
        }
        
        .task-estimate {
          color: var(--text-muted);
        }
        
        .task-tags {
          color: var(--primary);
        }
        
        .task-recurring {
          color: var(--accent);
        }
        
        .task-subtasks {
          font-size: 0.75rem;
          color: var(--success);
          font-weight: 500;
        }
        
        .task-xp {
          padding: 2px 6px;
          background: linear-gradient(135deg, var(--primary-glow), var(--accent-glow));
          border-radius: var(--radius-full);
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--primary);
        }
      `}</style>
        </div>
    );
}
