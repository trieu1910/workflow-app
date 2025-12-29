import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Default quotes
const DEFAULT_QUOTES = [
    { id: '1', text: "Hành trình ngàn dặm bắt đầu từ một bước chân.", author: "Lão Tử" },
    { id: '2', text: "Biết người là khôn, biết mình là sáng.", author: "Lão Tử" },
    { id: '3', text: "Nước mềm mại nhưng có thể xuyên đá.", author: "Lão Tử" },
    { id: '4', text: "Đừng cưỡng cầu, hãy để mọi thứ tự nhiên.", author: "Lão Tử" },
    { id: '5', text: "Kẻ chiến thắng người khác là mạnh, tự thắng mình mới là cường.", author: "Lão Tử" },
    { id: '6', text: "Im lặng là nguồn sức mạnh vĩ đại.", author: "Lão Tử" },
    { id: '7', text: "Tâm an, vạn sự an.", author: "Đức Phật" },
    { id: '8', text: "Giọt nước có thể xuyên đá, không phải vì sức mạnh mà vì sự kiên trì.", author: "Đức Phật" },
    { id: '9', text: "Quá khứ không truy, tương lai không đợi, an trú trong hiện tại.", author: "Đức Phật" },
    { id: '10', text: "Hạnh phúc không phải là điều có sẵn, nó đến từ hành động của bạn.", author: "Đức Phật" },
    { id: '11', text: "Người tức giận bạn không thể làm hại bạn, chính cơn giận của bạn mới hại bạn.", author: "Đức Phật" },
    { id: '12', text: "Mỗi buổi sáng là một cơ hội mới. Đừng lãng phí nó.", author: "Đức Phật" },
];

export const useQuoteStore = create(
    persist(
        (set, get) => ({
            quotes: DEFAULT_QUOTES,
            currentQuoteIndex: 0,
            lastQuoteDate: null,

            // Add new quote
            addQuote: (quote) => {
                const newQuote = {
                    id: generateId(),
                    text: quote.text,
                    author: quote.author || 'Khuyết danh',
                };
                set((state) => ({
                    quotes: [...state.quotes, newQuote],
                }));
                return newQuote;
            },

            // Update quote
            updateQuote: (id, updates) => {
                set((state) => ({
                    quotes: state.quotes.map(q =>
                        q.id === id ? { ...q, ...updates } : q
                    ),
                }));
            },

            // Delete quote
            deleteQuote: (id) => {
                set((state) => ({
                    quotes: state.quotes.filter(q => q.id !== id),
                }));
            },

            // Get today's quote
            getTodayQuote: () => {
                const state = get();
                const today = new Date().toDateString();

                if (state.lastQuoteDate === today) {
                    return state.quotes[state.currentQuoteIndex] || state.quotes[0];
                }

                // New day, pick random quote
                const randomIndex = Math.floor(Math.random() * state.quotes.length);
                set({
                    currentQuoteIndex: randomIndex,
                    lastQuoteDate: today,
                });
                return state.quotes[randomIndex] || state.quotes[0];
            },

            // Get random quote
            getRandomQuote: () => {
                const quotes = get().quotes;
                const randomIndex = Math.floor(Math.random() * quotes.length);
                set({ currentQuoteIndex: randomIndex });
                return quotes[randomIndex];
            },

            // Reset to defaults
            resetToDefaults: () => {
                set({ quotes: DEFAULT_QUOTES });
            },
        }),
        {
            name: 'workflow-quotes',
        }
    )
);
