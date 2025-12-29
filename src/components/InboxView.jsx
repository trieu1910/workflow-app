import { useState } from 'react';
import { Plus, Inbox as InboxIcon, ArrowRight, GripVertical, Trash2, Target } from 'lucide-react';
import { useTaskStore, STAGES } from '../stores/useTaskStore';
import { useGoalStore, LIFE_AREAS } from '../stores/useGoalStore';

export default function InboxView({ onOpenQuickAdd }) {
  const tasks = useTaskStore((state) => state.tasks);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const { goals, milestones } = useGoalStore();

  // Get inbox tasks
  const inboxTasks = tasks.filter(t => t.stage === STAGES.INBOX);

  // Helper to get goal info for a task
  const getTaskGoal = (task) => {
    if (!task.milestoneId && !task.goalId) return null;

    let goalId = task.goalId;
    if (!goalId && task.milestoneId) {
      const milestone = milestones.find(m => m.id === task.milestoneId);
      goalId = milestone?.goalId;
    }

    const goal = goals.find(g => g.id === goalId);
    if (!goal) return null;

    const area = LIFE_AREAS[goal.area];
    return { goal, area };
  };

  const handleDelete = (taskId, title) => {
    if (confirm(`Xóa task "${title}"?`)) {
      deleteTask(taskId);
    }
  };

  return (
    <div className="inbox-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">📥 Inbox</h1>
          <p className="page-subtitle">
            {inboxTasks.length === 0
              ? '✨ Inbox Zero!'
              : `${inboxTasks.length} task cần xử lý`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={onOpenQuickAdd}>
          <Plus size={18} />
          Thêm việc
        </button>
      </div>

      {inboxTasks.length === 0 ? (
        <div className="inbox-empty">
          <InboxIcon size={64} />
          <h3>Inbox trống!</h3>
          <p>Nhấn <kbd>Ctrl</kbd>+<kbd>K</kbd> để thêm công việc mới</p>
        </div>
      ) : (
        <>
          <div className="inbox-hint">
            💡 <strong>Bước tiếp theo:</strong> Mở <em>Phân loại</em> để kéo task vào Ma trận Eisenhower
          </div>

          <div className="inbox-list">
            {inboxTasks.map((task) => {
              const taskGoal = getTaskGoal(task);
              return (
                <div key={task.id} className={`inbox-task priority-${task.priority}`}>
                  <GripVertical size={18} className="drag-handle" />
                  <div className="inbox-task-content">
                    <span className="inbox-task-title">{task.title}</span>
                    <div className="inbox-task-meta">
                      {taskGoal && (
                        <span className="inbox-task-goal" style={{ '--goal-color': taskGoal.area?.color }}>
                          <Target size={12} /> {taskGoal.area?.icon} {taskGoal.goal.title}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="inbox-task-due">📅 {task.dueDate}</span>
                      )}
                      {task.estimatedMinutes && (
                        <span className="inbox-task-time">⏱ {task.estimatedMinutes}m</span>
                      )}
                      {task.tags && task.tags.length > 0 && (
                        <span className="inbox-task-tags">🏷 {task.tags.join(', ')}</span>
                      )}
                    </div>
                  </div>
                  <span className={`priority-badge priority-${task.priority}`}>
                    {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'TB' : 'Thấp'}
                  </span>
                  <button
                    className="btn btn-ghost inbox-task-delete"
                    onClick={() => handleDelete(task.id, task.title)}
                    title="Xóa task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="inbox-next-step">
            <ArrowRight size={20} />
            <span>Tiếp: Phân loại trong Ma trận Eisenhower</span>
          </div>
        </>
      )}

      <style>{`
        .inbox-view {
          max-width: 800px;
        }
        
        .inbox-empty {
          text-align: center;
          padding: calc(var(--spacing-xl) * 2);
          background: var(--bg-surface);
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-xl);
          color: var(--text-muted);
        }
        
        .inbox-empty svg {
          margin-bottom: var(--spacing-lg);
          opacity: 0.5;
        }
        
        .inbox-empty h3 {
          margin-bottom: var(--spacing-sm);
          color: var(--text-primary);
        }
        
        .inbox-empty kbd {
          padding: 2px 6px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
        }
        
        .inbox-hint {
          padding: var(--spacing-md);
          background: var(--primary-glow);
          border: 1px solid var(--primary);
          border-radius: var(--radius-lg);
          margin-bottom: var(--spacing-lg);
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        
        .inbox-hint strong {
          color: var(--primary);
        }
        
        .inbox-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }
        
        .inbox-task {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
        }
        
        .inbox-task:hover {
          border-color: var(--primary);
          transform: translateX(4px);
        }
        
        .inbox-task.priority-high {
          border-left: 3px solid var(--priority-high);
        }
        
        .inbox-task.priority-medium {
          border-left: 3px solid var(--priority-medium);
        }
        
        .inbox-task.priority-low {
          border-left: 3px solid var(--priority-low);
        }
        
        .drag-handle {
          color: var(--text-muted);
          cursor: grab;
        }
        
        .inbox-task-content {
          flex: 1;
        }
        
        .inbox-task-title {
          font-size: 1rem;
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .inbox-task-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-md);
          margin-top: var(--spacing-xs);
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        
        .inbox-next-step {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-xl);
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        
        .inbox-next-step svg {
          color: var(--primary);
        }
        
        .inbox-task-delete {
          padding: var(--spacing-xs);
          color: var(--text-muted);
          opacity: 0;
          transition: all var(--transition-fast);
        }
        
        .inbox-task:hover .inbox-task-delete {
          opacity: 1;
        }
        
        .inbox-task-delete:hover {
          color: var(--danger);
          background: var(--danger-bg);
        }

        .inbox-task-goal {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          background: color-mix(in srgb, var(--goal-color, var(--primary)) 15%, transparent);
          color: var(--goal-color, var(--primary));
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
