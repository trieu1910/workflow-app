import { useState } from 'react';
import { X, Smile, Frown, Meh, Heart, Lightbulb, Target, ChevronRight } from 'lucide-react';
import { useJournalStore, MOOD_LEVELS, ENTRY_TYPES } from '../stores/useJournalStore';

export default function EndDayReflection({ onClose }) {
    const { addEntry, getTodayEntry } = useJournalStore();
    const existingEntry = getTodayEntry();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        mood: existingEntry?.mood || 3,
        highlights: existingEntry?.highlights || '',
        challenges: existingEntry?.challenges || '',
        lessons: existingEntry?.lessons || '',
        gratitude: existingEntry?.gratitude || ['', '', ''],
        tomorrowFocus: existingEntry?.tomorrowFocus || '',
    });

    const totalSteps = 5;

    const handleGratitudeChange = (index, value) => {
        const newGratitude = [...formData.gratitude];
        newGratitude[index] = value;
        setFormData({ ...formData, gratitude: newGratitude });
    };

    const handleSubmit = () => {
        const entry = {
            type: ENTRY_TYPES.DAILY,
            mood: formData.mood,
            highlights: formData.highlights,
            challenges: formData.challenges,
            lessons: formData.lessons,
            gratitude: formData.gratitude.filter(g => g.trim()),
            tomorrowFocus: formData.tomorrowFocus,
        };

        addEntry(entry);
        onClose();
    };

    const canProceed = () => {
        switch (step) {
            case 1: return formData.mood > 0;
            case 2: return formData.highlights.trim().length > 0;
            case 3: return true; // Optional
            case 4: return formData.gratitude.some(g => g.trim());
            case 5: return true;
            default: return true;
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="reflection-step">
                        <div className="step-header">
                            <Smile size={28} className="step-icon" />
                            <h3>Hôm nay bạn cảm thấy thế nào?</h3>
                        </div>
                        <div className="mood-selector">
                            {MOOD_LEVELS.map((mood) => (
                                <button
                                    key={mood.value}
                                    className={`mood-btn ${formData.mood === mood.value ? 'selected' : ''}`}
                                    onClick={() => setFormData({ ...formData, mood: mood.value })}
                                >
                                    <span className="mood-emoji">{mood.emoji}</span>
                                    <span className="mood-label">{mood.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="reflection-step">
                        <div className="step-header">
                            <Heart size={28} className="step-icon success" />
                            <h3>Điều gì tốt đẹp đã xảy ra hôm nay?</h3>
                            <p className="step-hint">Những thành công, niềm vui, khoảnh khắc đáng nhớ...</p>
                        </div>
                        <textarea
                            className="reflection-textarea"
                            value={formData.highlights}
                            onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                            placeholder="Ví dụ: Hoàn thành xong dự án quan trọng, có cuộc nói chuyện tốt với đồng nghiệp..."
                            rows={4}
                            autoFocus
                        />
                    </div>
                );

            case 3:
                return (
                    <div className="reflection-step">
                        <div className="step-header">
                            <Frown size={28} className="step-icon warning" />
                            <h3>Có thử thách gì không?</h3>
                            <p className="step-hint">Khó khăn, trở ngại, điều chưa như ý... (tùy chọn)</p>
                        </div>
                        <textarea
                            className="reflection-textarea"
                            value={formData.challenges}
                            onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                            placeholder="Ví dụ: Bị phân tâm nhiều, meeting kéo dài quá..."
                            rows={4}
                            autoFocus
                        />
                        <div className="step-learn">
                            <Lightbulb size={18} />
                            <div>
                                <label>Bạn đã học được gì từ thử thách này?</label>
                                <textarea
                                    className="reflection-textarea small"
                                    value={formData.lessons}
                                    onChange={(e) => setFormData({ ...formData, lessons: e.target.value })}
                                    placeholder="Bài học rút ra..."
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="reflection-step">
                        <div className="step-header">
                            <Heart size={28} className="step-icon gratitude" />
                            <h3>3 điều bạn biết ơn hôm nay</h3>
                            <p className="step-hint">Gratitude là chìa khóa của hạnh phúc!</p>
                        </div>
                        <div className="gratitude-list">
                            {[0, 1, 2].map((index) => (
                                <div key={index} className="gratitude-item">
                                    <span className="gratitude-num">{index + 1}</span>
                                    <input
                                        type="text"
                                        value={formData.gratitude[index] || ''}
                                        onChange={(e) => handleGratitudeChange(index, e.target.value)}
                                        placeholder={`Điều biết ơn ${index + 1}...`}
                                        autoFocus={index === 0}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="reflection-step">
                        <div className="step-header">
                            <Target size={28} className="step-icon primary" />
                            <h3>Ngày mai bạn sẽ tập trung vào điều gì?</h3>
                            <p className="step-hint">Đặt ý định cho ngày mới!</p>
                        </div>
                        <textarea
                            className="reflection-textarea"
                            value={formData.tomorrowFocus}
                            onChange={(e) => setFormData({ ...formData, tomorrowFocus: e.target.value })}
                            placeholder="Ví dụ: Hoàn thành báo cáo, tập thể dục buổi sáng, đọc 30 phút..."
                            rows={3}
                            autoFocus
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="reflection-overlay">
            <div className="reflection-modal">
                <button className="close-btn" onClick={onClose}>
                    <X size={20} />
                </button>

                {/* Progress Bar */}
                <div className="reflection-progress">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${(step / totalSteps) * 100}%` }}
                        />
                    </div>
                    <span className="progress-text">Bước {step}/{totalSteps}</span>
                </div>

                {/* Step Content */}
                {renderStep()}

                {/* Navigation */}
                <div className="reflection-nav">
                    {step > 1 && (
                        <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>
                            Quay lại
                        </button>
                    )}
                    <div className="nav-spacer" />
                    {step < totalSteps ? (
                        <button
                            className="btn btn-primary"
                            onClick={() => setStep(s => s + 1)}
                            disabled={!canProceed()}
                        >
                            Tiếp tục <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button className="btn btn-success" onClick={handleSubmit}>
                            ✨ Hoàn thành phản tư
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                .reflection-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    animation: fadeIn 0.2s ease;
                }

                .reflection-modal {
                    background: var(--bg-surface);
                    border-radius: var(--radius-xl);
                    width: 90%;
                    max-width: 520px;
                    padding: var(--spacing-xl);
                    position: relative;
                    animation: slideUp 0.3s ease;
                }

                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .close-btn {
                    position: absolute;
                    top: var(--spacing-md);
                    right: var(--spacing-md);
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: var(--spacing-xs);
                    border-radius: var(--radius-md);
                }
                .close-btn:hover { background: var(--bg-secondary); color: var(--text-primary); }

                .reflection-progress {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                    margin-bottom: var(--spacing-xl);
                }

                .reflection-progress .progress-bar {
                    flex: 1;
                    height: 6px;
                    background: var(--bg-secondary);
                    border-radius: var(--radius-full);
                    overflow: hidden;
                }

                .reflection-progress .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--primary), var(--accent));
                    transition: width 0.3s ease;
                }

                .progress-text {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    white-space: nowrap;
                }

                .reflection-step {
                    min-height: 280px;
                }

                .step-header {
                    text-align: center;
                    margin-bottom: var(--spacing-lg);
                }

                .step-icon {
                    margin-bottom: var(--spacing-sm);
                    color: var(--primary);
                }
                .step-icon.success { color: var(--success); }
                .step-icon.warning { color: var(--warning); }
                .step-icon.gratitude { color: #ec4899; }
                .step-icon.primary { color: var(--primary); }

                .step-header h3 {
                    font-size: 1.25rem;
                    margin-bottom: var(--spacing-xs);
                }

                .step-hint {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }

                .mood-selector {
                    display: flex;
                    justify-content: center;
                    gap: var(--spacing-sm);
                    flex-wrap: wrap;
                }

                .mood-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: var(--spacing-xs);
                    padding: var(--spacing-md);
                    background: var(--bg-secondary);
                    border: 2px solid transparent;
                    border-radius: var(--radius-lg);
                    cursor: pointer;
                    transition: all 0.2s;
                    min-width: 70px;
                }

                .mood-btn:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                }

                .mood-btn.selected {
                    border-color: var(--primary);
                    background: var(--primary-glow);
                }

                .mood-emoji { font-size: 2rem; }
                .mood-label { font-size: 0.75rem; color: var(--text-secondary); }

                .reflection-textarea {
                    width: 100%;
                    padding: var(--spacing-md);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    font-size: 1rem;
                    resize: none;
                    transition: border-color 0.2s;
                }

                .reflection-textarea:focus {
                    outline: none;
                    border-color: var(--primary);
                }

                .reflection-textarea.small {
                    font-size: 0.9rem;
                    padding: var(--spacing-sm);
                }

                .step-learn {
                    display: flex;
                    gap: var(--spacing-sm);
                    margin-top: var(--spacing-lg);
                    padding: var(--spacing-md);
                    background: rgba(251, 191, 36, 0.1);
                    border-radius: var(--radius-lg);
                    border-left: 3px solid var(--warning);
                }

                .step-learn > svg { color: var(--warning); flex-shrink: 0; margin-top: 2px; }
                .step-learn label { display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: var(--spacing-xs); }
                .step-learn .reflection-textarea { margin-top: var(--spacing-xs); }

                .gratitude-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-sm);
                }

                .gratitude-item {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                }

                .gratitude-num {
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #ec4899, #f43f5e);
                    color: white;
                    border-radius: var(--radius-full);
                    font-weight: 600;
                    font-size: 0.85rem;
                    flex-shrink: 0;
                }

                .gratitude-item input {
                    flex: 1;
                    padding: var(--spacing-sm) var(--spacing-md);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    font-size: 0.95rem;
                }

                .gratitude-item input:focus {
                    outline: none;
                    border-color: #ec4899;
                }

                .reflection-nav {
                    display: flex;
                    align-items: center;
                    margin-top: var(--spacing-xl);
                    padding-top: var(--spacing-lg);
                    border-top: 1px solid var(--border-color);
                }

                .nav-spacer { flex: 1; }

                .btn-success {
                    background: linear-gradient(135deg, var(--success), #16a34a);
                    color: white;
                }

                .btn-success:hover {
                    box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
