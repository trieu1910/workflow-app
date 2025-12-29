import { useState } from 'react';
import { Cloud, Inbox, Plus, Trash2, Play, Clock, Tag } from 'lucide-react';
import { useTaskStore, STAGES } from '../stores/useTaskStore';

export default function SomedayView() {
    const tasks = useTaskStore((state) => state.tasks);
    const activateFromSomeday = useTaskStore((state) => state.activateFromSomeday);
    const deleteTask = useTaskStore((state) => state.deleteTask);
    const addTask = useTaskStore((state) => state.addTask);
    const moveToSomeday = useTaskStore((state) => state.moveToSomeday);

    const [newIdea, setNewIdea] = useState('');

    const somedayTasks = tasks.filter(t => t.stage === STAGES.SOMEDAY);

    const handleAddIdea = (e) => {
        e.preventDefault();
        if (!newIdea.trim()) return;

        const task = addTask({
            title: newIdea.trim(),
            priority: 'low',
        });

        // Move immediately to someday
        setTimeout(() => moveToSomeday(task.id), 0);
        setNewIdea('');
    };

    return (
        <div className="someday-view">
            <div className="page-header">
                <div>
                    <h1 className="page-title">☁️ Someday / Maybe</h1>
                    <p className="page-subtitle">
                        Ý tưởng để sau - GTD by David Allen
                    </p>
                </div>
            </div>

            <div className="someday-tip">
                <Cloud size={20} />
                <span>
                    Đây là nơi chứa những ý tưởng bạn chưa sẵn sàng hành động ngay.
                    Review hàng tuần để kích hoạt khi phù hợp.
                </span>
            </div>

            {/* Add new idea */}
            <form className="add-idea-form" onSubmit={handleAddIdea}>
                <input
                    type="text"
                    value={newIdea}
                    onChange={(e) => setNewIdea(e.target.value)}
                    placeholder="Thêm ý tưởng mới..."
                />
                <button type="submit" className="btn btn-primary">
                    <Plus size={18} />
                </button>
            </form>

            {/* Someday list */}
            {somedayTasks.length === 0 ? (
                <div className="empty-state">
                    <Cloud size={48} />
                    <p>Chưa có ý tưởng nào</p>
                    <span>Thêm những việc bạn muốn làm "một ngày nào đó"</span>
                </div>
            ) : (
                <div className="someday-list">
                    {somedayTasks.map(task => (
                        <div key={task.id} className="someday-item">
                            <div className="item-content">
                                <span className="item-title">{task.title}</span>
                                {task.tags?.length > 0 && (
                                    <div className="item-tags">
                                        {task.tags.map(tag => (
                                            <span key={tag} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                )}
                                <span className="item-date">
                                    Thêm: {new Date(task.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                            <div className="item-actions">
                                <button
                                    className="btn btn-ghost btn-sm activate-btn"
                                    onClick={() => activateFromSomeday(task.id)}
                                    title="Kích hoạt → Inbox"
                                >
                                    <Play size={16} /> Kích hoạt
                                </button>
                                <button
                                    className="btn btn-ghost btn-sm delete-btn"
                                    onClick={() => deleteTask(task.id)}
                                    title="Xóa"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
        .someday-view { max-width: 800px; }

        .someday-tip {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: var(--radius-lg);
          color: #a78bfa;
          margin-bottom: var(--spacing-xl);
        }

        .add-idea-form {
          display: flex;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-xl);
        }

        .add-idea-form input {
          flex: 1;
          padding: var(--spacing-md);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          background: var(--bg-surface);
          color: var(--text-primary);
          font-size: 1rem;
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-2xl);
          color: var(--text-muted);
        }

        .empty-state svg { opacity: 0.5; margin-bottom: var(--spacing-md); }
        .empty-state p { font-size: 1.1rem; margin-bottom: var(--spacing-xs); }

        .someday-list { display: flex; flex-direction: column; gap: var(--spacing-sm); }

        .someday-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
        }

        .someday-item:hover { border-color: var(--primary); }

        .item-content { flex: 1; }
        .item-title { display: block; color: var(--text-primary); font-weight: 500; }
        .item-date { font-size: 0.75rem; color: var(--text-muted); }

        .item-tags { display: flex; gap: var(--spacing-xs); margin: var(--spacing-xs) 0; }
        .tag {
          padding: 2px 8px;
          background: var(--bg-secondary);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .item-actions { display: flex; gap: var(--spacing-xs); }

        .activate-btn:hover { color: var(--success); }
        .delete-btn:hover { color: var(--danger); }

        .btn-sm { padding: var(--spacing-xs) var(--spacing-sm); font-size: 0.8rem; }
      `}</style>
        </div>
    );
}
