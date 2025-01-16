class ThemeManager {
    constructor() {
        this.themes = {
            light: {
                colors: {
                    primary: '#0056b3',
                    text: '#333',
                    background: '#f8f9fa',
                    headerBg: '#ffffff',
                    sectionBg: '#ffffff',
                    shadow: 'rgba(0,0,0,0.1)'
                }
            },
            dark: {
                colors: {
                    primary: '#4dabf7',
                    text: '#e4e4e4',
                    background: '#121212',
                    headerBg: '#1e1e1e',
                    sectionBg: '#1e1e1e',
                    shadow: 'rgba(0,0,0,0.3)'
                }
            },
            print: {
                colors: {
                    primary: '#000000',
                    text: '#000000',
                    background: '#ffffff',
                    headerBg: '#ffffff',
                    sectionBg: '#ffffff',
                    shadow: 'none'
                }
            }
        };
        
        this.currentTheme = this.getInitialTheme();
        this.initThemeToggle();
        this.initPrintStyles();
        this.applyTheme(this.currentTheme);
    }

    getInitialTheme() {
        // 首先检查本地存储中是否有用户设置的主题
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }

        // 如果没有保存的主题，根据时间判断
        const hour = new Date().getHours();
        // 早上6点到晚上6点使用浅色主题，其他时间使用深色主题
        return (hour >= 6 && hour < 18) ? 'light' : 'dark';
    }

    initThemeToggle() {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'theme-toggle';
        toggleBtn.innerHTML = `<i class="fas ${this.currentTheme === 'light' ? 'fa-moon' : 'fa-sun'}"></i>`;
        toggleBtn.onclick = () => this.toggleTheme();
        document.body.appendChild(toggleBtn);
    }

    initPrintStyles() {
        window.onbeforeprint = () => {
            this.applyTheme('print');
        };
        
        window.onafterprint = () => {
            this.applyTheme(this.currentTheme);
        };
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.currentTheme);
        this.applyTheme(this.currentTheme);
        
        const icon = document.querySelector('.theme-toggle i');
        icon.className = `fas ${this.currentTheme === 'light' ? 'fa-moon' : 'fa-sun'}`;
        
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: this.currentTheme }
        }));
    }

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;

        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}-color`, value);
        });

        // 更新loading背景色
        const loading = document.querySelector('.loading');
        if (loading) {
            loading.style.background = themeName === 'dark' 
                ? 'rgba(18, 18, 18, 0.9)' 
                : 'rgba(255, 255, 255, 0.9)';
        }

        // 更新错误消息背景色
        const errorMessage = document.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.style.background = theme.colors.sectionBg;
            errorMessage.style.color = theme.colors.text;
        }
    }
} 