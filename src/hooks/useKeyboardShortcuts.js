import { useEffect, useCallback } from 'react';

// Keyboard shortcuts hook
export function useKeyboardShortcuts(shortcuts, deps = []) {
    const handleKeyDown = useCallback((event) => {
        // Don't trigger if typing in input/textarea
        if (
            event.target.tagName === 'INPUT' ||
            event.target.tagName === 'TEXTAREA' ||
            event.target.isContentEditable
        ) {
            return;
        }

        const key = event.key.toLowerCase();
        const ctrl = event.ctrlKey || event.metaKey;
        const shift = event.shiftKey;
        const alt = event.altKey;

        for (const shortcut of shortcuts) {
            const matches =
                shortcut.key.toLowerCase() === key &&
                (shortcut.ctrl || false) === ctrl &&
                (shortcut.shift || false) === shift &&
                (shortcut.alt || false) === alt;

            if (matches && shortcut.action) {
                event.preventDefault();
                shortcut.action();
                break;
            }
        }
    }, [shortcuts, ...deps]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

// Shortcut display helper
export function formatShortcut(shortcut) {
    const parts = [];
    if (shortcut.ctrl) parts.push('⌘');
    if (shortcut.alt) parts.push('⌥');
    if (shortcut.shift) parts.push('⇧');
    parts.push(shortcut.key.toUpperCase());
    return parts.join('');
}

// Common shortcuts config
export const SHORTCUTS_CONFIG = {
    newTask: { key: 'n', label: 'Tạo công việc mới' },
    goToday: { key: 't', label: 'Đi đến Hôm nay' },
    goInbox: { key: 'i', label: 'Đi đến Inbox' },
    goGoals: { key: 'g', label: 'Đi đến Mục tiêu' },
    goHabits: { key: 'h', label: 'Đi đến Thói quen' },
    commandPalette: { key: 'k', ctrl: true, label: 'Mở Command Palette' },
    focusMode: { key: 'f', label: 'Bắt đầu Focus Mode' },
    search: { key: '/', label: 'Tìm kiếm' },
    escape: { key: 'Escape', label: 'Đóng / Hủy' },
    help: { key: '?', shift: true, label: 'Hiển thị phím tắt' },
};
