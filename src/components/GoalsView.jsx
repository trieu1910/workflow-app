import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, Edit2, Trash2, X, Target, Flag, CheckCircle, Wand2 } from 'lucide-react';
import { useGoalStore, LIFE_AREAS } from '../stores/useGoalStore';
import { useTaskStore, STAGES } from '../stores/useTaskStore';

import GoalWizard from './GoalWizard';

export default function GoalsView() {
    const { goals, milestones, addGoal, updateGoal, deleteGoal, addMilestone, updateMilestone, deleteMilestone, getGoalProgress, getMilestonesByGoal } = useGoalStore();
    const tasks = useTaskStore((state) => state.tasks);
    const completeTask = useTaskStore((state) => state.completeTask);


    const [showGoalForm, setShowGoalForm] = useState(false);
    const [showWizard, setShowWizard] = useState(false);
    const [showMilestoneForm, setShowMilestoneForm] = useState(null); // goalId
    const [expandedGoal, setExpandedGoal] = useState(null);
    const [selectedArea, setSelectedArea] = useState('all');
    const [timeframeFilter, setTimeframeFilter] = useState('all');
    const [editingGoal, setEditingGoal] = useState(null); // Goal being edited
    const [editingMilestone, setEditingMilestone] = useState(null); // Milestone being edited
    const [expandedMilestone, setExpandedMilestone] = useState(null); // Milestone showing tasks
    const [goalForm, setGoalForm] = useState({
        title: '', description: '', area: 'personal', deadline: '',
        why: '', identity: '', timeframe: 'medium',
        smart: { specific: '', measurable: '', achievable: 3, relevant: '', timeBound: '' },
        priority: { impact: 3, effort: 3 }
    });
    const [milestoneForm, setMilestoneForm] = useState({ title: '', deadline: '' });

    const filteredGoals = goals.filter(g => {
        if (g.status !== 'active') return false;
        if (selectedArea !== 'all' && g.area !== selectedArea) return false;
        if (timeframeFilter !== 'all' && g.timeframe !== timeframeFilter) return false;
        return true;
    });

    const handleAddGoal = (e) => {
        e.preventDefault();
        if (!goalForm.title.trim()) return;
        addGoal(goalForm);
        resetForm();
        setShowGoalForm(false);
    };

    const resetForm = () => {
        setGoalForm({
            title: '', description: '', area: 'personal', deadline: '',
            why: '', identity: '', timeframe: 'medium',
            smart: { specific: '', measurable: '', achievable: 3, relevant: '', timeBound: '' },
            priority: { impact: 3, effort: 3 }
        });
    };

    const handleEditGoal = (goal) => {
        setGoalForm({
            title: goal.title || '',
            description: goal.description || '',
            area: goal.area || 'personal',
            deadline: goal.deadline || '',
            why: goal.why || '',
            identity: goal.identity || '',
            timeframe: goal.timeframe || 'medium',
            smart: goal.smart || { specific: '', measurable: '', achievable: 3, relevant: '', timeBound: '' },
            priority: goal.priority || { impact: 3, effort: 3 }
        });
        setEditingGoal(goal);
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        if (!goalForm.title.trim()) return;
        updateGoal(editingGoal.id, goalForm);
        resetForm();
        setEditingGoal(null);
    };

    const handleAddMilestone = (e, goalId) => {
        e.preventDefault();
        if (!milestoneForm.title.trim()) return;
        addMilestone({ ...milestoneForm, goalId });
        setMilestoneForm({ title: '', deadline: '' });
        setShowMilestoneForm(null);
    };

    const getTasksForMilestone = (milestoneId) => {
        return tasks.filter(t => t.milestoneId === milestoneId);
    };

    const getMilestoneProgress = (milestoneId) => {
        const milestoneTasks = getTasksForMilestone(milestoneId);
        if (milestoneTasks.length === 0) return 0;
        const completed = milestoneTasks.filter(t => t.stage === STAGES.DONE).length;
        return Math.round((completed / milestoneTasks.length) * 100);
    };

    // Calculate goal progress realtime from tasks (not from stored milestone.progress)
    const getGoalProgressRealtime = (goalId) => {
        const goalMilestones = milestones.filter(m => m.goalId === goalId);
        if (goalMilestones.length === 0) return 0;

        let totalProgress = 0;
        goalMilestones.forEach(milestone => {
            totalProgress += getMilestoneProgress(milestone.id);
        });

        return Math.round(totalProgress / goalMilestones.length);
    };

    return (
        <div className="goals-view">
            <div className="page-header">
                <div>
                    <h1 className="page-title">🎯 Mục tiêu cuộc đời</h1>
                    <p className="page-subtitle">{goals.filter(g => g.status === 'active').length} mục tiêu đang theo đuổi</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => setShowWizard(true)}>
                        <Wand2 size={18} />
                        Wizard tạo mục tiêu
                    </button>
                    <button className="btn btn-ghost" onClick={() => setShowGoalForm(true)}>
                        <Plus size={18} />
                        Form nhanh
                    </button>
                </div>
            </div>

            {/* Area Filter */}
            <div className="area-filter">
                <button
                    className={`area-btn ${selectedArea === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedArea('all')}
                >
                    Tất cả
                </button>
                {Object.values(LIFE_AREAS).map(area => (
                    <button
                        key={area.id}
                        className={`area-btn ${selectedArea === area.id ? 'active' : ''}`}
                        style={{ '--area-color': area.color }}
                        onClick={() => setSelectedArea(area.id)}
                    >
                        {area.icon} {area.name}
                    </button>
                ))}
            </div>

            {/* Timeframe Filter */}
            <div className="timeframe-filter">
                <span className="filter-label">Thời gian:</span>
                {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'short', label: '🚀 Ngắn hạn (<1 tháng)' },
                    { id: 'medium', label: '📅 Trung hạn (1-6 tháng)' },
                    { id: 'long', label: '🎯 Dài hạn (>6 tháng)' },
                ].map(tf => (
                    <button
                        key={tf.id}
                        className={`timeframe-btn ${timeframeFilter === tf.id ? 'active' : ''}`}
                        onClick={() => setTimeframeFilter(tf.id)}
                    >
                        {tf.label}
                    </button>
                ))}
            </div>

            {/* Goal Form Modal */}
            {showGoalForm && (
                <div className="modal-overlay">
                    <form className="modal-form" onSubmit={handleAddGoal}>
                        <div className="form-header">
                            <h3>🎯 Thêm mục tiêu mới</h3>
                            <button type="button" className="btn btn-ghost" onClick={() => setShowGoalForm(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="form-group">
                            <label>Mục tiêu</label>
                            <input
                                type="text"
                                value={goalForm.title}
                                onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                                placeholder="VD: Thành thạo Tiếng Anh"
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label>Mô tả (tùy chọn)</label>
                            <textarea
                                value={goalForm.description}
                                onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                                placeholder="Chi tiết về mục tiêu..."
                                rows={2}
                            />
                        </div>

                        <div className="form-group why-field">
                            <label>💡 Tại sao mục tiêu này quan trọng?</label>
                            <textarea
                                value={goalForm.why || ''}
                                onChange={(e) => setGoalForm({ ...goalForm, why: e.target.value })}
                                placeholder="Điều này sẽ giúp tôi... / Tôi muốn đạt được vì..."
                                rows={2}
                            />
                        </div>

                        <div className="form-group identity-field">
                            <label>🪞 Identity Statement (Atomic Habits)</label>
                            <input
                                type="text"
                                value={goalForm.identity || ''}
                                onChange={(e) => setGoalForm({ ...goalForm, identity: e.target.value })}
                                placeholder="Tôi là người..."
                            />
                            <small>VD: "Tôi là người tập thể dục mỗi ngày"</small>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Lĩnh vực</label>
                                <select
                                    value={goalForm.area}
                                    onChange={(e) => setGoalForm({ ...goalForm, area: e.target.value })}
                                >
                                    {Object.values(LIFE_AREAS).map(area => (
                                        <option key={area.id} value={area.id}>{area.icon} {area.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Deadline</label>
                                <input
                                    type="date"
                                    value={goalForm.deadline}
                                    onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Thời gian</label>
                                <select
                                    value={goalForm.timeframe}
                                    onChange={(e) => setGoalForm({ ...goalForm, timeframe: e.target.value })}
                                >
                                    <option value="short">🚀 Ngắn hạn (&lt;1 tháng)</option>
                                    <option value="medium">📅 Trung hạn (1-6 tháng)</option>
                                    <option value="long">🎯 Dài hạn (&gt;6 tháng)</option>
                                </select>
                            </div>
                        </div>

                        {/* SMART Criteria */}
                        <div className="smart-section">
                            <h4>📊 SMART Criteria</h4>

                            <div className="form-group">
                                <label>🎯 S - Specific (Cụ thể)</label>
                                <input
                                    type="text"
                                    value={goalForm.smart?.specific || ''}
                                    onChange={(e) => setGoalForm({
                                        ...goalForm,
                                        smart: { ...goalForm.smart, specific: e.target.value }
                                    })}
                                    placeholder="Làm gì, ở đâu, với ai?"
                                />
                            </div>

                            <div className="form-group">
                                <label>📏 M - Measurable (Đo lường được)</label>
                                <input
                                    type="text"
                                    value={goalForm.smart?.measurable || ''}
                                    onChange={(e) => setGoalForm({
                                        ...goalForm,
                                        smart: { ...goalForm.smart, measurable: e.target.value }
                                    })}
                                    placeholder="Con số cụ thể: 10 cuốn sách, 50kg, IELTS 7.0..."
                                />
                            </div>

                            <div className="form-group">
                                <label>💪 A - Achievable (Khả thi): {goalForm.smart?.achievable || 3}/5</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={goalForm.smart?.achievable || 3}
                                    onChange={(e) => setGoalForm({
                                        ...goalForm,
                                        smart: { ...goalForm.smart, achievable: parseInt(e.target.value) }
                                    })}
                                />
                                <div className="achievability-labels">
                                    <span>Rất khó</span>
                                    <span>Thách thức</span>
                                    <span>Vừa sức</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>🔗 R - Relevant (Liên quan)</label>
                                <input
                                    type="text"
                                    value={goalForm.smart?.relevant || ''}
                                    onChange={(e) => setGoalForm({
                                        ...goalForm,
                                        smart: { ...goalForm.smart, relevant: e.target.value }
                                    })}
                                    placeholder="Tại sao quan trọng với cuộc sống của tôi?"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-ghost" onClick={() => setShowGoalForm(false)}>Hủy</button>
                            <button type="submit" className="btn btn-primary">Tạo mục tiêu</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Goals List */}
            <div className="goals-list">
                {filteredGoals.length === 0 ? (
                    <div className="empty-state">
                        <Target size={48} />
                        <h3>Chưa có mục tiêu nào</h3>
                        <p>Hãy bắt đầu bằng việc thêm một mục tiêu lớn trong cuộc đời bạn!</p>
                    </div>
                ) : (
                    filteredGoals.map(goal => {
                        const area = LIFE_AREAS[goal.area];
                        const progress = getGoalProgressRealtime(goal.id);
                        const goalMilestones = getMilestonesByGoal(goal.id);
                        const isExpanded = expandedGoal === goal.id;

                        return (
                            <div key={goal.id} className="goal-card" style={{ '--area-color': area?.color || '#6366f1' }}>
                                <div className="goal-header" onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}>
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
                                        <button onClick={() => handleEditGoal(goal)} title="Chỉnh sửa"><Edit2 size={16} /></button>
                                        <button onClick={() => deleteGoal(goal.id)} title="Xóa"><Trash2 size={16} /></button>
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
                                            <button className="btn btn-ghost btn-sm" onClick={() => setShowMilestoneForm(goal.id)}>
                                                <Plus size={14} /> Thêm
                                            </button>
                                        </div>

                                        {/* Milestone Form */}
                                        {showMilestoneForm === goal.id && (
                                            <form className="milestone-form" onSubmit={(e) => handleAddMilestone(e, goal.id)}>
                                                <input
                                                    type="text"
                                                    value={milestoneForm.title}
                                                    onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                                                    placeholder="VD: Lấy bằng IELTS 7.0"
                                                    autoFocus
                                                />
                                                <input
                                                    type="date"
                                                    value={milestoneForm.deadline}
                                                    onChange={(e) => setMilestoneForm({ ...milestoneForm, deadline: e.target.value })}
                                                />
                                                <button type="submit" className="btn btn-primary btn-sm">Thêm</button>
                                                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowMilestoneForm(null)}>Hủy</button>
                                            </form>
                                        )}

                                        {goalMilestones.length === 0 ? (
                                            <p className="no-milestones">Chưa có cột mốc. Hãy chia nhỏ mục tiêu thành các bước cụ thể!</p>
                                        ) : (
                                            <div className="milestones-list">
                                                {goalMilestones.map(milestone => {
                                                    const mProgress = getMilestoneProgress(milestone.id);
                                                    const mTasks = getTasksForMilestone(milestone.id);
                                                    const isEditing = editingMilestone?.id === milestone.id;

                                                    return (
                                                        <div key={milestone.id} className="milestone-item">
                                                            {isEditing ? (
                                                                <div className="milestone-edit-form">
                                                                    <input
                                                                        type="text"
                                                                        value={editingMilestone.title}
                                                                        onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })}
                                                                        placeholder="Tên cột mốc"
                                                                        autoFocus
                                                                    />
                                                                    <input
                                                                        type="date"
                                                                        value={editingMilestone.deadline || ''}
                                                                        onChange={(e) => setEditingMilestone({ ...editingMilestone, deadline: e.target.value })}
                                                                    />
                                                                    <div className="edit-actions">
                                                                        <button
                                                                            className="btn btn-primary btn-sm"
                                                                            onClick={() => {
                                                                                updateMilestone(milestone.id, {
                                                                                    title: editingMilestone.title,
                                                                                    deadline: editingMilestone.deadline
                                                                                });
                                                                                setEditingMilestone(null);
                                                                            }}
                                                                        >
                                                                            Lưu
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-ghost btn-sm"
                                                                            onClick={() => setEditingMilestone(null)}
                                                                        >
                                                                            Hủy
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div
                                                                        className="milestone-info milestone-clickable"
                                                                        onClick={() => setExpandedMilestone(expandedMilestone === milestone.id ? null : milestone.id)}
                                                                    >
                                                                        <div className="milestone-expand-icon">
                                                                            {expandedMilestone === milestone.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
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
                                                                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingMilestone({ ...milestone })}>
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                    <button className="btn btn-ghost btn-sm" onClick={() => deleteMilestone(milestone.id)}>
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </>
                                                            )}

                                                            {/* Task List for Milestone */}
                                                            {expandedMilestone === milestone.id && mTasks.length > 0 && (
                                                                <div className="milestone-tasks-list">
                                                                    {mTasks.map(task => (
                                                                        <div
                                                                            key={task.id}
                                                                            className={`milestone-task-item ${task.stage === STAGES.DONE ? 'completed' : ''}`}
                                                                        >
                                                                            <button
                                                                                className={`task-checkbox ${task.stage === STAGES.DONE ? 'checked' : ''}`}
                                                                                onClick={() => task.stage !== STAGES.DONE && completeTask(task.id)}
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

                                                            {expandedMilestone === milestone.id && mTasks.length === 0 && (
                                                                <div className="milestone-tasks-empty">
                                                                    Chưa có task nào. Liên kết task với cột mốc này từ màn hình Inbox!
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Edit Goal Modal */}
            {editingGoal && (
                <div className="modal-overlay">
                    <form className="modal-form" onSubmit={handleSaveEdit}>
                        <div className="form-header">
                            <h2>✏️ Chỉnh sửa mục tiêu</h2>
                            <button type="button" className="btn-close" onClick={() => { setEditingGoal(null); resetForm(); }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="form-group">
                            <label>Tên mục tiêu *</label>
                            <input
                                type="text"
                                value={goalForm.title}
                                onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Mô tả</label>
                            <textarea
                                value={goalForm.description}
                                onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                                rows={2}
                            />
                        </div>

                        <div className="form-group why-field">
                            <label>💡 Tại sao quan trọng?</label>
                            <textarea
                                value={goalForm.why || ''}
                                onChange={(e) => setGoalForm({ ...goalForm, why: e.target.value })}
                                rows={2}
                            />
                        </div>

                        <div className="form-group identity-field">
                            <label>🪞 Identity Statement</label>
                            <input
                                type="text"
                                value={goalForm.identity || ''}
                                onChange={(e) => setGoalForm({ ...goalForm, identity: e.target.value })}
                                placeholder="Tôi là người..."
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Lĩnh vực</label>
                                <select
                                    value={goalForm.area}
                                    onChange={(e) => setGoalForm({ ...goalForm, area: e.target.value })}
                                >
                                    {Object.values(LIFE_AREAS).map(area => (
                                        <option key={area.id} value={area.id}>{area.icon} {area.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Thời gian</label>
                                <select
                                    value={goalForm.timeframe}
                                    onChange={(e) => setGoalForm({ ...goalForm, timeframe: e.target.value })}
                                >
                                    <option value="short">🚀 Ngắn hạn</option>
                                    <option value="medium">📅 Trung hạn</option>
                                    <option value="long">🎯 Dài hạn</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Deadline</label>
                                <input
                                    type="date"
                                    value={goalForm.deadline}
                                    onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Priority Matrix */}
                        <div className="smart-section">
                            <h4>📊 Ma trận ưu tiên</h4>

                            <div className="form-group">
                                <label>🔥 Impact (Tác động): {goalForm.priority?.impact || 3}/5</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={goalForm.priority?.impact || 3}
                                    onChange={(e) => setGoalForm({
                                        ...goalForm,
                                        priority: { ...goalForm.priority, impact: parseInt(e.target.value) }
                                    })}
                                />
                            </div>

                            <div className="form-group">
                                <label>💪 Effort (Công sức): {goalForm.priority?.effort || 3}/5</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={goalForm.priority?.effort || 3}
                                    onChange={(e) => setGoalForm({
                                        ...goalForm,
                                        priority: { ...goalForm.priority, effort: parseInt(e.target.value) }
                                    })}
                                />
                            </div>
                        </div>

                        {/* SMART Criteria */}
                        <div className="smart-section">
                            <h4>📋 SMART Criteria</h4>

                            <div className="form-group">
                                <label>🎯 S - Specific</label>
                                <input
                                    type="text"
                                    value={goalForm.smart?.specific || ''}
                                    onChange={(e) => setGoalForm({
                                        ...goalForm,
                                        smart: { ...goalForm.smart, specific: e.target.value }
                                    })}
                                />
                            </div>

                            <div className="form-group">
                                <label>📏 M - Measurable</label>
                                <input
                                    type="text"
                                    value={goalForm.smart?.measurable || ''}
                                    onChange={(e) => setGoalForm({
                                        ...goalForm,
                                        smart: { ...goalForm.smart, measurable: e.target.value }
                                    })}
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-ghost" onClick={() => { setEditingGoal(null); resetForm(); }}>Hủy</button>
                            <button type="submit" className="btn btn-primary">💾 Lưu thay đổi</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Goal Wizard */}
            {showWizard && (
                <GoalWizard
                    onClose={() => setShowWizard(false)}
                    onComplete={() => setShowWizard(false)}
                />
            )}

            <style>{`
        .goals-view { max-width: 900px; }
        .header-actions { display: flex; gap: var(--spacing-sm); }
        
        .area-filter {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
          margin-bottom: var(--spacing-lg);
        }
        
        .area-btn {
          padding: var(--spacing-xs) var(--spacing-md);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .area-btn.active {
          background: var(--area-color, var(--primary));
          border-color: var(--area-color, var(--primary));
          color: white;
        }
        
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }
        
        .modal-form {
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
          width: 90%;
          max-width: 500px;
          max-height: 85vh;
          overflow-y: auto;
        }
        
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }
        
        .form-group { margin-bottom: var(--spacing-md); }
        .form-group label { display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: var(--spacing-xs); }
        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          color: var(--text-primary);
        }
        
        .form-row { display: flex; gap: var(--spacing-md); }
        .form-row .form-group { flex: 1; }
        .form-actions { display: flex; justify-content: flex-end; gap: var(--spacing-sm); margin-top: var(--spacing-lg); }
        
        .goals-list { display: flex; flex-direction: column; gap: var(--spacing-md); }
        
        .goal-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-left: 4px solid var(--area-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        
        .goal-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        
        .goal-header:hover { background: var(--bg-secondary); }
        
        .goal-expand { color: var(--text-muted); }
        .goal-icon { font-size: 1.5rem; }
        .goal-info { flex: 1; }
        .goal-title { font-size: 1rem; color: var(--text-primary); margin-bottom: 2px; }
        .goal-meta { font-size: 0.8rem; color: var(--text-muted); display: flex; gap: var(--spacing-sm); }
        .goal-area { color: var(--area-color); font-weight: 500; }
        
        .goal-progress { text-align: right; min-width: 80px; }
        .progress-text { font-size: 0.9rem; font-weight: 600; color: var(--area-color); }
        .progress-bar { height: 6px; background: var(--bg-secondary); border-radius: var(--radius-full); margin-top: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--area-color); border-radius: var(--radius-full); transition: width var(--transition-base); }
        
        .goal-actions { opacity: 0; transition: opacity var(--transition-fast); display: flex; gap: 4px; }
        .goal-header:hover .goal-actions { opacity: 1; }
        .goal-actions button { padding: var(--spacing-xs); background: none; border: none; color: var(--text-muted); cursor: pointer; }
        .goal-actions button:first-child:hover { color: var(--primary); }
        .goal-actions button:last-child:hover { color: var(--danger); }
        
        .milestones-section {
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
        }
        
        .milestones-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm); }
        .milestones-header h4 { display: flex; align-items: center; gap: var(--spacing-xs); font-size: 0.9rem; color: var(--text-secondary); }
        
        .milestone-form { display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-md); }
        .milestone-form input { flex: 1; padding: var(--spacing-xs) var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-surface); color: var(--text-primary); }
        
        .no-milestones { font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: var(--spacing-md); }
        
        .milestones-list { display: flex; flex-direction: column; gap: var(--spacing-xs); }
        
        .milestone-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: var(--bg-surface);
          border-radius: var(--radius-md);
        }
        
        .milestone-info { flex: 1; }
        .milestone-title { font-size: 0.9rem; color: var(--text-primary); display: block; }
        .milestone-meta { font-size: 0.75rem; color: var(--text-muted); }
        
        .milestone-progress { width: 60px; }
        .progress-bar-sm { height: 4px; background: var(--bg-secondary); border-radius: var(--radius-full); overflow: hidden; }
        
        .btn-sm { padding: var(--spacing-xs) var(--spacing-sm); font-size: 0.8rem; }

        .goal-why {
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--primary-glow);
          border-left: 3px solid var(--primary);
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .why-field label {
          color: var(--primary);
        }

        .goal-identity {
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(139, 92, 246, 0.1);
          border-left: 3px solid #8b5cf6;
          font-size: 0.9rem;
          color: #a78bfa;
        }

        .identity-field label { color: #8b5cf6; }
        .identity-field small { 
          display: block;
          margin-top: 4px;
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .timeframe-filter {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-lg);
          flex-wrap: wrap;
        }

        .filter-label { color: var(--text-muted); font-size: 0.9rem; }

        .timeframe-btn {
          padding: var(--spacing-xs) var(--spacing-md);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          background: var(--bg-surface);
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.85rem;
          transition: all var(--transition-fast);
        }

        .timeframe-btn:hover { border-color: var(--primary); }
        .timeframe-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .timeframe-badge {
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
        }

        .smart-badge {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
        }

        .smart-section {
          background: var(--bg-secondary);
          padding: var(--spacing-md);
          border-radius: var(--radius-lg);
          margin-top: var(--spacing-md);
        }

        .smart-section h4 {
          margin-bottom: var(--spacing-md);
          color: var(--text-primary);
        }

        .smart-section input[type="range"] {
          width: 100%;
          margin: var(--spacing-xs) 0;
        }

        .achievability-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        
        .empty-state { text-align: center; padding: var(--spacing-2xl); color: var(--text-muted); }
        .empty-state svg { margin-bottom: var(--spacing-md); opacity: 0.5; }
        .empty-state h3 { color: var(--text-secondary); margin-bottom: var(--spacing-sm); }

        .milestone-edit-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          width: 100%;
        }

        .milestone-edit-form input {
          padding: var(--spacing-sm);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .milestone-edit-form input:focus {
          outline: none;
          border-color: var(--primary);
        }

        .edit-actions {
          display: flex;
          gap: var(--spacing-sm);
        }

        /* Milestone Task List Styles */
        .milestone-item {
          flex-wrap: wrap;
        }
        
        .milestone-clickable {
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          flex: 1;
          padding: var(--spacing-xs);
          border-radius: var(--radius-sm);
          transition: background var(--transition-fast);
        }
        
        .milestone-clickable:hover {
          background: var(--bg-secondary);
        }
        
        .milestone-expand-icon {
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }
        
        .milestone-tasks-list {
          width: 100%;
          margin-top: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        
        .milestone-task-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: var(--bg-surface);
          border-radius: var(--radius-sm);
          border-left: 3px solid var(--primary);
          transition: all var(--transition-fast);
        }
        
        .milestone-task-item:hover {
          transform: translateX(4px);
        }
        
        .milestone-task-item.completed {
          border-left-color: var(--success);
          opacity: 0.7;
        }
        
        .milestone-task-item .task-checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-sm);
          background: var(--bg-surface);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }
        
        .milestone-task-item .task-checkbox:hover {
          border-color: var(--primary);
          background: var(--primary-glow);
        }
        
        .milestone-task-item .task-checkbox.checked {
          background: var(--success);
          border-color: var(--success);
          color: white;
        }
        
        .task-name {
          flex: 1;
          font-size: 0.85rem;
          color: var(--text-primary);
        }
        
        .task-name.done {
          text-decoration: line-through;
          color: var(--text-muted);
        }
        
        .task-stage-badge {
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          background: var(--bg-secondary);
        }
        
        .task-stage-badge.done {
          background: rgba(34, 197, 94, 0.15);
          color: var(--success);
        }
        
        .task-stage-badge.in_progress {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }
        
        .milestone-tasks-empty {
          width: 100%;
          margin-top: var(--spacing-sm);
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          font-size: 0.8rem;
          color: var(--text-muted);
          text-align: center;
          font-style: italic;
        }
      `}</style>
        </div>
    );
}
