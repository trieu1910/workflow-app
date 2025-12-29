import { X, Star, Sun, Sunrise, Bell } from 'lucide-react';
import { useNotificationStore } from '../stores/useNotificationStore';

export default function ToastContainer() {
    const { toasts, dismissToast } = useNotificationStore();

    if (toasts.length === 0) return null;

    const getIcon = (type) => {
        switch (type) {
            case 'reminder': return <Bell size={20} />;
            case 'success': return <Star size={20} />;
            case 'warning': return <Sun size={20} />;
            default: return <Sunrise size={20} />;
        }
    };

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast toast-${toast.type}`}>
                    <div className="toast-icon">{getIcon(toast.type)}</div>
                    <div className="toast-content">
                        <strong className="toast-title">{toast.title}</strong>
                        <p className="toast-message">{toast.message}</p>
                    </div>
                    <button className="toast-close" onClick={() => dismissToast(toast.id)}>
                        <X size={16} />
                    </button>
                </div>
            ))}

            <style>{`
        .toast-container {
          position: fixed;
          top: var(--spacing-lg);
          right: var(--spacing-lg);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          max-width: 360px;
        }

        .toast {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .toast-reminder { border-left: 4px solid var(--warning); }
        .toast-success { border-left: 4px solid var(--success); }
        .toast-warning { border-left: 4px solid var(--danger); }
        .toast-info { border-left: 4px solid var(--primary); }

        .toast-icon {
          padding: var(--spacing-xs);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          color: var(--text-muted);
        }

        .toast-reminder .toast-icon { color: var(--warning); background: rgba(245,158,11,0.1); }
        .toast-success .toast-icon { color: var(--success); background: rgba(34,197,94,0.1); }
        .toast-warning .toast-icon { color: var(--danger); background: rgba(239,68,68,0.1); }

        .toast-content { flex: 1; }
        .toast-title { display: block; font-size: 0.9rem; color: var(--text-primary); }
        .toast-message { font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px; }

        .toast-close {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
        }
        .toast-close:hover { color: var(--text-primary); }
      `}</style>
        </div>
    );
}
