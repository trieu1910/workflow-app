import { useState, useEffect } from 'react';
import { Award, Flame, Target, Zap, CheckCircle, Lock, Gift } from 'lucide-react';
import { useAchievementStore, ACHIEVEMENTS, DAILY_CHALLENGES } from '../stores/useAchievementStore';
import { useStatsStore, getLevelInfo } from '../stores/useStatsStore';

export default function AchievementsView() {
    const { unlockedAchievements, dailyChallenges, generateDailyChallenges, getChallengeStatus, isUnlocked } = useAchievementStore();
    const totalXP = useStatsStore((state) => state.totalXP);
    const levelInfo = getLevelInfo(totalXP);

    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        generateDailyChallenges();
    }, []);

    const challengeStatus = getChallengeStatus();

    const categories = {
        all: 'Tất cả',
        tasks: 'Tasks',
        streak: 'Streak',
        goals: 'Mục tiêu',
        habits: 'Thói quen',
        special: 'Đặc biệt',
    };

    const achievementsByCategory = {
        tasks: ['first_task', 'task_10', 'task_50', 'task_100'],
        streak: ['streak_3', 'streak_7', 'streak_30', 'streak_100'],
        goals: ['first_goal', 'goal_complete', 'all_areas'],
        habits: ['first_habit', 'habit_streak_7', 'habit_streak_30'],
        special: ['level_5', 'level_10', 'focus_1h', 'focus_3h', 'early_bird', 'night_owl'],
    };

    const filteredAchievements = selectedCategory === 'all'
        ? Object.keys(ACHIEVEMENTS)
        : achievementsByCategory[selectedCategory] || [];

    const unlockedCount = unlockedAchievements.length;
    const totalCount = Object.keys(ACHIEVEMENTS).length;

    return (
        <div className="achievements-view">
            <div className="page-header">
                <div>
                    <h1 className="page-title">🏆 Thành tựu</h1>
                    <p className="page-subtitle">{unlockedCount}/{totalCount} thành tựu đã mở khóa</p>
                </div>
            </div>

            {/* Level Card */}
            <div className="level-card">
                <div className="level-badge">
                    <span className="level-number">Lv.{levelInfo.level}</span>
                </div>
                <div className="level-info">
                    <h3>Cấp độ {levelInfo.level}</h3>
                    <div className="level-progress">
                        <div className="level-bar">
                            <div className="level-fill" style={{ width: `${levelInfo.progress * 100}%` }} />
                        </div>
                        <span className="level-xp">{levelInfo.currentXP} / {levelInfo.nextLevelXP} XP</span>
                    </div>
                </div>
            </div>

            {/* Daily Challenges */}
            <div className="section-card">
                <div className="section-header">
                    <h2><Gift size={20} /> Thử thách hôm nay</h2>
                    <span className="challenge-count">
                        {challengeStatus.filter(c => c.completed).length}/{challengeStatus.length}
                    </span>
                </div>
                <div className="challenges-list">
                    {challengeStatus.map(challenge => (
                        <div
                            key={challenge.id}
                            className={`challenge-item ${challenge.completed ? 'completed' : ''}`}
                        >
                            <div className="challenge-info">
                                {challenge.completed ? (
                                    <CheckCircle size={20} className="challenge-icon completed" />
                                ) : (
                                    <Target size={20} className="challenge-icon" />
                                )}
                                <span className="challenge-name">{challenge.name}</span>
                            </div>
                            <div className="challenge-progress">
                                <div className="challenge-bar">
                                    <div
                                        className="challenge-fill"
                                        style={{ width: `${Math.min(100, (challenge.current / challenge.target) * 100)}%` }}
                                    />
                                </div>
                                <span className="challenge-xp">+{challenge.xp} XP</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Category Filter */}
            <div className="category-filter">
                {Object.entries(categories).map(([key, label]) => (
                    <button
                        key={key}
                        className={`category-btn ${selectedCategory === key ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(key)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Achievements Grid */}
            <div className="achievements-grid">
                {filteredAchievements.map(id => {
                    const achievement = ACHIEVEMENTS[id];
                    const unlocked = isUnlocked(id);

                    return (
                        <div
                            key={id}
                            className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}
                        >
                            <div className="achievement-icon">
                                {unlocked ? achievement.icon : <Lock size={24} />}
                            </div>
                            <div className="achievement-info">
                                <h4>{unlocked ? achievement.name : '???'}</h4>
                                <p>{achievement.description}</p>
                            </div>
                            <div className="achievement-xp">
                                +{achievement.xp} XP
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
        .achievements-view { max-width: 900px; }
        
        .level-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          border-radius: var(--radius-xl);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
          color: white;
        }
        
        .level-badge {
          width: 70px;
          height: 70px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
        }
        
        .level-number { font-size: 1.5rem; font-weight: 700; }
        
        .level-info { flex: 1; }
        .level-info h3 { font-size: 1.25rem; margin-bottom: var(--spacing-sm); }
        
        .level-progress { display: flex; align-items: center; gap: var(--spacing-md); }
        
        .level-bar {
          flex: 1;
          height: 10px;
          background: rgba(255,255,255,0.3);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        
        .level-fill {
          height: 100%;
          background: white;
          border-radius: var(--radius-full);
          transition: width var(--transition-base);
        }
        
        .level-xp { font-size: 0.85rem; font-weight: 600; }
        
        .section-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }
        
        .section-header h2 {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: 1rem;
        }
        
        .challenge-count {
          font-weight: 600;
          color: var(--primary);
        }
        
        .challenges-list { display: flex; flex-direction: column; gap: var(--spacing-sm); }
        
        .challenge-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }
        
        .challenge-item.completed { opacity: 0.6; }
        
        .challenge-info { display: flex; align-items: center; gap: var(--spacing-sm); }
        .challenge-icon { color: var(--text-muted); }
        .challenge-icon.completed { color: var(--success); }
        .challenge-name { color: var(--text-primary); }
        
        .challenge-progress { display: flex; align-items: center; gap: var(--spacing-sm); }
        
        .challenge-bar {
          width: 80px;
          height: 6px;
          background: var(--bg-surface);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        
        .challenge-fill {
          height: 100%;
          background: var(--primary);
          border-radius: var(--radius-full);
        }
        
        .challenge-xp { font-size: 0.8rem; font-weight: 600; color: var(--primary); }
        
        .category-filter {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
          margin-bottom: var(--spacing-lg);
        }
        
        .category-btn {
          padding: var(--spacing-xs) var(--spacing-md);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .category-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }
        
        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: var(--spacing-md);
        }
        
        .achievement-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-md);
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          transition: all var(--transition-fast);
        }
        
        .achievement-card.unlocked {
          border-color: var(--primary);
          background: var(--primary-glow);
        }
        
        .achievement-card.locked {
          opacity: 0.5;
        }
        
        .achievement-icon {
          width: 50px;
          height: 50px;
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
        }
        
        .achievement-card.unlocked .achievement-icon {
          background: var(--primary);
          color: white;
        }
        
        .achievement-info { flex: 1; }
        .achievement-info h4 { font-size: 0.95rem; color: var(--text-primary); margin-bottom: 2px; }
        .achievement-info p { font-size: 0.8rem; color: var(--text-muted); }
        
        .achievement-xp {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--primary);
          white-space: nowrap;
        }
      `}</style>
        </div>
    );
}
