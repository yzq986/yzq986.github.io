class LanguageManager {
    constructor() {
        this.currentLang = this.getInitialLanguage();
        this.supportedLangs = ['zh', 'en'];
        this.translations = window.i18n || {};
        
        // 等待所有翻译文件加载完成
        window.addEventListener('DOMContentLoaded', () => {
            this.init();
        });
    }

    getInitialLanguage() {
        // 首先检查本地存储中是否有用户设置的语言
        const savedLang = localStorage.getItem('preferred_language');
        if (savedLang) {
            return savedLang;
        }

        // 获取浏览器语言
        const browserLang = navigator.language.toLowerCase();
        
        // 如果是中文（包括简体和繁体），返回zh
        if (browserLang.startsWith('zh')) {
            return 'zh';
        }
        
        // 其他语言默认使用英文
        return 'en';
    }

    init() {
        if (!this.translations || Object.keys(this.translations).length === 0) {
            console.error('翻译文件未正确加载');
            return;
        }
        this.addLanguageButton();
        this.setLanguage(this.currentLang);
        document.documentElement.lang = this.currentLang;
    }

    addLanguageButton() {
        const button = document.createElement('button');
        button.className = 'lang-switch';
        button.innerHTML = '<i class="fas fa-language"></i>';
        button.onclick = () => this.toggleLanguage();
        document.body.appendChild(button);
    }

    toggleLanguage() {
        const currentIndex = this.supportedLangs.indexOf(this.currentLang);
        const nextIndex = (currentIndex + 1) % this.supportedLangs.length;
        this.setLanguage(this.supportedLangs[nextIndex]);
    }

    setLanguage(lang) {
        if (this.currentLang === lang) return;
        
        this.currentLang = lang;
        localStorage.setItem('preferred_language', lang);
        document.documentElement.lang = lang;
        
        // 触发语言改变事件
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: lang }
        }));
        
        this.updateContent();
    }

    updateContent() {
        const t = this.translations[this.currentLang];
        if (!t) return;

        // 更新页面标题
        document.title = t.title;
        
        // 更新section标题
        document.querySelectorAll('.section-title').forEach(title => {
            const key = title.dataset.i18nKey;
            if (key && t.sections[key]) {
                title.querySelector('span').textContent = t.sections[key];
            }
        });

        // 更新按钮文本
        document.querySelector('.pdf-export')?.setAttribute('title', t.buttons.exportPDF);
        document.querySelector('.lang-switch')?.setAttribute('title', t.buttons.switchLang);
        document.querySelector('.theme-toggle')?.setAttribute('title', 
            document.documentElement.classList.contains('dark-theme') 
                ? t.buttons.theme.light 
                : t.buttons.theme.dark
        );
    }

    getTranslation(key, section = '') {
        const t = this.translations[this.currentLang];
        if (!t) return key;
        
        return section 
            ? (t[section] && t[section][key]) || key
            : t[key] || key;
    }
} 