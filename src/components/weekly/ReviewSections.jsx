import React, { memo } from 'react';
import { Heart, Target, MessageCircle, Plus, Check } from 'lucide-react';
import { MOOD_LEVELS } from '../../stores/useWellbeingStore';

/**
 * CompletedTasksSection Component
 */
export const CompletedTasksSection = memo(function CompletedTasksSection({ tasksThisWeek }) {
    return (
        <div className="completed-section">
            <h3>✅ Đã hoàn thành tuần này ({tasksThisWeek.length})</h3>
            {tasksThisWeek.length === 0 ? (
                <div className="empty-completed">
                    <p>Chưa có task nào hoàn thành tuần này</p>
                </div>
            ) : (
                <div className="completed-list">
                    {tasksThisWeek.slice(0, 10).map((task) => (
                        <div key={task.id} className="completed-item">
                            <span className="completed-check">✓</span>
                            <span className="completed-title">{task.title}</span>
                            <span className="completed-date">
                                {new Date(task.completedAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                    ))}
                    {tasksThisWeek.length > 10 && (
                        <div className="completed-more">
                            +{tasksThisWeek.length - 10} tasks khác
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

/**
 * WellbeingSection Component
 */
export const WellbeingSection = memo(function WellbeingSection({ avgMood, avgEnergy }) {
    if (!avgMood && !avgEnergy) return null;

    return (
        <div className="wellbeing-section">
            <h3><Heart size={18} /> Sức khỏe tinh thần tuần này</h3>
            <div className="wellbeing-stats">
                {avgMood && (
                    <div className="wellbeing-stat">
                        <span className="wellbeing-emoji">{MOOD_LEVELS[Math.round(avgMood)]?.emoji}</span>
                        <span>Tâm trạng TB: {avgMood}/5</span>
                    </div>
                )}
                {avgEnergy && (
                    <div className="wellbeing-stat">
                        <span className="wellbeing-emoji">⚡</span>
                        <span>Năng lượng TB: {avgEnergy}/5</span>
                    </div>
                )}
            </div>
        </div>
    );
});

/**
 * CommitmentsSection Component
 */
export const CommitmentsSection = memo(function CommitmentsSection({
    commitments,
    newCommitment,
    onNewCommitmentChange,
    onAddCommitment,
    onToggleCommitment,
}) {
    return (
        <div className="commitments-section">
            <h3><Target size={18} /> Cam kết tuần này</h3>
            <div className="commitment-input-row">
                <input
                    type="text"
                    value={newCommitment}
                    onChange={(e) => onNewCommitmentChange(e.target.value)}
                    placeholder="Tuần này tôi cam kết..."
                    onKeyDown={(e) => e.key === 'Enter' && onAddCommitment()}
                />
                <button className="btn btn-primary" onClick={onAddCommitment}>
                    <Plus size={18} />
                </button>
            </div>
            {commitments.length > 0 && (
                <div className="commitments-list">
                    {commitments.map(c => (
                        <div
                            key={c.id}
                            className={`commitment-item ${c.completed ? 'done' : ''}`}
                            onClick={() => onToggleCommitment(c.id)}
                        >
                            <span className="commitment-check">
                                {c.completed ? <Check size={16} /> : <div className="empty-check" />}
                            </span>
                            <span className="commitment-text">{c.text}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

/**
 * ReflectionSection Component
 */
export const ReflectionSection = memo(function ReflectionSection({
    reflection,
    onReflectionChange,
}) {
    return (
        <div className="reflection-section">
            <h3><MessageCircle size={18} /> Reflection tuần này</h3>
            <div className="reflection-prompts">
                <div className="prompt-item">
                    <label>🏆 Điều tôi tự hào nhất tuần này:</label>
                    <textarea
                        value={reflection.proud}
                        onChange={(e) => onReflectionChange('proud', e.target.value)}
                        placeholder="Tôi đã hoàn thành..."
                    />
                </div>
                <div className="prompt-item">
                    <label>💪 Thử thách lớn nhất:</label>
                    <textarea
                        value={reflection.challenge}
                        onChange={(e) => onReflectionChange('challenge', e.target.value)}
                        placeholder="Điều khó khăn nhất là..."
                    />
                </div>
                <div className="prompt-item">
                    <label>💡 Bài học rút ra:</label>
                    <textarea
                        value={reflection.lesson}
                        onChange={(e) => onReflectionChange('lesson', e.target.value)}
                        placeholder="Tôi học được rằng..."
                    />
                </div>
                <div className="prompt-item">
                    <label>🎯 Ưu tiên tuần tới:</label>
                    <textarea
                        value={reflection.nextWeek}
                        onChange={(e) => onReflectionChange('nextWeek', e.target.value)}
                        placeholder="Tuần tới tôi sẽ tập trung vào..."
                    />
                </div>
            </div>
        </div>
    );
});
