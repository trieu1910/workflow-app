import React, { memo } from 'react';
import { X } from 'lucide-react';
import { LIFE_AREAS } from '../../stores/useGoalStore';

/**
 * GoalFormModal Component - Form thêm/sửa goal
 * Tách ra từ GoalsView để tối ưu maintainability
 */
const GoalFormModal = memo(function GoalFormModal({
    isEdit = false,
    goalForm,
    onFormChange,
    onSubmit,
    onClose,
    onReset,
}) {
    return (
        <div className="modal-overlay">
            <form className="modal-form" onSubmit={onSubmit}>
                <div className="form-header">
                    <h3>{isEdit ? '✏️ Chỉnh sửa mục tiêu' : '🎯 Thêm mục tiêu mới'}</h3>
                    <button type="button" className="btn btn-ghost" onClick={() => { onClose(); onReset?.(); }}>
                        <X size={20} />
                    </button>
                </div>

                <div className="form-group">
                    <label>Mục tiêu *</label>
                    <input
                        type="text"
                        value={goalForm.title}
                        onChange={(e) => onFormChange({ ...goalForm, title: e.target.value })}
                        placeholder="VD: Thành thạo Tiếng Anh"
                        autoFocus
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Mô tả (tùy chọn)</label>
                    <textarea
                        value={goalForm.description}
                        onChange={(e) => onFormChange({ ...goalForm, description: e.target.value })}
                        placeholder="Chi tiết về mục tiêu..."
                        rows={2}
                    />
                </div>

                <div className="form-group why-field">
                    <label>💡 Tại sao mục tiêu này quan trọng?</label>
                    <textarea
                        value={goalForm.why || ''}
                        onChange={(e) => onFormChange({ ...goalForm, why: e.target.value })}
                        placeholder="Điều này sẽ giúp tôi... / Tôi muốn đạt được vì..."
                        rows={2}
                    />
                </div>

                <div className="form-group identity-field">
                    <label>🪞 Identity Statement (Atomic Habits)</label>
                    <input
                        type="text"
                        value={goalForm.identity || ''}
                        onChange={(e) => onFormChange({ ...goalForm, identity: e.target.value })}
                        placeholder="Tôi là người..."
                    />
                    <small>VD: "Tôi là người tập thể dục mỗi ngày"</small>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Lĩnh vực</label>
                        <select
                            value={goalForm.area}
                            onChange={(e) => onFormChange({ ...goalForm, area: e.target.value })}
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
                            onChange={(e) => onFormChange({ ...goalForm, deadline: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Thời gian</label>
                        <select
                            value={goalForm.timeframe}
                            onChange={(e) => onFormChange({ ...goalForm, timeframe: e.target.value })}
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
                            onChange={(e) => onFormChange({
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
                            onChange={(e) => onFormChange({
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
                            onChange={(e) => onFormChange({
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
                            onChange={(e) => onFormChange({
                                ...goalForm,
                                smart: { ...goalForm.smart, relevant: e.target.value }
                            })}
                            placeholder="Tại sao quan trọng với cuộc sống của tôi?"
                        />
                    </div>
                </div>

                {/* Priority Matrix (chỉ hiển thị khi edit) */}
                {isEdit && (
                    <div className="smart-section">
                        <h4>📊 Ma trận ưu tiên</h4>

                        <div className="form-group">
                            <label>🔥 Impact (Tác động): {goalForm.priority?.impact || 3}/5</label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={goalForm.priority?.impact || 3}
                                onChange={(e) => onFormChange({
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
                                onChange={(e) => onFormChange({
                                    ...goalForm,
                                    priority: { ...goalForm.priority, effort: parseInt(e.target.value) }
                                })}
                            />
                        </div>
                    </div>
                )}

                <div className="form-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => { onClose(); onReset?.(); }}>Hủy</button>
                    <button type="submit" className="btn btn-primary">
                        {isEdit ? '💾 Lưu thay đổi' : 'Tạo mục tiêu'}
                    </button>
                </div>
            </form>
        </div>
    );
});

export default GoalFormModal;
