import React, { memo } from 'react';
import { ChevronDown, ChevronRight, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { STAGES } from '../../stores/useTaskStore';

/**
 * MilestoneItem Component - Hiển thị một milestone với tasks
 * Tách ra từ GoalsView để tối ưu performance
 */
const MilestoneItem = memo(function MilestoneItem({
    milestone,
    mProgress,
    mTasks,
    isExpanded,
    isEditing,
    editingMilestone,
    onToggleExpand,
    onEdit,
    onSaveEdit,
    onCancelEdit,
    onDelete,
    onCompleteTask,
    onEditingChange,
}) {
    if (isEditing) {
        return (
            <div className="milestone-item">
                <div className="milestone-edit-form">
                    <input
                        type="text"
                        value={editingMilestone.title}
                        onChange={(e) => onEditingChange({ ...editingMilestone, title: e.target.value })}
                        placeholder="Tên cột mốc"
                        autoFocus
                    />
                    <input
                        type="date"
                        value={editingMilestone.deadline || ''}
                        onChange={(e) => onEditingChange({ ...editingMilestone, deadline: e.target.value })}
                    />
                    <div className="edit-actions">
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onSaveEdit(milestone.id, {
                                title: editingMilestone.title,
                                deadline: editingMilestone.deadline
                            })}
                        >
                            Lưu
                        </button>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={onCancelEdit}
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="milestone-item">
            <div
                className="milestone-info milestone-clickable"
                onClick={() => onToggleExpand(milestone.id)}
            >
                <div className="milestone-expand-icon">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
                <div>
                    <span className="milestone-title">{milestone.title}</span>
                    <span className="milestone-meta">
                        {mTasks.length} tasks • {mProgress}%
                        {milestone.deadline && ` • ${milestone.deadline}`}
                    </span>
                </div>
            </div>
            <div className="milestone-progress">
                <div className="progress-bar-sm">
                    <div className="progress-fill" style={{ width: `${mProgress}%` }} />
                </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onEdit(milestone)}>
                <Edit2 size={14} />
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => onDelete(milestone.id)}>
                <Trash2 size={14} />
            </button>

            {/* Task List for Milestone */}
            {isExpanded && mTasks.length > 0 && (
                <div className="milestone-tasks-list">
                    {mTasks.map(task => (
                        <div
                            key={task.id}
                            className={`milestone-task-item ${task.stage === STAGES.DONE ? 'completed' : ''}`}
                        >
                            <button
                                className={`task-checkbox ${task.stage === STAGES.DONE ? 'checked' : ''}`}
                                onClick={() => task.stage !== STAGES.DONE && onCompleteTask(task.id)}
                                title={task.stage === STAGES.DONE ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                            >
                                {task.stage === STAGES.DONE && <CheckCircle size={14} />}
                            </button>
                            <span className={`task-name ${task.stage === STAGES.DONE ? 'done' : ''}`}>
                                {task.title}
                            </span>
                            <span className={`task-stage-badge ${task.stage}`}>
                                {task.stage === STAGES.DONE ? '✓' :
                                    task.stage === STAGES.IN_PROGRESS ? '🔄' :
                                        task.stage === STAGES.SCHEDULED ? '📅' :
                                            task.stage === STAGES.PRIORITIZED ? '⭐' : '📥'}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {isExpanded && mTasks.length === 0 && (
                <div className="milestone-tasks-empty">
                    Chưa có task nào. Liên kết task với cột mốc này từ màn hình Inbox!
                </div>
            )}
        </div>
    );
});

export default MilestoneItem;
