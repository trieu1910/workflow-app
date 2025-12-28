import { Bell, BellOff, Clock, Volume2, VolumeX } from 'lucide-react';
import { useNotificationStore } from '../stores/useNotificationStore';

export default function SettingsView() {
    const {
        permission,
        enabled,
        reminderMinutes,
        soundEnabled,
        requestPermission,
        updateSettings,
    } = useNotificationStore();

    const handleToggleNotifications = async () => {
        if (!enabled) {
            const granted = await requestPermission();
            if (!granted) {
                alert('Bạn cần cho phép thông báo trong trình duyệt');
            }
        } else {
            updateSettings({ enabled: false });
        }
    };

    const reminderOptions = [5, 10, 15, 30, 60];

    return (
        <div className="settings-view">
            <div className="page-header">
                <div>
                    <h1 className="page-title">⚙️ Cài đặt</h1>
                    <p className="page-subtitle">Tùy chỉnh ứng dụng</p>
                </div>
            </div>

            {/* Notifications Section */}
            <div className="settings-section">
                <h3>🔔 Thông báo</h3>

                <div className="setting-item">
                    <div className="setting-info">
                        <span className="setting-label">Bật thông báo</span>
                        <span className="setting-description">
                            Nhận nhắc nhở trước khi task đến hạn
                        </span>
                    </div>
                    <button
                        className={`toggle-btn ${enabled ? 'active' : ''}`}
                        onClick={handleToggleNotifications}
                    >
                        {enabled ? <Bell size={18} /> : <BellOff size={18} />}
                        {enabled ? 'Bật' : 'Tắt'}
                    </button>
                </div>

                {permission === 'denied' && (
                    <div className="warning-banner">
                        ⚠️ Thông báo bị chặn. Vui lòng bật trong cài đặt trình duyệt.
                    </div>
                )}

                {enabled && (
                    <>
                        <div className="setting-item">
                            <div className="setting-info">
                                <span className="setting-label">Nhắc nhở trước</span>
                                <span className="setting-description">
                                    Thời gian trước deadline để nhắc nhở
                                </span>
                            </div>
                            <div className="reminder-options">
                                {reminderOptions.map((mins) => (
                                    <button
                                        key={mins}
                                        className={`reminder-option ${reminderMinutes === mins ? 'active' : ''}`}
                                        onClick={() => updateSettings({ reminderMinutes: mins })}
                                    >
                                        {mins < 60 ? `${mins}p` : `${mins / 60}h`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <span className="setting-label">Âm thanh</span>
                                <span className="setting-description">
                                    Phát âm thanh khi có thông báo
                                </span>
                            </div>
                            <button
                                className={`toggle-btn ${soundEnabled ? 'active' : ''}`}
                                onClick={() => updateSettings({ soundEnabled: !soundEnabled })}
                            >
                                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                                {soundEnabled ? 'Bật' : 'Tắt'}
                            </button>
                        </div>

                        <button
                            className="btn btn-ghost test-btn"
                            onClick={() => {
                                useNotificationStore.getState().sendNotification(
                                    '🔔 Thông báo test',
                                    { body: 'Thông báo hoạt động bình thường!' }
                                );
                            }}
                        >
                            <Bell size={16} />
                            Gửi thông báo test
                        </button>
                    </>
                )}
            </div>

            {/* About Section */}
            <div className="settings-section">
                <h3>ℹ️ Thông tin</h3>
                <div className="about-info">
                    <p><strong>WorkFlow</strong> - Quản lý công việc thông minh</p>
                    <p>Phiên bản: 1.0.0</p>
                    <p>Phím tắt:</p>
                    <ul>
                        <li><kbd>Ctrl</kbd> + <kbd>K</kbd> - Thêm task nhanh</li>
                    </ul>
                </div>
            </div>

            <style>{`
        .settings-view {
          max-width: 600px;
        }

        .settings-section {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
        }

        .settings-section h3 {
          margin-bottom: var(--spacing-lg);
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md) 0;
          border-bottom: 1px solid var(--border-light);
        }

        .setting-item:last-child {
          border-bottom: none;
        }

        .setting-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .setting-label {
          font-weight: 500;
          color: var(--text-primary);
        }

        .setting-description {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-xs) var(--spacing-md);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .toggle-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .reminder-options {
          display: flex;
          gap: var(--spacing-xs);
        }

        .reminder-option {
          padding: var(--spacing-xs) var(--spacing-sm);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .reminder-option.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .warning-banner {
          padding: var(--spacing-md);
          background: var(--warning-bg);
          border: 1px solid var(--warning);
          border-radius: var(--radius-md);
          color: var(--warning);
          font-size: 0.85rem;
          margin: var(--spacing-md) 0;
        }

        .test-btn {
          margin-top: var(--spacing-md);
          width: 100%;
          justify-content: center;
        }

        .about-info {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .about-info p {
          margin-bottom: var(--spacing-sm);
        }

        .about-info ul {
          margin-top: var(--spacing-sm);
          padding-left: var(--spacing-lg);
        }

        .about-info li {
          margin-bottom: var(--spacing-xs);
        }

        .about-info kbd {
          padding: 2px 6px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-family: monospace;
        }
      `}</style>
        </div>
    );
}
