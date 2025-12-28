import { useState } from 'react';
import { X, Plus, Trash2, Check, Calendar, Clock, Repeat, FileText, Save } from 'lucide-react';
import { useTaskStore } from '../stores/useTaskStore';

const RECURRENCE_OPTIONS = [
    { value: null, label: 'Không lặp lại' },
    { value: { type: 'daily', interval: 1 }, label: 'Hàng ngày' },
    { value: { type: 'weekly', interval: 1 }, label: 'Hàng tuần' },
    { value: { type: 'monthly', interval: 1 }, label: 'Hàng tháng' },
];

export default function TaskDetail({ task, onClose }) {
    const { updateTask, addSubtask, toggleSubtask, deleteSubtask } = useTaskStore();

    const [editedTask, setEditedTask] = useState({ ...task });
    const [newSubtask, setNewSubtask] = useState('');
    const [activeTab, setActiveTab] = useState('details');

    if (!task) return null;

    const handleSave = () => {
        updateTask(task.id, {
            title: editedTask.title,
            description: editedTask.description,
            notes: editedTask.notes,
            priority: editedTask.priority,
            dueDate: editedTask.dueDate,
            dueTime: editedTask.dueTime,
            estimatedMinutes: editedTask.estimatedMinutes,
            isRecurring: editedTask.isRecurring,
            recurrence: editedTask.recurrence,
        });
        onClose();
    };

    const handleAddSubtask = (e) => {
        e.preventDefault();
        if (!newSubtask.trim()) return;
        addSubtask(task.id, newSubtask.trim());
        setNewSubtask('');
    };

    const subtasks = task.subtasks || [];
    const completedCount = subtasks.filter(st => st.completed).length;
    const progress = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

    return (
        <div className="task-detail-overlay" onClick={onClose}>
            <div className="task-detail-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="task-detail-header">
                    <input
                        type="text"
                        className="task-detail-title"
                        value={editedTask.title}
                        onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                        placeholder="Tiêu đề task"
                    />
                    <button className="btn btn-icon btn-ghost" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="task-detail-tabs">
                    <button
                        className={`tab ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        Chi tiết
                    </button>
                    <button
                        className={`tab ${activeTab === 'subtasks' ? 'active' : ''}`}
                        onClick={() => setActiveTab('subtasks')}
                    >
                        Subtasks ({subtasks.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notes')}
                    >
                        Ghi chú
                    </button>
                </div>

                {/* Tab Content */}
                <div className="task-detail-content">
                    {activeTab === 'details' && (
                        <div className="detail-tab">
                            <div className="detail-row">
                                <label><Calendar size={16} /> Ngày đến hạn</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={editedTask.dueDate || ''}
                                    onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value || null })}
                                />
                            </div>

                            <div className="detail-row">
                                <label><Clock size={16} /> Giờ</label>
                                <input
                                    type="time"
                                    className="input"
                                    value={editedTask.dueTime || ''}
                                    onChange={(e) => setEditedTask({ ...editedTask, dueTime: e.target.value || null })}
                                />
                            </div>

                            <div className="detail-row">
                                <label><Clock size={16} /> Thời gian ước tính (phút)</label>
                                <input
                                    type="number"
                                    className="input"
                                    min="1"
                                    value={editedTask.estimatedMinutes || ''}
                                    onChange={(e) => setEditedTask({ ...editedTask, estimatedMinutes: parseInt(e.target.value) || null })}
                                    placeholder="30"
                                />
                            </div>

                            <div className="detail-row">
                                <label>Độ ưu tiên</label>
                                <select
                                    className="input"
                                    value={editedTask.priority}
                                    onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                                >
                                    <option value="high">Cao</option>
                                    <option value="medium">Trung bình</option>
                                    <option value="low">Thấp</option>
                                </select>
                            </div>

                            <div className="detail-row">
                                <label><Repeat size={16} /> Lặp lại</label>
                                <select
                                    className="input"
                                    value={editedTask.isRecurring ? editedTask.recurrence?.type : ''}
                                    onChange={(e) => {
                                        const option = RECURRENCE_OPTIONS.find(o => o.value?.type === e.target.value);
                                        setEditedTask({
                                            ...editedTask,
                                            isRecurring: !!option?.value,
                                            recurrence: option?.value || null,
                                        });
                                    }}
                                >
                                    {RECURRENCE_OPTIONS.map((opt, i) => (
                                        <option key={i} value={opt.value?.type || ''}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="detail-row">
                                <label>Mô tả</label>
                                <textarea
                                    className="input textarea"
                                    value={editedTask.description || ''}
                                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                                    placeholder="Thêm mô tả..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'subtasks' && (
                        <div className="subtasks-tab">
                            {subtasks.length > 0 && (
                                <div className="subtask-progress">
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                                    </div>
                                    <span>{completedCount}/{subtasks.length} hoàn thành</span>
                                </div>
                            )}

                            <form onSubmit={handleAddSubtask} className="add-subtask-form">
                                <input
                                    type="text"
                                    className="input"
                                    value={newSubtask}
                                    onChange={(e) => setNewSubtask(e.target.value)}
                                    placeholder="Thêm subtask..."
                                />
                                <button type="submit" className="btn btn-primary btn-icon">
                                    <Plus size={18} />
                                </button>
                            </form>

                            <div className="subtask-list">
                                {subtasks.map((st) => (
                                    <div key={st.id} className={`subtask-item ${st.completed ? 'completed' : ''}`}>
                                        <button
                                            className={`subtask-check ${st.completed ? 'checked' : ''}`}
                                            onClick={() => toggleSubtask(task.id, st.id)}
                                        >
                                            {st.completed && <Check size={12} />}
                                        </button>
                                        <span className="subtask-title">{st.title}</span>
                                        <button
                                            className="btn btn-icon btn-ghost subtask-delete"
                                            onClick={() => deleteSubtask(task.id, st.id)}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                {subtasks.length === 0 && (
                                    <div className="empty-subtasks">
                                        Chưa có subtask nào
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className="notes-tab">
                            <textarea
                                className="input textarea notes-textarea"
                                value={editedTask.notes || ''}
                                onChange={(e) => setEditedTask({ ...editedTask, notes: e.target.value })}
                                placeholder="Ghi chú chi tiết về task..."
                                rows={10}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="task-detail-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        <Save size={16} />
                        Lưu thay đổi
                    </button>
                </div>
            </div>

            <style>{`
        .task-detail-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--spacing-lg);
        }
        
        .task-detail-modal {
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp var(--transition-base);
        }
        
        .task-detail-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--border-color);
        }
        
        .task-detail-title {
          flex: 1;
          font-size: 1.25rem;
          font-weight: 600;
          border: none;
          background: transparent;
          color: var(--text-primary);
          outline: none;
        }
        
        .task-detail-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-color);
        }
        
        .tab {
          flex: 1;
          padding: var(--spacing-sm) var(--spacing-md);
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          border-bottom: 2px solid transparent;
        }
        
        .tab:hover {
          color: var(--text-primary);
        }
        
        .tab.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }
        
        .task-detail-content {
          flex: 1;
          overflow-y: auto;
          padding: var(--spacing-lg);
        }
        
        .detail-row {
          margin-bottom: var(--spacing-md);
        }
        
        .detail-row label {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
        }
        
        .textarea {
          resize: vertical;
          min-height: 80px;
        }
        
        .subtask-progress {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }
        
        .progress-bar {
          flex: 1;
          height: 6px;
          background: var(--bg-secondary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--success));
          border-radius: var(--radius-full);
          transition: width var(--transition-base);
        }
        
        .subtask-progress span {
          font-size: 0.8rem;
          color: var(--text-muted);
          white-space: nowrap;
        }
        
        .add-subtask-form {
          display: flex;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
        }
        
        .add-subtask-form .input {
          flex: 1;
        }
        
        .subtask-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        
        .subtask-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }
        
        .subtask-item.completed .subtask-title {
          text-decoration: line-through;
          color: var(--text-muted);
        }
        
        .subtask-check {
          width: 18px;
          height: 18px;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-sm);
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }
        
        .subtask-check.checked {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }
        
        .subtask-title {
          flex: 1;
          font-size: 0.9rem;
        }
        
        .subtask-delete {
          opacity: 0;
          transition: opacity var(--transition-fast);
        }
        
        .subtask-item:hover .subtask-delete {
          opacity: 1;
        }
        
        .empty-subtasks {
          text-align: center;
          padding: var(--spacing-xl);
          color: var(--text-muted);
        }
        
        .notes-textarea {
          min-height: 300px;
          font-family: inherit;
          line-height: 1.6;
        }
        
        .task-detail-footer {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-sm);
          padding: var(--spacing-lg);
          border-top: 1px solid var(--border-color);
        }
      `}</style>
        </div>
    );
}
