import { useState } from 'react';
import { Trash2, RotateCcw, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { useTaskStore, STAGES } from '../stores/useTaskStore';
import { formatDueDate, formatEstimatedTime } from '../utils/smartParser';

export default function DoneView() {
  const tasks = useTaskStore((state) => state.tasks);
  const uncompleteTask = useTaskStore((state) => state.uncompleteTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const clearCompleted = useTaskStore((state) => state.clearCompleted);

  const [showConfirm, setShowConfirm] = useState(false);

  // Get completed tasks
  const doneTasks = tasks.filter(t => t.stage === STAGES.DONE);

  // Sort by completion date (newest first)
  const sortedTasks = [...doneTasks].sort((a, b) =>
    new Date(b.completedAt) - new Date(a.completedAt)
  );

  // Group by date
  const groupedByDate = sortedTasks.reduce((groups, task) => {
    const date = task.completedAt ? task.completedAt.split('T')[0] : 'unknown';
    if (!groups[date]) groups[date] = [];
    groups[date].push(task);
    return groups;
  }, {});

  const formatGroupDate = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dateStr === today) return 'Hôm nay';
    if (dateStr === yesterday) return 'Hôm qua';
    return formatDueDate(dateStr);
  };

  const handleClearAll = () => {
    clearCompleted();
    setShowConfirm(false);
  };

  return (
    <div className="done-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hoàn thành</h1>
          <p className="page-subtitle">{doneTasks.length} task đã xong</p>
        </div>
        {doneTasks.length > 0 && (
          <button
            className="btn btn-danger-outline"
            onClick={() => setShowConfirm(true)}
          >
            <Trash2 size={16} />
            Xóa tất cả ({doneTasks.length})
          </button>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="confirm-banner">
          <AlertTriangle size={20} />
          <span>Xóa vĩnh viễn {doneTasks.length} task đã hoàn thành?</span>
          <div className="confirm-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setShowConfirm(false)}>
              Hủy
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleClearAll}>
              Xóa tất cả
            </button>
          </div>
        </div>
      )}

      {doneTasks.length === 0 ? (
        <div className="done-empty">
          <p>Chưa có task nào hoàn thành</p>
          <small>Hoàn thành task trong Focus Mode để thấy ở đây</small>
        </div>
      ) : (
        <div className="done-groups">
          {Object.entries(groupedByDate).map(([date, tasks]) => (
            <div key={date} className="done-group">
              <h3 className="group-date">{formatGroupDate(date)}</h3>
              <div className="group-tasks">
                {tasks.map((task) => (
                  <div key={task.id} className="done-task">
                    <div className="done-task-check">✓</div>
                    <div className="done-task-content">
                      <span className="done-task-title">{task.title}</span>
                      <div className="done-task-meta">
                        {task.actualMinutes && (
                          <span>
                            <Clock size={12} />
                            {formatEstimatedTime(task.actualMinutes)} thực tế
                          </span>
                        )}
                        {task.estimatedMinutes && task.actualMinutes && (
                          <span className={task.actualMinutes <= task.estimatedMinutes ? 'on-time' : 'overtime'}>
                            {task.actualMinutes <= task.estimatedMinutes ? '✓ Đúng hạn' : '⚠ Quá giờ'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="done-task-actions">
                      <button
                        onClick={() => uncompleteTask(task.id)}
                        title="Khôi phục"
                      >
                        <RotateCcw size={14} />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .done-view {
          max-width: 800px;
        }
        
        .btn-danger-outline {
          background: transparent;
          border: 1px solid var(--danger);
          color: var(--danger);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .btn-danger-outline:hover {
          background: var(--danger);
          color: white;
        }
        
        .confirm-banner {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: var(--danger-bg);
          border: 1px solid var(--danger);
          border-radius: var(--radius-lg);
          margin-bottom: var(--spacing-lg);
          color: var(--danger);
        }
        
        .confirm-banner span {
          flex: 1;
          font-weight: 500;
        }
        
        .confirm-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
        
        .btn-sm {
          padding: var(--spacing-xs) var(--spacing-sm);
          font-size: 0.85rem;
        }
        
        .btn-danger {
          background: var(--danger);
          color: white;
          border: none;
        }
        
        .btn-danger:hover {
          background: #dc2626;
        }
        
        .done-empty {
          text-align: center;
          padding: var(--spacing-xl) * 2;
          background: var(--bg-surface);
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-xl);
          color: var(--text-muted);
        }
        
        .done-empty small {
          display: block;
          margin-top: var(--spacing-sm);
          font-size: 0.8rem;
        }
        
        .done-groups {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xl);
        }
        
        .group-date {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-md);
          text-transform: capitalize;
        }
        
        .group-tasks {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }
        
        .done-task {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
        }
        
        .done-task:hover {
          border-color: var(--primary);
        }
        
        .done-task-check {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--success);
          color: white;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          flex-shrink: 0;
        }
        
        .done-task-content {
          flex: 1;
        }
        
        .done-task-title {
          font-size: 0.95rem;
          color: var(--text-primary);
          text-decoration: line-through;
          opacity: 0.8;
        }
        
        .done-task-meta {
          display: flex;
          gap: var(--spacing-md);
          margin-top: var(--spacing-xs);
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        
        .done-task-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .done-task-meta .on-time {
          color: var(--success);
        }
        
        .done-task-meta .overtime {
          color: var(--warning);
        }
        
        .done-task-actions {
          display: flex;
          gap: 4px;
        }
        
        .done-task-actions button {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .done-task-actions button:hover {
          background: var(--primary);
          color: white;
        }
      `}</style>
    </div>
  );
}
