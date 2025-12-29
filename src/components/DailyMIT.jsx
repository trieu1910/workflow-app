import { useState, useEffect } from 'react';
import { Target, Star, X, Check, AlertCircle } from 'lucide-react';
import { useTaskStore, STAGES } from '../stores/useTaskStore';

export default function DailyMIT({ onClose }) {
    const tasks = useTaskStore((state) => state.tasks);
    const setMIT = useTaskStore((state) => state.setMIT);
    const getTodayMITs = useTaskStore((state) => state.getTodayMITs);
    const clearExpiredMITs = useTaskStore((state) => state.clearExpiredMITs);

    // Get eligible tasks (not done, not someday)
    const eligibleTasks = tasks.filter(t =>
        !t.completed &&
        t.stage !== STAGES.DONE &&
        t.stage !== STAGES.SOMEDAY
    );

    const todayMITs = getTodayMITs();
    const [selectedIds, setSelectedIds] = useState(todayMITs.map(t => t.id));

    useEffect(() => {
        clearExpiredMITs();
    }, []);

    const toggleSelection = (taskId) => {
        if (selectedIds.includes(taskId)) {
            setSelectedIds(selectedIds.filter(id => id !== taskId));
        } else if (selectedIds.length < 3) {
            setSelectedIds([...selectedIds, taskId]);
        }
    };

    const handleSave = () => {
        // Clear old MITs
        eligibleTasks.forEach(t => {
            if (t.isMIT && !selectedIds.includes(t.id)) {
                setMIT(t.id, false);
            }
        });
        // Set new MITs
        selectedIds.forEach(id => {
            setMIT(id, true);
        });
        onClose();
    };

    return (
        <div className="mit-overlay">
            <div className="mit-modal">
                <button className="mit-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="mit-header">
                    <Target size={32} className="mit-icon" />
                    <h2>🎯 3 Tasks Quan Trọng Nhất</h2>
                    <p>Chọn 3 tasks BẮT BUỘC phải hoàn thành hôm nay</p>
                </div>

                <div className="mit-tip">
                    <AlertCircle size={16} />
                    <span>"Eat that frog first" - Brian Tracy</span>
                </div>

                <div className="mit-counter">
                    Đã chọn: <strong>{selectedIds.length}</strong>/3
                </div>

                <div className="mit-list">
                    {eligibleTasks.length === 0 ? (
                        <p className="empty-text">Không có task nào. Hãy thêm task mới!</p>
                    ) : (
                        eligibleTasks.map(task => {
                            const isSelected = selectedIds.includes(task.id);
                            const isDisabled = !isSelected && selectedIds.length >= 3;

                            return (
                                <div
                                    key={task.id}
                                    className={`mit-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                    onClick={() => !isDisabled && toggleSelection(task.id)}
                                >
                                    <div className="mit-checkbox">
                                        {isSelected ? <Star size={20} fill="currentColor" /> : <Star size={20} />}
                                    </div>
                                    <div className="mit-info">
                                        <span className="mit-title">{task.title}</span>
                                        <span className="mit-meta">
                                            {task.priority === 'high' && '🔴 '}
                                            {task.priority === 'medium' && '🟡 '}
                                            {task.estimatedMinutes && `${task.estimatedMinutes}m`}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="mit-actions">
                    <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={selectedIds.length === 0}
                    >
                        <Check size={18} /> Xác nhận
                    </button>
                </div>
            </div>

            <style>{`
        .mit-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .mit-modal {
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
        }

        .mit-close {
          position: absolute;
          top: var(--spacing-md);
          right: var(--spacing-md);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .mit-header {
          text-align: center;
          margin-bottom: var(--spacing-lg);
        }

        .mit-icon { color: var(--primary); margin-bottom: var(--spacing-sm); }
        .mit-header h2 { margin-bottom: var(--spacing-xs); color: var(--text-primary); }
        .mit-header p { color: var(--text-muted); font-size: 0.9rem; }

        .mit-tip {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--primary-glow);
          border-radius: var(--radius-md);
          color: var(--primary);
          font-size: 0.85rem;
          margin-bottom: var(--spacing-md);
        }

        .mit-counter {
          text-align: center;
          margin-bottom: var(--spacing-md);
          color: var(--text-secondary);
        }

        .mit-list { display: flex; flex-direction: column; gap: var(--spacing-xs); margin-bottom: var(--spacing-lg); }

        .mit-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .mit-item:hover:not(.disabled) { border-color: var(--primary); }
        .mit-item.selected { 
          border-color: var(--primary); 
          background: var(--primary-glow); 
        }
        .mit-item.selected .mit-checkbox { color: var(--primary); }
        .mit-item.disabled { opacity: 0.4; cursor: not-allowed; }

        .mit-checkbox { color: var(--text-muted); }
        
        .mit-info { flex: 1; display: flex; flex-direction: column; }
        .mit-title { color: var(--text-primary); }
        .mit-meta { font-size: 0.75rem; color: var(--text-muted); }

        .mit-actions { display: flex; justify-content: flex-end; gap: var(--spacing-sm); }

        .empty-text { text-align: center; color: var(--text-muted); padding: var(--spacing-lg); }
      `}</style>
        </div>
    );
}
