import { useState, useRef } from 'react';
import { Download, Upload, AlertTriangle, CheckCircle, FileJson } from 'lucide-react';
import { useTaskStore } from '../stores/useTaskStore';

export default function DataManager({ onClose }) {
    const { exportData, importData, tasks } = useTaskStore();
    const [importResult, setImportResult] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingImport, setPendingImport] = useState(null);
    const fileInputRef = useRef(null);

    const handleExport = () => {
        const data = exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `workflow-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setImportResult({ success: true, message: 'Đã xuất dữ liệu thành công!' });
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            if (tasks.length > 0) {
                setPendingImport(content);
                setShowConfirm(true);
            } else {
                performImport(content);
            }
        };
        reader.readAsText(file);
    };

    const performImport = (content) => {
        const result = importData(content);
        if (result.success) {
            setImportResult({
                success: true,
                message: `Đã nhập ${result.count} tasks thành công!`
            });
        } else {
            setImportResult({
                success: false,
                message: `Lỗi: ${result.error}`
            });
        }
        setShowConfirm(false);
        setPendingImport(null);
    };

    const handleConfirmImport = () => {
        if (pendingImport) {
            performImport(pendingImport);
        }
    };

    return (
        <div className="data-manager-overlay" onClick={onClose}>
            <div className="data-manager-modal" onClick={(e) => e.stopPropagation()}>
                <div className="data-manager-header">
                    <h2><FileJson size={24} /> Quản lý dữ liệu</h2>
                </div>

                <div className="data-manager-content">
                    {/* Export Section */}
                    <div className="data-section">
                        <h3>Xuất dữ liệu</h3>
                        <p>Tải xuống tất cả tasks và thống kê của bạn dưới dạng file JSON.</p>
                        <button className="btn btn-primary" onClick={handleExport}>
                            <Download size={18} />
                            Xuất file backup
                        </button>
                        <p className="data-info">
                            Hiện có <strong>{tasks.length}</strong> tasks
                        </p>
                    </div>

                    {/* Import Section */}
                    <div className="data-section">
                        <h3>Nhập dữ liệu</h3>
                        <p>Khôi phục dữ liệu từ file backup JSON.</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        <button
                            className="btn btn-secondary"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload size={18} />
                            Chọn file để nhập
                        </button>
                    </div>

                    {/* Result Message */}
                    {importResult && (
                        <div className={`result-message ${importResult.success ? 'success' : 'error'}`}>
                            {importResult.success ? (
                                <CheckCircle size={20} />
                            ) : (
                                <AlertTriangle size={20} />
                            )}
                            <span>{importResult.message}</span>
                        </div>
                    )}

                    {/* Confirm Overwrite Dialog */}
                    {showConfirm && (
                        <div className="confirm-dialog">
                            <AlertTriangle size={24} />
                            <h4>Xác nhận ghi đè?</h4>
                            <p>
                                Bạn đang có {tasks.length} tasks. Nhập dữ liệu mới sẽ <strong>thay thế toàn bộ</strong> dữ liệu hiện tại.
                            </p>
                            <div className="confirm-actions">
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => {
                                        setShowConfirm(false);
                                        setPendingImport(null);
                                    }}
                                >
                                    Hủy
                                </button>
                                <button className="btn btn-danger" onClick={handleConfirmImport}>
                                    Ghi đè
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="data-manager-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Đóng</button>
                </div>
            </div>

            <style>{`
        .data-manager-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .data-manager-modal {
          width: 100%;
          max-width: 450px;
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          overflow: hidden;
          animation: slideUp var(--transition-base);
        }
        
        .data-manager-header {
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--border-color);
        }
        
        .data-manager-header h2 {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin: 0;
          font-size: 1.25rem;
        }
        
        .data-manager-content {
          padding: var(--spacing-lg);
        }
        
        .data-section {
          padding: var(--spacing-lg);
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          margin-bottom: var(--spacing-md);
        }
        
        .data-section h3 {
          font-size: 1rem;
          margin-bottom: var(--spacing-xs);
        }
        
        .data-section p {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: var(--spacing-md);
        }
        
        .data-info {
          margin-top: var(--spacing-sm);
          font-size: 0.8rem !important;
          margin-bottom: 0 !important;
        }
        
        .result-message {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          margin-top: var(--spacing-md);
        }
        
        .result-message.success {
          background: var(--success-bg);
          color: var(--success);
        }
        
        .result-message.error {
          background: var(--danger-bg);
          color: var(--danger);
        }
        
        .confirm-dialog {
          margin-top: var(--spacing-md);
          padding: var(--spacing-lg);
          background: var(--warning-bg);
          border: 1px solid var(--warning);
          border-radius: var(--radius-lg);
          text-align: center;
        }
        
        .confirm-dialog svg {
          color: var(--warning);
          margin-bottom: var(--spacing-sm);
        }
        
        .confirm-dialog h4 {
          color: var(--warning);
          margin-bottom: var(--spacing-xs);
        }
        
        .confirm-dialog p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-md);
        }
        
        .confirm-actions {
          display: flex;
          gap: var(--spacing-sm);
          justify-content: center;
        }
        
        .data-manager-footer {
          padding: var(--spacing-lg);
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
        </div>
    );
}
