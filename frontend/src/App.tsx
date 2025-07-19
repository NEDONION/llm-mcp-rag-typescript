import {useState, useEffect} from 'react';
import './App.css';
import ChatLLM from './components/ChatLLM';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import AdminPage from "./pages/Admin/Admin.tsx";
import RAGAdminPage from "./pages/RAGAdminPage/RAGAdminPage.tsx";

function App() {
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    });

    useEffect(() => {
        const setTheme = (dark: boolean) => {
            document.documentElement.setAttribute(
                'data-theme',
                dark ? 'dark' : 'light'
            );
            document.body.setAttribute('data-theme', dark ? 'dark' : 'light');

            const root = document.documentElement;
            if (dark) {
                root.style.setProperty('--bg-color', '#1a1b1e');
                root.style.setProperty('--text-color', '#e9ecef');
                root.style.setProperty('--secondary-bg', '#2c2e33');
                root.style.setProperty('--border-color', '#373a40');
                root.style.setProperty('--accent-color', '#BFCAD6');
                root.style.setProperty('--hover-color', '#373a40');
                root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
                root.style.setProperty('--input-bg', '#2c2e33');
                root.style.setProperty('--secondary-text', '#a1a1aa');
                root.style.setProperty('--button-bg', '#BFCAD6');
                root.style.setProperty('--button-text', '#ffffff');
                root.style.setProperty('--button-hover', '#AAB5C1');
                root.style.setProperty('--message-bg', '#2c2e33');
            } else {
                root.style.setProperty('--bg-color', '#ffffff');
                root.style.setProperty('--text-color', '#333333');
                root.style.setProperty('--secondary-bg', '#f5f5f5');
                root.style.setProperty('--border-color', '#e0e0e0');
                root.style.setProperty('--accent-color', '#BFCAD6');
                root.style.setProperty('--hover-color', '#e6e6e6');
                root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
                root.style.setProperty('--input-bg', '#ffffff');
                root.style.setProperty('--secondary-text', '#666666');
                root.style.setProperty('--button-bg', '#BFCAD6');
                root.style.setProperty('--button-text', '#ffffff');
                root.style.setProperty('--button-hover', '#AAB5C1');
                root.style.setProperty('--message-bg', '#ffffff');
            }

            document.body.className = dark ? 'dark-theme' : 'light-theme';
            localStorage.setItem('theme', dark ? 'dark' : 'light');
        };

        setTheme(isDark);

        // 添加 MutationObserver 来监听 DOM 变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    setTheme(isDark);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        return () => observer.disconnect();
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark((prev) => !prev);
    };

    return (
        <BrowserRouter>
            <div className="app-container">
                <button
                    onClick={toggleTheme}
                    className="theme-toggle"
                    type="button"
                    aria-label="切换深浅色模式"
                >
                    {isDark ? '🌙' : '☀️'}
                </button>
                {/*@ts-ignore*/}
                <Routes>
                    {/*@ts-ignore*/}
                    <Route path="/" element={<ChatLLM/>}/>
                    {/*@ts-ignore*/}
                    <Route path="/admin" element={<AdminPage/>}/>
                    {/*@ts-ignore*/}
                    <Route path="/admin/rag" element={<RAGAdminPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
