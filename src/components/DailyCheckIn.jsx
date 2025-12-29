import { useState, useEffect } from 'react';
import { Sun, Moon, Zap, Heart, Plus, X, Check, Sparkles } from 'lucide-react';
import { useWellbeingStore, MOOD_LEVELS, ENERGY_LEVELS } from '../stores/useWellbeingStore';

export default function DailyCheckIn({ onClose }) {
    const { getTodayCheckIn, setMood, setEnergy, addGratitude, getTodayGratitude, saveDailyCheckIn } = useWellbeingStore();

    const todayData = getTodayCheckIn();
    const [selectedMood, setSelectedMood] = useState(todayData?.mood || null);
    const [selectedEnergy, setSelectedEnergy] = useState(todayData?.energy || null);
    const [gratitudeInput, setGratitudeInput] = useState('');
    const [gratitudeList, setGratitudeList] = useState(getTodayGratitude());
    const [step, setStep] = useState(1);
    const [showCelebration, setShowCelebration] = useState(false);

    const handleMoodSelect = (level) => {
        setSelectedMood(level);
        setMood(level);
    };

    const handleEnergySelect = (level) => {
        setSelectedEnergy(level);
        setEnergy(level);
    };

    const handleAddGratitude = () => {
        if (!gratitudeInput.trim()) return;
        addGratitude(gratitudeInput.trim());
        setGratitudeList([...gratitudeList, { text: gratitudeInput.trim() }]);
        setGratitudeInput('');
    };

    const handleComplete = () => {
        setShowCelebration(true);
        setTimeout(() => {
            setShowCelebration(false);
            onClose();
        }, 2000);
    };

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return { text: 'Chào buổi sáng', icon: Sun };
        if (hour < 18) return { text: 'Chào buổi chiều', icon: Sun };
        return { text: 'Chào buổi tối', icon: Moon };
    };

    const greeting = getTimeGreeting();
    const GreetingIcon = greeting.icon;

    return (
        <div className="checkin-overlay">
            <div className="checkin-modal">
                {showCelebration ? (
                    <div className="celebration">
                        <Sparkles size={64} className="celebration-icon" />
                        <h2>Tuyệt vời! 🎉</h2>
                        <p>Bạn đã check-in hôm nay!</p>
                    </div>
                ) : (
                    <>
                        <button className="checkin-close" onClick={onClose}>
                            <X size={20} />
                        </button>

                        <div className="checkin-header">
                            <GreetingIcon size={32} className="greeting-icon" />
                            <h2>{greeting.text}!</h2>
                            <p>Hãy dành 1 phút để check-in</p>
                        </div>

                        {/* Progress dots */}
                        <div className="step-dots">
                            {[1, 2, 3].map(s => (
                                <div key={s} className={`step-dot ${step >= s ? 'active' : ''}`} />
                            ))}
                        </div>

                        {step === 1 && (
                            <div className="checkin-step">
                                <h3>Tâm trạng hôm nay?</h3>
                                <div className="mood-grid">
                                    {Object.entries(MOOD_LEVELS).map(([level, data]) => (
                                        <button
                                            key={level}
                                            className={`mood-btn ${selectedMood === Number(level) ? 'selected' : ''}`}
                                            onClick={() => handleMoodSelect(Number(level))}
                                            style={{ '--mood-color': data.color }}
                                        >
                                            <span className="mood-emoji">{data.emoji}</span>
                                            <span className="mood-label">{data.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    className="btn btn-primary next-btn"
                                    onClick={() => setStep(2)}
                                    disabled={!selectedMood}
                                >
                                    Tiếp theo
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="checkin-step">
                                <h3>Mức năng lượng?</h3>
                                <div className="energy-grid">
                                    {Object.entries(ENERGY_LEVELS).map(([level, data]) => (
                                        <button
                                            key={level}
                                            className={`energy-btn ${selectedEnergy === Number(level) ? 'selected' : ''}`}
                                            onClick={() => handleEnergySelect(Number(level))}
                                            style={{ '--energy-color': data.color }}
                                        >
                                            <div className="energy-bar">
                                                <div className="energy-fill" style={{ height: `${data.fill}%` }} />
                                            </div>
                                            <span className="energy-label">{data.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="step-nav">
                                    <button className="btn btn-ghost" onClick={() => setStep(1)}>Quay lại</button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setStep(3)}
                                        disabled={!selectedEnergy}
                                    >
                                        Tiếp theo
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="checkin-step">
                                <h3><Heart size={20} /> Biết ơn điều gì hôm nay?</h3>
                                <div className="gratitude-input-row">
                                    <input
                                        type="text"
                                        value={gratitudeInput}
                                        onChange={(e) => setGratitudeInput(e.target.value)}
                                        placeholder="Tôi biết ơn..."
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddGratitude()}
                                    />
                                    <button className="btn btn-primary" onClick={handleAddGratitude}>
                                        <Plus size={18} />
                                    </button>
                                </div>

                                {gratitudeList.length > 0 && (
                                    <div className="gratitude-list">
                                        {gratitudeList.map((item, i) => (
                                            <div key={i} className="gratitude-item">
                                                💚 {item.text}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="step-nav">
                                    <button className="btn btn-ghost" onClick={() => setStep(2)}>Quay lại</button>
                                    <button className="btn btn-primary" onClick={handleComplete}>
                                        <Check size={18} /> Hoàn tất
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`
        .checkin-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .checkin-modal {
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          padding: var(--spacing-2xl);
          width: 90%;
          max-width: 450px;
          position: relative;
        }

        .checkin-close {
          position: absolute;
          top: var(--spacing-md);
          right: var(--spacing-md);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .checkin-header {
          text-align: center;
          margin-bottom: var(--spacing-lg);
        }

        .greeting-icon {
          color: var(--primary);
          margin-bottom: var(--spacing-sm);
        }

        .checkin-header h2 {
          margin-bottom: var(--spacing-xs);
          color: var(--text-primary);
        }

        .checkin-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .step-dots {
          display: flex;
          justify-content: center;
          gap: var(--spacing-xs);
          margin-bottom: var(--spacing-xl);
        }

        .step-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--bg-secondary);
          transition: all var(--transition-fast);
        }

        .step-dot.active {
          background: var(--primary);
          transform: scale(1.2);
        }

        .checkin-step h3 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-xs);
          margin-bottom: var(--spacing-lg);
          color: var(--text-primary);
        }

        .mood-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-xl);
        }

        .mood-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-md);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          background: var(--bg-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .mood-btn:hover, .mood-btn.selected {
          border-color: var(--mood-color);
          background: color-mix(in srgb, var(--mood-color) 10%, var(--bg-surface));
        }

        .mood-emoji { font-size: 1.75rem; }
        .mood-label { font-size: 0.7rem; color: var(--text-muted); }

        .energy-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-xl);
        }

        .energy-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          background: var(--bg-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .energy-btn:hover, .energy-btn.selected {
          border-color: var(--energy-color);
        }

        .energy-bar {
          width: 24px;
          height: 40px;
          background: var(--bg-surface);
          border-radius: var(--radius-sm);
          overflow: hidden;
          display: flex;
          flex-direction: column-reverse;
        }

        .energy-fill {
          background: var(--energy-color);
          transition: height var(--transition-base);
        }

        .energy-label { font-size: 0.7rem; color: var(--text-muted); }

        .gratitude-input-row {
          display: flex;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
        }

        .gratitude-input-row input {
          flex: 1;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .gratitude-list {
          max-height: 150px;
          overflow-y: auto;
          margin-bottom: var(--spacing-lg);
        }

        .gratitude-item {
          padding: var(--spacing-sm);
          background: var(--success-glow);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-xs);
          color: var(--text-primary);
        }

        .step-nav {
          display: flex;
          justify-content: space-between;
        }

        .next-btn { width: 100%; }

        .celebration {
          text-align: center;
          padding: var(--spacing-2xl);
        }

        .celebration-icon {
          color: var(--primary);
          animation: pulse 1s infinite;
        }

        .celebration h2 {
          margin: var(--spacing-lg) 0 var(--spacing-sm);
          color: var(--text-primary);
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
        </div>
    );
}
