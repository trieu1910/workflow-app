import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Target, Lightbulb, BarChart3, Check } from 'lucide-react';
import { useGoalStore, LIFE_AREAS } from '../stores/useGoalStore';

const STEPS = [
    { id: 1, title: 'Thông tin cơ bản', icon: Target },
    { id: 2, title: 'SMART Criteria', icon: BarChart3 },
    { id: 3, title: 'Ưu tiên & Thời gian', icon: Lightbulb },
];

export default function GoalWizard({ onClose, onComplete }) {
    const addGoal = useGoalStore((state) => state.addGoal);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        why: '',
        identity: '',
        area: 'personal',
        deadline: '',
        timeframe: 'medium',
        smart: {
            specific: '',
            measurable: '',
            achievable: 3,
            relevant: '',
        },
        priority: {
            impact: 3,
            effort: 3,
        },
    });

    const updateForm = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateSmart = (field, value) => {
        setFormData(prev => ({
            ...prev,
            smart: { ...prev.smart, [field]: value }
        }));
    };

    const updatePriority = (field, value) => {
        setFormData(prev => ({
            ...prev,
            priority: { ...prev.priority, [field]: value }
        }));
    };

    const canProceed = () => {
        if (currentStep === 1) return formData.title.trim().length > 0;
        return true;
    };

    const handleNext = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = () => {
        addGoal(formData);
        onComplete?.();
        onClose();
    };

    return (
        <div className="wizard-overlay">
            <div className="wizard-modal">
                <button className="wizard-close" onClick={onClose}>
                    <X size={20} />
                </button>

                {/* Progress Steps */}
                <div className="wizard-progress">
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <div key={step.id} className={`progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                                <div className="step-circle">
                                    {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                                </div>
                                <span className="step-title">{step.title}</span>
                                {index < STEPS.length - 1 && <div className="step-line" />}
                            </div>
                        );
                    })}
                </div>

                {/* Step Content */}
                <div className="wizard-content">
                    {currentStep === 1 && (
                        <div className="step-content">
                            <h2>🎯 Mục tiêu của bạn là gì?</h2>

                            <div className="form-group">
                                <label>Tên mục tiêu *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => updateForm('title', e.target.value)}
                                    placeholder="VD: Học IELTS 7.0, Giảm 10kg..."
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label>Mô tả chi tiết</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => updateForm('description', e.target.value)}
                                    placeholder="Mô tả thêm về mục tiêu..."
                                    rows={2}
                                />
                            </div>

                            <div className="form-group highlight">
                                <label>💡 Tại sao mục tiêu này quan trọng với bạn?</label>
                                <textarea
                                    value={formData.why}
                                    onChange={(e) => updateForm('why', e.target.value)}
                                    placeholder="Điều này sẽ giúp tôi... / Tôi muốn đạt được vì..."
                                    rows={2}
                                />
                            </div>

                            <div className="form-group highlight">
                                <label>🪞 Identity Statement (Atomic Habits)</label>
                                <input
                                    type="text"
                                    value={formData.identity}
                                    onChange={(e) => updateForm('identity', e.target.value)}
                                    placeholder="Tôi là người..."
                                />
                                <small>VD: "Tôi là người tập thể dục mỗi ngày"</small>
                            </div>

                            <div className="form-group">
                                <label>Lĩnh vực</label>
                                <div className="area-grid">
                                    {Object.values(LIFE_AREAS).map(area => (
                                        <button
                                            key={area.id}
                                            type="button"
                                            className={`area-option ${formData.area === area.id ? 'selected' : ''}`}
                                            style={{ '--area-color': area.color }}
                                            onClick={() => updateForm('area', area.id)}
                                        >
                                            <span>{area.icon}</span>
                                            <span>{area.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="step-content">
                            <h2>📊 SMART Criteria</h2>
                            <p className="step-description">Làm mục tiêu cụ thể và đo lường được</p>

                            <div className="form-group">
                                <label>🎯 S - Specific (Cụ thể)</label>
                                <input
                                    type="text"
                                    value={formData.smart.specific}
                                    onChange={(e) => updateSmart('specific', e.target.value)}
                                    placeholder="Làm gì, ở đâu, với ai, khi nào?"
                                />
                            </div>

                            <div className="form-group">
                                <label>📏 M - Measurable (Đo lường được)</label>
                                <input
                                    type="text"
                                    value={formData.smart.measurable}
                                    onChange={(e) => updateSmart('measurable', e.target.value)}
                                    placeholder="Con số cụ thể: 10 cuốn sách, IELTS 7.0, 50kg..."
                                />
                            </div>

                            <div className="form-group">
                                <label>💪 A - Achievable (Khả thi): {formData.smart.achievable}/5</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={formData.smart.achievable}
                                    onChange={(e) => updateSmart('achievable', parseInt(e.target.value))}
                                />
                                <div className="range-labels">
                                    <span>Rất khó</span>
                                    <span>Thách thức</span>
                                    <span>Vừa sức</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>🔗 R - Relevant (Liên quan)</label>
                                <input
                                    type="text"
                                    value={formData.smart.relevant}
                                    onChange={(e) => updateSmart('relevant', e.target.value)}
                                    placeholder="Tại sao mục tiêu này quan trọng với cuộc sống?"
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="step-content">
                            <h2>⚡ Ưu tiên & Thời gian</h2>
                            <p className="step-description">Xác định mức độ ưu tiên và deadline</p>

                            <div className="priority-section">
                                <div className="form-group">
                                    <label>🔥 Impact (Tác động): {formData.priority.impact}/5</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={formData.priority.impact}
                                        onChange={(e) => updatePriority('impact', parseInt(e.target.value))}
                                    />
                                    <div className="range-labels">
                                        <span>Thấp</span>
                                        <span>Trung bình</span>
                                        <span>Cao</span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>💪 Effort (Công sức): {formData.priority.effort}/5</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={formData.priority.effort}
                                        onChange={(e) => updatePriority('effort', parseInt(e.target.value))}
                                    />
                                    <div className="range-labels">
                                        <span>Ít</span>
                                        <span>Vừa</span>
                                        <span>Nhiều</span>
                                    </div>
                                </div>

                                <div className="priority-result">
                                    {formData.priority.impact >= 3 && formData.priority.effort < 3 && (
                                        <span className="result quick-win">🚀 Quick Win - Làm ngay!</span>
                                    )}
                                    {formData.priority.impact >= 3 && formData.priority.effort >= 3 && (
                                        <span className="result major">🎯 Major Project - Cần kế hoạch</span>
                                    )}
                                    {formData.priority.impact < 3 && formData.priority.effort < 3 && (
                                        <span className="result fill-in">☕ Fill-in - Làm khi rảnh</span>
                                    )}
                                    {formData.priority.impact < 3 && formData.priority.effort >= 3 && (
                                        <span className="result thankless">⚠️ Cân nhắc lại</span>
                                    )}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>⏰ Timeframe</label>
                                    <select
                                        value={formData.timeframe}
                                        onChange={(e) => updateForm('timeframe', e.target.value)}
                                    >
                                        <option value="short">🚀 Ngắn hạn (&lt;1 tháng)</option>
                                        <option value="medium">📅 Trung hạn (1-6 tháng)</option>
                                        <option value="long">🎯 Dài hạn (&gt;6 tháng)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>📅 Deadline</label>
                                    <input
                                        type="date"
                                        value={formData.deadline}
                                        onChange={(e) => updateForm('deadline', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="wizard-actions">
                    {currentStep > 1 && (
                        <button className="btn btn-ghost" onClick={handleBack}>
                            <ChevronLeft size={18} /> Quay lại
                        </button>
                    )}
                    <div className="flex-spacer" />
                    {currentStep < 3 ? (
                        <button
                            className="btn btn-primary"
                            onClick={handleNext}
                            disabled={!canProceed()}
                        >
                            Tiếp theo <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            className="btn btn-success"
                            onClick={handleSubmit}
                            disabled={!canProceed()}
                        >
                            ✨ Tạo mục tiêu
                        </button>
                    )}
                </div>
            </div>

            <style>{`
        .wizard-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .wizard-modal {
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .wizard-close {
          position: absolute;
          top: var(--spacing-md);
          right: var(--spacing-md);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          z-index: 10;
        }

        .wizard-progress {
          display: flex;
          justify-content: center;
          padding: var(--spacing-xl) var(--spacing-lg) var(--spacing-md);
          border-bottom: 1px solid var(--border-color);
        }

        .progress-step {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }

        .step-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          color: var(--text-muted);
          transition: all var(--transition-fast);
        }

        .progress-step.active .step-circle {
          background: var(--primary);
          color: white;
        }

        .progress-step.completed .step-circle {
          background: var(--success);
          color: white;
        }

        .step-title {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .progress-step.active .step-title { color: var(--primary); font-weight: 500; }
        .progress-step.completed .step-title { color: var(--success); }

        .step-line {
          width: 40px;
          height: 2px;
          background: var(--border-color);
          margin: 0 var(--spacing-sm);
        }

        .progress-step.completed + .progress-step .step-line,
        .progress-step.completed .step-line { background: var(--success); }

        .wizard-content {
          padding: var(--spacing-xl);
        }

        .step-content h2 {
          text-align: center;
          margin-bottom: var(--spacing-xs);
          color: var(--text-primary);
        }

        .step-description {
          text-align: center;
          color: var(--text-muted);
          margin-bottom: var(--spacing-lg);
        }

        .form-group { margin-bottom: var(--spacing-md); }
        .form-group label { display: block; margin-bottom: var(--spacing-xs); color: var(--text-secondary); font-size: 0.9rem; }
        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          color: var(--text-primary);
        }
        .form-group small { display: block; margin-top: 4px; color: var(--text-muted); font-size: 0.75rem; }

        .form-group.highlight {
          background: var(--primary-glow);
          padding: var(--spacing-md);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .form-group.highlight label { color: var(--primary); }

        .area-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-xs);
        }

        .area-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: var(--spacing-sm);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .area-option:hover { border-color: var(--area-color); }
        .area-option.selected { 
          border-color: var(--area-color); 
          background: color-mix(in srgb, var(--area-color) 15%, transparent);
          color: var(--area-color);
        }

        .form-group input[type="range"] {
          width: 100%;
          margin: var(--spacing-xs) 0;
        }

        .range-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .priority-result {
          text-align: center;
          padding: var(--spacing-md);
          border-radius: var(--radius-lg);
          margin-top: var(--spacing-md);
        }

        .result {
          font-weight: 600;
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: var(--radius-full);
        }

        .result.quick-win { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
        .result.major { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
        .result.fill-in { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
        .result.thankless { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

        .form-row { display: flex; gap: var(--spacing-md); }
        .form-row .form-group { flex: 1; }

        .wizard-actions {
          display: flex;
          align-items: center;
          padding: var(--spacing-lg);
          border-top: 1px solid var(--border-color);
        }

        .flex-spacer { flex: 1; }

        .btn-success {
          background: var(--success);
          color: white;
        }

        @media (max-width: 600px) {
          .area-grid { grid-template-columns: repeat(2, 1fr); }
          .step-title { display: none; }
        }
      `}</style>
        </div>
    );
}
