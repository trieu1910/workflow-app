import { Play, Clock, Calendar, Check, RotateCcw } from 'lucide-react';
import { useTaskStore, STAGES } from '../stores/useTaskStore';
import { formatEstimatedTime, formatDueDate } from '../utils/smartParser';

// Quadrant priority order (Do First > Schedule > Delegate > Eliminate)
const QUADRANT_PRIORITY = { do: 0, schedule: 1, delegate: 2, eliminate: 3 };
const QUADRANT_INFO = {
  do: { emoji: '🔥', label: 'Làm ngay', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  schedule: { emoji: '📅', label: 'Lên lịch', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  delegate: { emoji: '👥', label: 'Ủy quyền', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  eliminate: { emoji: '🗑️', label: 'Loại bỏ', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)' },
};

export default function FocusQueue({ onStartFocus }) {
  const tasks = useTaskStore((state) => state.tasks);
  const startTask = useTaskStore((state) => state.startTask);
  const completeTask = useTaskStore((state) => state.completeTask);
  const resetToInbox = useTaskStore((state) => state.resetToInbox);

  // Get scheduled and in-progress tasks
  const scheduledTasks = tasks.filter(t => t.stage === STAGES.SCHEDULED);
  const inProgressTasks = tasks.filter(t => t.stage === STAGES.IN_PROGRESS);

  // Sort by quadrant priority first, then scheduled time
  const sortedScheduled = [...scheduledTasks].sort((a, b) => {
    // First sort by quadrant priority
    const quadrantA = QUADRANT_PRIORITY[a.quadrant] ?? 99;
    const quadrantB = QUADRANT_PRIORITY[b.quadrant] ?? 99;
    if (quadrantA !== quadrantB) return quadrantA - quadrantB;

    // Then by scheduled time
    if (!a.scheduledTime && !b.scheduledTime) return 0;
    if (!a.scheduledTime) return 1;
    if (!b.scheduledTime) return -1;
    return a.scheduledTime.localeCompare(b.scheduledTime);
  });

  // Group tasks by quadrant for display
  const groupedByQuadrant = sortedScheduled.reduce((groups, task) => {
    const q = task.quadrant || 'unknown';
    if (!groups[q]) groups[q] = [];
    groups[q].push(task);
    return groups;
  }, {});

  const handleStartFocus = (task) => {
    startTask(task.id);
    if (onStartFocus) onStartFocus(task);
  };

  const getQuadrantInfo = (quadrant) => {
    return QUADRANT_INFO[quadrant] || { emoji: '❓', label: 'Chưa phân loại', color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.15)' };
  };

  return (
    <div className="focus-queue">
      <div className="page-header">
        <div>
          <h1 className="page-title">Focus Queue</h1>
          <p className="page-subtitle">
            {inProgressTasks.length > 0
              ? '⚡ Đang làm việc...'
              : `${scheduledTasks.length} task sẵn sàng`}
          </p>
        </div>
      </div>

      {/* Priority Legend */}
      <div className="priority-legend">
        {Object.entries(QUADRANT_INFO).map(([key, info]) => (
          <div key={key} className="legend-item" style={{ '--q-color': info.color }}>
            <span className="legend-emoji">{info.emoji}</span>
            <span className="legend-label">{info.label}</span>
          </div>
        ))}
      </div>

      {/* In Progress Section */}
      {inProgressTasks.length > 0 && (
        <div className="queue-section current">
          <h3>⚡ Đang thực hiện</h3>
          <div className="queue-tasks">
            {inProgressTasks.map((task) => {
              const qInfo = getQuadrantInfo(task.quadrant);
              return (
                <div
                  key={task.id}
                  className="queue-task in-progress"
                  style={{ '--q-color': qInfo.color, '--q-bg': qInfo.bg }}
                >
                  <div className="queue-task-quadrant">{qInfo.emoji}</div>
                  <div className="queue-task-main">
                    <div className="queue-task-content">
                      <span className="queue-task-title">{task.title}</span>
                      <div className="queue-task-meta">
                        <span className="quadrant-badge" style={{ background: qInfo.bg, color: qInfo.color }}>
                          {qInfo.label}
                        </span>
                        {task.estimatedMinutes && (
                          <span><Clock size={14} /> {formatEstimatedTime(task.estimatedMinutes)}</span>
                        )}
                      </div>
                    </div>
                    <div className="queue-task-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => onStartFocus && onStartFocus(task)}
                      >
                        <Play size={16} />
                        Tiếp tục
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={() => completeTask(task.id)}
                      >
                        <Check size={16} />
                        Xong
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scheduled Queue - Grouped by Quadrant */}
      <div className="queue-section">
        <h3>📋 Hàng đợi ({sortedScheduled.length})</h3>
        {sortedScheduled.length === 0 ? (
          <div className="queue-empty">
            <p>Chưa có task nào trong hàng đợi</p>
            <small>Lên lịch task trong mục "Lên lịch"</small>
          </div>
        ) : (
          <div className="queue-groups">
            {['do', 'schedule', 'delegate', 'eliminate'].map((quadrant) => {
              const tasksInQuadrant = groupedByQuadrant[quadrant];
              if (!tasksInQuadrant || tasksInQuadrant.length === 0) return null;

              const qInfo = QUADRANT_INFO[quadrant];
              return (
                <div key={quadrant} className="quadrant-group" style={{ '--q-color': qInfo.color, '--q-bg': qInfo.bg }}>
                  <div className="quadrant-group-header">
                    <span className="quadrant-group-emoji">{qInfo.emoji}</span>
                    <span className="quadrant-group-label">{qInfo.label}</span>
                    <span className="quadrant-group-count">{tasksInQuadrant.length}</span>
                  </div>
                  <div className="queue-tasks">
                    {tasksInQuadrant.map((task, index) => (
                      <div
                        key={task.id}
                        className={`queue-task quadrant-${quadrant} ${index === 0 && quadrant === 'do' ? 'next' : ''}`}
                      >
                        <div className="queue-task-main">
                          <div className="queue-task-content">
                            <span className="queue-task-title">{task.title}</span>
                            <div className="queue-task-meta">
                              {task.scheduledTime && (
                                <span><Clock size={14} /> {task.scheduledTime}</span>
                              )}
                              {task.scheduledFor && (
                                <span><Calendar size={14} /> {formatDueDate(task.scheduledFor)}</span>
                              )}
                              {task.estimatedMinutes && (
                                <span>~{formatEstimatedTime(task.estimatedMinutes)}</span>
                              )}
                            </div>
                          </div>
                          <div className="queue-task-actions">
                            <button
                              className="btn btn-primary"
                              onClick={() => handleStartFocus(task)}
                            >
                              <Play size={16} />
                              Focus
                            </button>
                            <button
                              className="btn btn-ghost"
                              onClick={() => resetToInbox(task.id)}
                              title="Quay lại Inbox"
                            >
                              <RotateCcw size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .focus-queue {
          max-width: 800px;
        }
        
        .priority-legend {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: var(--bg-surface);
          border-radius: var(--radius-lg);
          margin-bottom: var(--spacing-lg);
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: 0.85rem;
          color: var(--q-color);
        }
        
        .legend-emoji {
          font-size: 1rem;
        }
        
        .legend-label {
          font-weight: 500;
        }
        
        .queue-section {
          margin-bottom: var(--spacing-xl);
        }
        
        .queue-section h3 {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-md);
        }
        
        .queue-section.current {
          padding: var(--spacing-lg);
          background: linear-gradient(135deg, var(--primary-glow), transparent);
          border: 1px solid var(--primary);
          border-radius: var(--radius-xl);
        }
        
        .queue-section.current h3 {
          color: var(--primary);
        }
        
        .queue-empty {
          text-align: center;
          padding: var(--spacing-xl);
          background: var(--bg-surface);
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-xl);
          color: var(--text-muted);
        }
        
        .queue-empty small {
          display: block;
          margin-top: var(--spacing-xs);
          font-size: 0.8rem;
        }
        
        .queue-groups {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }
        
        .quadrant-group {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-left: 4px solid var(--q-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-md);
        }
        
        .quadrant-group-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid var(--border-light);
        }
        
        .quadrant-group-emoji {
          font-size: 1.25rem;
        }
        
        .quadrant-group-label {
          font-weight: 600;
          color: var(--q-color);
        }
        
        .quadrant-group-count {
          margin-left: auto;
          background: var(--q-bg);
          color: var(--q-color);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .queue-tasks {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }
        
        .queue-task {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        
        .queue-task:hover {
          border-color: var(--primary);
        }
        
        .queue-task.next {
          border-color: var(--primary);
          background: var(--primary-glow);
        }
        
        .queue-task.in-progress {
          border-left: 4px solid var(--q-color);
          background: var(--q-bg);
        }
        
        .queue-task-quadrant {
          font-size: 1.5rem;
        }
        
        .quadrant-badge {
          padding: 2px 8px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .queue-task-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-md);
        }
        
        .queue-task-content {
          flex: 1;
        }
        
        .queue-task-title {
          font-size: 1rem;
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .queue-task-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-md);
          margin-top: var(--spacing-xs);
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        
        .queue-task-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .queue-task-actions {
          display: flex;
          gap: var(--spacing-sm);
          flex-shrink: 0;
        }
        
        .btn-success {
          background: var(--success);
          color: white;
        }
        
        .btn-success:hover {
          background: #16a34a;
        }
        
        @media (max-width: 600px) {
          .priority-legend {
            gap: var(--spacing-sm);
          }
          
          .legend-label {
            display: none;
          }
          
          .queue-task-main {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .queue-task-actions {
            width: 100%;
            margin-top: var(--spacing-sm);
          }
          
          .queue-task-actions .btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}
