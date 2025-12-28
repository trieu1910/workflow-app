import { useState } from 'react';
import { Filter, SortAsc, Plus, Inbox as InboxIcon } from 'lucide-react';
import TaskCard from './TaskCard';
import { useTaskStore } from '../stores/useTaskStore';

export default function TaskList({ filter = 'all', onStartFocus, onOpenQuickAdd, onTaskClick }) {
    const [sortBy, setSortBy] = useState('created');
    const [filterPriority, setFilterPriority] = useState('all');

    const tasks = useTaskStore((state) => state.tasks);

    // Filter tasks based on view
    let filteredTasks = tasks;

    switch (filter) {
        case 'inbox':
            filteredTasks = tasks.filter(t => !t.completed);
            break;
        case 'today':
            const today = new Date().toISOString().split('T')[0];
            filteredTasks = tasks.filter(t => {
                if (t.completed) return false;
                if (t.dueDate === today) return true;
                if (t.scheduledFor === today) return true;
                // Also show overdue tasks
                if (t.dueDate && t.dueDate < today) return true;
                return false;
            });
            break;
        case 'completed':
            filteredTasks = tasks.filter(t => t.completed);
            break;
        default:
            filteredTasks = tasks.filter(t => !t.completed);
    }

    // Filter by priority
    if (filterPriority !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.priority === filterPriority);
    }

    // Sort tasks
    filteredTasks = [...filteredTasks].sort((a, b) => {
        switch (sortBy) {
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            case 'dueDate':
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            case 'created':
            default:
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });

    const getTitle = () => {
        switch (filter) {
            case 'inbox': return 'Inbox';
            case 'today': return 'Hôm nay';
            case 'completed': return 'Đã hoàn thành';
            default: return 'Công việc';
        }
    };

    const getSubtitle = () => {
        const count = filteredTasks.length;
        if (filter === 'completed') {
            return `${count} công việc đã xong`;
        }
        return `${count} công việc`;
    };

    return (
        <div className="task-list-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{getTitle()}</h1>
                    <p className="page-subtitle">{getSubtitle()}</p>
                </div>

                <div className="task-list-actions">
                    {/* Priority Filter */}
                    <div className="filter-group">
                        <Filter size={16} />
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">Tất cả</option>
                            <option value="high">Cao</option>
                            <option value="medium">Trung bình</option>
                            <option value="low">Thấp</option>
                        </select>
                    </div>

                    {/* Sort */}
                    <div className="filter-group">
                        <SortAsc size={16} />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="filter-select"
                        >
                            <option value="created">Mới nhất</option>
                            <option value="priority">Độ ưu tiên</option>
                            <option value="dueDate">Ngày đến hạn</option>
                        </select>
                    </div>

                    {/* Add Button */}
                    <button className="btn btn-primary" onClick={onOpenQuickAdd}>
                        <Plus size={18} />
                        <span>Thêm việc</span>
                    </button>
                </div>
            </div>

            {/* Task List */}
            <div className="task-list">
                {filteredTasks.length === 0 ? (
                    <div className="empty-state">
                        <InboxIcon size={64} />
                        <h3>
                            {filter === 'completed'
                                ? 'Chưa có công việc nào hoàn thành'
                                : 'Inbox trống!'}
                        </h3>
                        <p>
                            {filter === 'completed'
                                ? 'Hoàn thành vài việc để thấy chúng ở đây'
                                : 'Nhấn Ctrl+K để thêm công việc mới'}
                        </p>
                    </div>
                ) : (
                    filteredTasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onStartFocus={onStartFocus}
                            onTaskClick={onTaskClick}
                        />
                    ))
                )}
            </div>

            <style>{`
        .task-list-container {
          max-width: 800px;
        }
        
        .task-list-actions {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        
        .filter-group {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          color: var(--text-muted);
        }
        
        .filter-select {
          padding: var(--spacing-xs) var(--spacing-sm);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-surface);
          color: var(--text-primary);
          font-size: 0.875rem;
          cursor: pointer;
        }
        
        .filter-select:focus {
          outline: none;
          border-color: var(--primary);
        }
        
        .task-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }
      `}</style>
        </div>
    );
}
