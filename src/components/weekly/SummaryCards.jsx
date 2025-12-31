import React, { memo } from 'react';
import { CheckCircle, Clock, Flame, Zap, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getLevelInfo } from '../../stores/useStatsStore';

/**
 * TrendIcon component
 */
const TrendIcon = ({ change }) => {
    if (change > 0) return <TrendingUp size={16} className="trend-up" />;
    if (change < 0) return <TrendingDown size={16} className="trend-down" />;
    return <Minus size={16} className="trend-neutral" />;
};

/**
 * SummaryCards Component - Hiển thị 4 thẻ summary thống kê
 */
const SummaryCards = memo(function SummaryCards({
    thisWeek,
    completedChange,
    focusTimeChange,
    currentStreak,
    longestStreak,
    totalXP,
    formatTime,
}) {
    const levelInfo = getLevelInfo(totalXP);

    return (
        <div className="summary-cards">
            <div className="summary-card">
                <div className="card-icon tasks">
                    <CheckCircle size={24} />
                </div>
                <div className="card-content">
                    <span className="card-value">{thisWeek.completed}</span>
                    <span className="card-label">Tasks hoàn thành</span>
                    <div className="card-change">
                        <TrendIcon change={completedChange} />
                        <span className={completedChange >= 0 ? 'positive' : 'negative'}>
                            {completedChange >= 0 ? '+' : ''}{completedChange}% so với tuần trước
                        </span>
                    </div>
                </div>
            </div>

            <div className="summary-card">
                <div className="card-icon focus">
                    <Clock size={24} />
                </div>
                <div className="card-content">
                    <span className="card-value">{formatTime(thisWeek.focusTime)}</span>
                    <span className="card-label">Thời gian Focus</span>
                    <div className="card-change">
                        <TrendIcon change={focusTimeChange} />
                        <span className={focusTimeChange >= 0 ? 'positive' : 'negative'}>
                            {focusTimeChange >= 0 ? '+' : ''}{focusTimeChange}% so với tuần trước
                        </span>
                    </div>
                </div>
            </div>

            <div className="summary-card">
                <div className="card-icon streak">
                    <Flame size={24} />
                </div>
                <div className="card-content">
                    <span className="card-value">{currentStreak}</span>
                    <span className="card-label">Ngày streak hiện tại</span>
                    <div className="card-change">
                        <Target size={14} />
                        <span>Kỷ lục: {longestStreak} ngày</span>
                    </div>
                </div>
            </div>

            <div className="summary-card">
                <div className="card-icon xp">
                    <Zap size={24} />
                </div>
                <div className="card-content">
                    <span className="card-value">Level {levelInfo.level}</span>
                    <span className="card-label">{totalXP} XP tổng cộng</span>
                    <div className="card-change">
                        <span>{levelInfo.xpNeeded} XP đến level tiếp</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default SummaryCards;
