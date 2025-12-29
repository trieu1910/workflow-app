import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Zap, Calendar, Tag, Clock, Target, Flag, Star } from 'lucide-react';
import { parseTaskInput } from '../utils/smartParser';
import { useTaskStore } from '../stores/useTaskStore';
import { useGoalStore, LIFE_AREAS } from '../stores/useGoalStore';

export default function QuickAdd({ isOpen, onClose }) {
    const [input, setInput] = useState('');
    const [parsedPreview, setParsedPreview] = useState(null);
    const [selectedGoal, setSelectedGoal] = useState('');
    const [selectedMilestone, setSelectedMilestone] = useState('');
    const [markAsMIT, setMarkAsMIT] = useState(false);
    const inputRef = useRef(null);

    const addTask = useTaskStore((state) => state.addTask);
    const setTaskMIT = useTaskStore((state) => state.setTaskMIT);
    const { goals, milestones } = useGoalStore();

    // Active goals only
    const activeGoals = goals.filter(g => g.status === 'active');

    // Get focus goal (highest priority Quick Win)
    const focusGoal = useMemo(() => {
        return activeGoals
            .sort((a, b) => {
                const aScore = (a.priority?.impact || 3) - (a.priority?.effort || 3);
                const bScore = (b.priority?.impact || 3) - (b.priority?.effort || 3);
                return bScore - aScore;
            })[0];
    }, [activeGoals]);

    // Milestones for selected goal
    const goalMilestones = selectedGoal
        ? milestones.filter(m => m.goalId === selectedGoal && m.status === 'active')
        : [];

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
        // Auto-select focus goal when opening
        if (isOpen && focusGoal) {
            setSelectedGoal(focusGoal.id);
        }
        if (isOpen) {
            setMarkAsMIT(false);
        }
    }, [isOpen, focusGoal]);

    useEffect(() => {
        if (input.trim()) {
            const parsed = parseTaskInput(input);
            setParsedPreview(parsed);
        } else {
            setParsedPreview(null);
        }
    }, [input]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Reset milestone when goal changes
    useEffect(() => {
        setSelectedMilestone('');
    }, [selectedGoal]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const parsed = parseTaskInput(input);
        const today = new Date().toISOString().split('T')[0];

        // Auto-suggest MIT for high priority tasks
        const shouldMIT = markAsMIT || parsed.priority === 'high';

        const newTask = addTask({
            ...parsed,
            goalId: selectedGoal || null,
            milestoneId: selectedMilestone || null,
            isMIT: shouldMIT,
            mitDate: shouldMIT ? today : null,
        });

        setInput('');
        setSelectedGoal('');
        setSelectedMilestone('');
        setMarkAsMIT(false);
        setParsedPreview(null);
        onClose();
    };

    if (!isOpen) return null;

    const selectedGoalData = activeGoals.find(g => g.id === selectedGoal);
    const selectedMilestoneData = goalMilestones.find(m => m.id === selectedMilestone);

    return (
        <div className="quick-add-overlay" onClick={onClose}>
            <div className="quick-add-modal" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        type="text"
                        className="quick-add-input"
                        placeholder="Thêm việc mới... (VD: Học 10 từ vựng @english #high)"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        autoComplete="off"
                    />

                    {/* Goal & Milestone Selector */}
                    <div className="goal-selector">
                        <div className="selector-row">
                            <Target size={18} className="selector-icon" />
                            <select
                                value={selectedGoal}
                                onChange={(e) => setSelectedGoal(e.target.value)}
                                className="goal-select"
                            >
                                <option value="">🎯 Phục vụ mục tiêu nào?</option>
                                {activeGoals.map((goal) => (
                                    <option key={goal.id} value={goal.id}>
                                        {LIFE_AREAS[goal.area]?.icon} {goal.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedGoal && goalMilestones.length > 0 && (
                            <div className="selector-row">
                                <Flag size={18} className="selector-icon" />
                                <select
                                    value={selectedMilestone}
                                    onChange={(e) => setSelectedMilestone(e.target.value)}
                                    className="milestone-select"
                                >
                                    <option value="">📋 Thuộc cột mốc nào?</option>
                                    {goalMilestones.map((milestone) => (
                                        <option key={milestone.id} value={milestone.id}>
                                            {milestone.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* MIT Checkbox + Focus Goal Indicator */}
                    <div className="quick-add-extras">
                        <label className={`mit-checkbox ${markAsMIT || parsedPreview?.priority === 'high' ? 'active' : ''}`}>
                            <input
                                type="checkbox"
                                checked={markAsMIT || parsedPreview?.priority === 'high'}
                                onChange={(e) => setMarkAsMIT(e.target.checked)}
                            />
                            <Star size={16} />
                            <span>MIT hôm nay</span>
                            {parsedPreview?.priority === 'high' && !markAsMIT && (
                                <span className="auto-mit">(tự động)</span>
                            )}
                        </label>

                        {focusGoal && selectedGoal === focusGoal.id && (
                            <span className="focus-indicator">
                                🎯 Focus Goal
                            </span>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="quick-add-actions">
                        <button type="submit" className="btn btn-primary quick-add-submit">
                            Thêm việc
                        </button>
                    </div>
                </form>

                {parsedPreview && (
                    <div className="quick-add-preview">
                        <div className="preview-row">
                            <span className="preview-title">{parsedPreview.title}</span>
                        </div>
                        <div className="preview-meta">
                            {parsedPreview.priority && (
                                <span className={`priority-badge priority-${parsedPreview.priority}`}>
                                    <Zap size={12} />
                                    {parsedPreview.priority === 'high' ? 'Cao' :
                                        parsedPreview.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                                </span>
                            )}
                            {selectedGoalData && (
                                <span className="preview-tag goal-tag">
                                    <Target size={12} />
                                    {selectedGoalData.title}
                                </span>
                            )}
                            {selectedMilestoneData && (
                                <span className="preview-tag milestone-tag">
                                    <Flag size={12} />
                                    {selectedMilestoneData.title}
                                </span>
                            )}
                            {parsedPreview.dueDate && (
                                <span className="preview-tag">
                                    <Calendar size={12} />
                                    {parsedPreview.dueDate}
                                </span>
                            )}
                            {parsedPreview.estimatedMinutes && (
                                <span className="preview-tag">
                                    <Clock size={12} />
                                    {parsedPreview.estimatedMinutes} phút
                                </span>
                            )}
                            {parsedPreview.estimatedMinutes && parsedPreview.estimatedMinutes <= 2 && (
                                <span className="two-min-rule">
                                    ⚡ 2-Min Rule: Làm ngay!
                                </span>
                            )}
                            {parsedPreview.tags.map((tag) => (
                                <span key={tag} className="preview-tag">
                                    <Tag size={12} />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="quick-add-hints">
                    <p>
                        <kbd>Enter</kbd> để thêm •
                        <kbd>Esc</kbd> để đóng •
                        <kbd>#high</kbd> <kbd>#low</kbd> độ ưu tiên
                    </p>
                </div>
            </div>

            <style>{`
        .goal-selector {
          padding: var(--spacing-sm) var(--spacing-lg);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }
        
        .selector-row {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
        
        .selector-icon {
          color: var(--primary);
          flex-shrink: 0;
        }
        
        .goal-select, .milestone-select {
          flex: 1;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 0.9rem;
          cursor: pointer;
        }
        
        .goal-select:focus, .milestone-select:focus {
          outline: none;
          border-color: var(--primary);
        }
        
        .quick-add-preview {
          padding: var(--spacing-md) var(--spacing-lg);
          border-top: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }
        
        .preview-row {
          margin-bottom: var(--spacing-sm);
        }
        
        .preview-title {
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .preview-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }
        
        .preview-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        
        .preview-tag.goal-tag {
          background: var(--primary-glow);
          border-color: var(--primary);
          color: var(--primary);
        }
        
        .preview-tag.milestone-tag {
          background: var(--accent-glow);
          border-color: var(--accent);
          color: var(--accent);
        }
        
        .quick-add-actions {
          padding: var(--spacing-sm) var(--spacing-lg) var(--spacing-md);
          display: flex;
          justify-content: flex-end;
        }
        
        .quick-add-submit {
          padding: var(--spacing-sm) var(--spacing-xl);
        }

        .two-min-rule {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          animation: pulse-glow 1.5s infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.5); }
          50% { box-shadow: 0 0 15px rgba(245, 158, 11, 0.8); }
        }

        .quick-add-extras {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-sm) 0;
        }

        .mit-checkbox {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-md);
          cursor: pointer;
          color: var(--text-muted);
          transition: all var(--transition-fast);
        }

        .mit-checkbox input { display: none; }
        .mit-checkbox:hover { background: var(--bg-secondary); }
        .mit-checkbox.active { 
          color: var(--warning); 
          background: rgba(245, 158, 11, 0.1);
        }
        .auto-mit { font-size: 0.7rem; opacity: 0.7; }

        .focus-indicator {
          font-size: 0.75rem;
          color: var(--primary);
          font-weight: 500;
        }
      `}</style>
        </div>
    );
}
