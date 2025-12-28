import { useState } from 'react';
import { ArrowRight, Check, Trash2, GripVertical } from 'lucide-react';
import { useTaskStore, STAGES } from '../stores/useTaskStore';

const QUADRANTS = [
  { id: 'do', title: 'Làm ngay', subtitle: 'Quan trọng + Khẩn cấp', color: '#ef4444', icon: '🔥' },
  { id: 'schedule', title: 'Lên lịch', subtitle: 'Quan trọng + Không khẩn', color: '#3b82f6', icon: '📅' },
  { id: 'delegate', title: 'Ủy quyền', subtitle: 'Không quan trọng + Khẩn', color: '#f59e0b', icon: '👥' },
  { id: 'eliminate', title: 'Loại bỏ', subtitle: 'Không quan trọng + Không khẩn', color: '#6b7280', icon: '🗑️' },
];

export default function EisenhowerMatrix() {
  const tasks = useTaskStore((state) => state.tasks);
  const prioritizeTask = useTaskStore((state) => state.prioritizeTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const completeTask = useTaskStore((state) => state.completeTask);

  const [draggedTask, setDraggedTask] = useState(null);

  // Only show INBOX tasks - these need to be prioritized
  const inboxTasks = tasks.filter(t => t.stage === STAGES.INBOX);

  // Show PRIORITIZED tasks in their quadrants
  const getQuadrantTasks = (quadrantId) => {
    return tasks.filter(t => t.stage === STAGES.PRIORITIZED && t.quadrant === quadrantId);
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, quadrantId) => {
    e.preventDefault();
    if (draggedTask) {
      prioritizeTask(draggedTask.id, quadrantId);
      setDraggedTask(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="matrix-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ma trận Eisenhower</h1>
          <p className="page-subtitle">
            {inboxTasks.length > 0
              ? `📥 ${inboxTasks.length} task cần phân loại`
              : '✨ Tất cả đã được phân loại!'}
          </p>
        </div>
      </div>

      {/* Inbox Tasks - Need to classify */}
      {inboxTasks.length > 0 && (
        <div className="inbox-section">
          <h3>📥 Inbox - Kéo vào ma trận để phân loại</h3>
          <div className="inbox-tasks">
            {inboxTasks.map((task) => (
              <div
                key={task.id}
                className={`inbox-task priority-${task.priority}`}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
              >
                <GripVertical size={16} className="drag-handle" />
                <span className="inbox-task-title">{task.title}</span>
                <span className={`priority-badge priority-${task.priority}`}>
                  {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'TB' : 'Thấp'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matrix Grid */}
      <div className="matrix-grid">
        {QUADRANTS.map((quadrant) => {
          const quadrantTasks = getQuadrantTasks(quadrant.id);

          return (
            <div
              key={quadrant.id}
              className="matrix-quadrant"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, quadrant.id)}
              style={{ '--quadrant-color': quadrant.color }}
            >
              <div className="quadrant-header">
                <span className="quadrant-icon">{quadrant.icon}</span>
                <div>
                  <h3>{quadrant.title}</h3>
                  <p>{quadrant.subtitle}</p>
                </div>
                <span className="quadrant-count">{quadrantTasks.length}</span>
              </div>

              <div className="quadrant-tasks">
                {quadrantTasks.map((task) => (
                  <div key={task.id} className="quadrant-task">
                    <span className="quadrant-task-title">{task.title}</span>
                    <div className="quadrant-task-actions">
                      <button
                        onClick={() => completeTask(task.id)}
                        title="Hoàn thành"
                      >
                        <Check size={14} />
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
                {quadrantTasks.length === 0 && (
                  <div className="quadrant-empty">
                    Kéo task vào đây
                  </div>
                )}
              </div>

              {/* Next Step Hint */}
              <div className="quadrant-hint">
                <ArrowRight size={14} />
                <span>Sau đó: Lên lịch cụ thể</span>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .matrix-view {
          max-width: 1100px;
        }
        
        .inbox-section {
          margin-bottom: var(--spacing-xl);
          padding: var(--spacing-lg);
          background: var(--bg-surface);
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-xl);
        }
        
        .inbox-section h3 {
          margin-bottom: var(--spacing-md);
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        
        .inbox-tasks {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }
        
        .inbox-task {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: grab;
          transition: all var(--transition-fast);
        }
        
        .inbox-task:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        
        .inbox-task:active {
          cursor: grabbing;
        }
        
        .drag-handle {
          color: var(--text-muted);
        }
        
        .inbox-task-title {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .matrix-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-md);
        }
        
        .matrix-quadrant {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-md);
          min-height: 250px;
          display: flex;
          flex-direction: column;
          border-top: 3px solid var(--quadrant-color);
        }
        
        .quadrant-header {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-md);
          border-bottom: 1px solid var(--border-color);
        }
        
        .quadrant-icon {
          font-size: 1.5rem;
        }
        
        .quadrant-header h3 {
          font-size: 1rem;
          color: var(--text-primary);
          margin: 0;
        }
        
        .quadrant-header p {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0;
        }
        
        .quadrant-count {
          margin-left: auto;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--quadrant-color);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: var(--radius-full);
        }
        
        .quadrant-tasks {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        
        .quadrant-task {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-sm);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        
        .quadrant-task:hover {
          background: var(--bg-surface-hover);
        }
        
        .quadrant-task-title {
          flex: 1;
          font-size: 0.85rem;
          color: var(--text-primary);
        }
        
        .quadrant-task-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }
        
        .quadrant-task:hover .quadrant-task-actions {
          opacity: 1;
        }
        
        .quadrant-task-actions button {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: var(--bg-surface);
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .quadrant-task-actions button:hover {
          background: var(--primary);
          color: white;
        }
        
        .quadrant-empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 0.85rem;
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-md);
          min-height: 100px;
        }
        
        .quadrant-hint {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          margin-top: var(--spacing-sm);
          padding-top: var(--spacing-sm);
          border-top: 1px solid var(--border-light);
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        
        @media (max-width: 768px) {
          .matrix-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
