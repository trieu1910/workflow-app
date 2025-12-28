import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, onToggle }) {
    return (
        <button
            className="theme-toggle"
            onClick={onToggle}
            title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
        >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}
