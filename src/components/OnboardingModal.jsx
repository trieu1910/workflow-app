import { useState, useEffect } from 'react';
import { X, Inbox, Grid3X3, Calendar, Target, Repeat, Zap, ChevronRight, ChevronLeft, Rocket } from 'lucide-react';

const ONBOARDING_STEPS = [
    {
        icon: Rocket,
        title: 'Chào mừng đến WorkFlow! 🎉',
        description: 'Ứng dụng giúp bạn quản lý công việc và mục tiêu cuộc đời một cách khoa học.',
        tip: 'Hãy cùng khám phá các tính năng chính!',
    },
    {
        icon: Inbox,
        title: '📥 Capture - Thu thập',
        description: 'Mọi ý tưởng, công việc đều bắt đầu từ Inbox. Nhấn Ctrl+K để thêm nhanh.',
        tip: 'Đừng giữ mọi thứ trong đầu - ghi ra ngay!',
    },
    {
        icon: Grid3X3,
        title: '📊 Prioritize - Phân loại',
        description: 'Sử dụng Ma trận Eisenhower để phân loại: Quan trọng vs Khẩn cấp.',
        tip: 'Tập trung vào việc QUAN TRỌNG, không chỉ khẩn cấp.',
    },
    {
        icon: Calendar,
        title: '📅 Schedule - Lên lịch',
        description: 'Kéo task vào lịch để đặt thời gian cụ thể.',
        tip: 'Có kế hoạch = Có kết quả!',
    },
    {
        icon: Target,
        title: '🎯 Goals - Mục tiêu',
        description: 'Thiết lập mục tiêu lớn, chia thành cột mốc, liên kết với tasks hàng ngày.',
        tip: 'Mỗi task nên phục vụ một mục tiêu lớn hơn.',
    },
    {
        icon: Repeat,
        title: '🔄 Habits - Thói quen',
        description: 'Xây dựng thói quen tốt với check-in hàng ngày và theo dõi streak.',
        tip: 'Thói quen tạo nên con người bạn!',
    },
];

export default function OnboardingModal({ onClose }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const handleNext = () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleFinish();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFinish = () => {
        if (dontShowAgain) {
            localStorage.setItem('workflow-onboarding-done', 'true');
        }
        onClose();
    };

    const step = ONBOARDING_STEPS[currentStep];
    const StepIcon = step.icon;
    const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-modal">
                <button className="onboarding-close" onClick={handleFinish}>
                    <X size={20} />
                </button>

                <div className="onboarding-content">
                    <div className="onboarding-icon">
                        <StepIcon size={48} />
                    </div>

                    <h2 className="onboarding-title">{step.title}</h2>
                    <p className="onboarding-description">{step.description}</p>

                    <div className="onboarding-tip">
                        💡 <em>{step.tip}</em>
                    </div>
                </div>

                <div className="onboarding-progress">
                    {ONBOARDING_STEPS.map((_, index) => (
                        <div
                            key={index}
                            className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                        />
                    ))}
                </div>

                <div className="onboarding-footer">
                    <label className="dont-show-again">
                        <input
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                        />
                        Không hiện lại
                    </label>

                    <div className="onboarding-nav">
                        {currentStep > 0 && (
                            <button className="btn btn-ghost" onClick={handlePrev}>
                                <ChevronLeft size={18} />
                                Trước
                            </button>
                        )}
                        <button className="btn btn-primary" onClick={handleNext}>
                            {isLastStep ? 'Bắt đầu!' : 'Tiếp theo'}
                            {!isLastStep && <ChevronRight size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        .onboarding-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .onboarding-modal {
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          padding: var(--spacing-2xl);
          width: 90%;
          max-width: 500px;
          position: relative;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
        }

        .onboarding-close {
          position: absolute;
          top: var(--spacing-md);
          right: var(--spacing-md);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: var(--spacing-xs);
        }

        .onboarding-close:hover {
          color: var(--text-primary);
        }

        .onboarding-content {
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }

        .onboarding-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto var(--spacing-lg);
          background: linear-gradient(135deg, var(--primary), var(--accent));
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .onboarding-title {
          font-size: 1.5rem;
          margin-bottom: var(--spacing-md);
          color: var(--text-primary);
        }

        .onboarding-description {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: var(--spacing-md);
        }

        .onboarding-tip {
          background: var(--primary-glow);
          border: 1px solid var(--primary);
          border-radius: var(--radius-md);
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: 0.9rem;
          color: var(--primary);
        }

        .onboarding-progress {
          display: flex;
          justify-content: center;
          gap: var(--spacing-xs);
          margin-bottom: var(--spacing-lg);
        }

        .progress-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          transition: all var(--transition-fast);
        }

        .progress-dot.active {
          background: var(--primary);
          border-color: var(--primary);
          transform: scale(1.2);
        }

        .progress-dot.completed {
          background: var(--success);
          border-color: var(--success);
        }

        .onboarding-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dont-show-again {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: 0.85rem;
          color: var(--text-muted);
          cursor: pointer;
        }

        .dont-show-again input {
          cursor: pointer;
        }

        .onboarding-nav {
          display: flex;
          gap: var(--spacing-sm);
        }
      `}</style>
        </div>
    );
}
