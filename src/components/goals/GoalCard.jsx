import React, { memo } from 'react';
import { ChevronDown, ChevronRight, Edit2, Trash2, Flag, CheckCircle, Plus } from 'lucide-react';
import { LIFE_AREAS } from '../../stores/useGoalStore';
import { STAGES } from '../../stores/useTaskStore';
import MilestoneItem from './MilestoneItem';

/**
 * GoalCard Component - Hiển thị một goal với milestones
 * Tách ra từ GoalsView để tối ưu performance
 */
const GoalCard = memo(function GoalCard({
    goal,
    goalMilestones,
    progress,
    isExpanded,
    expandedMilestone,
    editingMilestone,
    showMilestoneForm,
    milestoneForm,
    onToggleExpand,
    onEditGoal,
    onDeleteGoal,
    onSetShowMilestoneForm,
    onSetMilestoneForm,
    onAddMilestone,
    onSetExpandedMilestone,
    onSetEditingMilestone,
    onUpdateMilestone,
    onDeleteMilestone,
    onCompleteTask,
    getTasksForMilestone,
    getMilestoneProgress,
}) {
    const area = LIFE_AREAS[goal.area];

    return (
        <div className="goal-card" style={{ '--area-color': area?.color || '#6366f1' }}>
            <div className="goal-header" onClick={() => onToggleExpand(goal.id)}>
                <div className="goal-expand">
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
                <span className="goal-icon">{area?.icon}</span>
                <div className="goal-info">
                    <h3 className="goal-title">{goal.title}</h3>
                    <div className="goal-meta">
                        <span className="goal-area">{area?.name}</span>
                        {goal.timeframe && (
                            <span className={`timeframe-badge ${goal.timeframe}`}>
                                {goal.timeframe === 'short' ? '🚀' : goal.timeframe === 'medium' ? '📅' : '🎯'}
                            </span>
                        )}
                        {goal.smart?.measurable && (
                            <span className="smart-badge">📊 {goal.smart.measurable}</span>
                        )}
                        {goal.deadline && <span>• Đến {goal.deadline}</span>}
                        <span>• {goalMilestones.length} cột mốc</span>
                    </div>
                </div>
                <div className="goal-progress">
                    <span className="progress-text">{progress}%</span>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>
                <div className="goal-actions" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onEditGoal(goal)} title="Chỉnh sửa"><Edit2 size={16} /></button>
                    <button onClick={() => onDeleteGoal(goal.id)} title="Xóa"><Trash2 size={16} /></button>
                </div>
            </div>

            {/* Show WHY if exists */}
            {goal.why && (
                <div className="goal-why">
                    💡 <em>"{goal.why}"</em>
                </div>
            )}

            {/* Show Identity Statement if exists */}
            {goal.identity && (
                <div className="goal-identity">
                    🪞 <strong>{goal.identity}</strong>
                </div>
            )}

            {/* Milestones */}
            {isExpanded && (
                <div className="milestones-section">
                    <div className="milestones-header">
                        <h4><Flag size={16} /> Cột mốc</h4>
                        <button className="btn btn-ghost btn-sm" onClick={() => onSetShowMilestoneForm(goal.id)}>
                            <Plus size={14} /> Thêm
                        </button>
                    </div>

                    {/* Milestone Form */}
                    {showMilestoneForm === goal.id && (
                        <form className="milestone-form" onSubmit={(e) => onAddMilestone(e, goal.id)}>
                            <input
                                type="text"
                                value={milestoneForm.title}
                                onChange={(e) => onSetMilestoneForm({ ...milestoneForm, title: e.target.value })}
                                placeholder="VD: Lấy bằng IELTS 7.0"
                                autoFocus
                            />
                            <input
                                type="date"
                                value={milestoneForm.deadline}
                                onChange={(e) => onSetMilestoneForm({ ...milestoneForm, deadline: e.target.value })}
                            />
                            <button type="submit" className="btn btn-primary btn-sm">Thêm</button>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onSetShowMilestoneForm(null)}>Hủy</button>
                        </form>
                    )}

                    {goalMilestones.length === 0 ? (
                        <p className="no-milestones">Chưa có cột mốc. Hãy chia nhỏ mục tiêu thành các bước cụ thể!</p>
                    ) : (
                        <div className="milestones-list">
                            {goalMilestones.map(milestone => (
                                <MilestoneItem
                                    key={milestone.id}
                                    milestone={milestone}
                                    mProgress={getMilestoneProgress(milestone.id)}
                                    mTasks={getTasksForMilestone(milestone.id)}
                                    isExpanded={expandedMilestone === milestone.id}
                                    isEditing={editingMilestone?.id === milestone.id}
                                    editingMilestone={editingMilestone}
                                    onToggleExpand={(id) => onSetExpandedMilestone(expandedMilestone === id ? null : id)}
                                    onEdit={(ms) => onSetEditingMilestone({ ...ms })}
                                    onSaveEdit={(id, data) => {
                                        onUpdateMilestone(id, data);
                                        onSetEditingMilestone(null);
                                    }}
                                    onCancelEdit={() => onSetEditingMilestone(null)}
                                    onDelete={onDeleteMilestone}
                                    onCompleteTask={onCompleteTask}
                                    onEditingChange={onSetEditingMilestone}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

export default GoalCard;
