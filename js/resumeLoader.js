class ResumeLoader {
    constructor() {
        if (!window.config) {
            throw new Error('配置文件未加载，请确保config.js在resumeLoader.js之前加载');
        }
        this.config = window.config;
        this.contentPaths = {
            basic: 'content/basic.json',
            awards: 'content/awards.json',
            experience: {
                tiktok: 'content/experience/tiktok.json',
                shopee: 'content/experience/shopee.json',
                wechat: 'content/experience/wechat.json',
                google: 'content/experience/google.json',
                bigo: 'content/experience/bigo.json',
                polyu: 'content/experience/polyu.json'
            },
            projects: 'content/projects/school.json',
            social: 'content/social.json'
        };
        this.applyTheme();
        this.currentLang = localStorage.getItem('preferred_language') || 'zh';
        
        // 监听语言改变事件
        window.addEventListener('languageChanged', (e) => {
            this.currentLang = e.detail.language;
            // 清除现有内容
            document.querySelector('#work-experience').innerHTML = '';
            document.querySelector('#education').innerHTML = '';
            document.querySelector('#awards').innerHTML = '';
            document.querySelector('#projects').innerHTML = '';
            document.querySelector('#social').innerHTML = '';
            // 重新加载内容
            this.loadAllContent();
        });
    }

    applyTheme() {
        if (!this.config || !this.config.theme) {
            console.warn('主题配置未找到，使用默认主题');
            return;
        }
        const { colors, fonts } = this.config.theme;
        const root = document.documentElement;
        
        // 应用颜色主题
        Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}-color`, value);
        });
        
        // 应用字体
        root.style.setProperty('--main-font', fonts.main);
    }

    getContentPath(path) {
        if (this.currentLang === 'zh') return path;
        return path.replace('content/', 'content/i18n/en/');
    }

    async loadJson(path) {
        try {
            const response = await fetch(this.getContentPath(path));
            if (!response.ok) {
                if (this.currentLang !== 'zh') {
                    console.warn(`找不到${path}的翻译，尝试加载中文版本`);
                    const zhResponse = await fetch(path);
                    if (zhResponse.ok) {
                        return await zhResponse.json();
                    }
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`加载 ${path} 失败:`, error);
            throw error;
        }
    }

    async loadExperiences() {
        try {
            const experiences = [];
            for (const [company, path] of Object.entries(this.contentPaths.experience)) {
                try {
                    const exp = await this.loadJson(path);
                    experiences.push(exp);
                } catch (error) {
                    console.error(`加载 ${company} 经历失败:`, error);
                    // 继续加载其他经历
                }
            }
            if (experiences.length === 0) {
                throw new Error('没有成功加载任何工作经历');
            }
            return experiences.sort((a, b) => {
                // 提取年份，支持"2024年"和"2024"两种格式
                const getYear = (period) => {
                    const match = period.match(/\d{4}/);
                    return match ? parseInt(match[0]) : 0;
                };
                const aYear = getYear(a.period);
                const bYear = getYear(b.period);
                return bYear - aYear;
            });
        } catch (error) {
            throw new Error(`加载工作经历失败: ${error.message}`);
        }
    }

    showLoading() {
        const loading = document.createElement('div');
        loading.className = 'loading';
        const loadingText = this.currentLang === 'zh' 
            ? '正在加载简历内容...' 
            : 'Loading resume content...';
        loading.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">${loadingText}</div>
        `;
        document.body.appendChild(loading);
    }

    hideLoading() {
        const loading = document.querySelector('.loading');
        if (loading) {
            loading.remove();
        }
    }

    showError(error) {
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        const errorTitle = this.currentLang === 'zh' ? '加载失败' : 'Loading Failed';
        const retryText = this.currentLang === 'zh' ? '重试' : 'Retry';
        const errorPrefix = this.currentLang === 'zh' 
            ? '加载简历内容时出错：' 
            : 'Error loading resume content: ';
        errorEl.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <p>${errorPrefix}${error.message}</p>
            <button onclick="location.reload()">${retryText}</button>
        `;
        document.body.appendChild(errorEl);
    }

    async loadAllContent() {
        try {
            this.showLoading();
            // 加载基本信息
            const basic = await this.loadJson(this.contentPaths.basic);
            this.renderBasicInfo(basic);

            // 加载工作经验
            const experiences = await this.loadExperiences();
            this.renderExperiences(experiences);

            // 加载获奖经历
            const awards = await this.loadJson(this.contentPaths.awards);
            this.renderAwards(awards);

            // 加载项目经历
            const projects = await this.loadJson(this.contentPaths.projects);
            this.renderProjects(projects);

            // 加载社会活动
            const social = await this.loadJson(this.contentPaths.social);
            this.renderSocial(social);
        } catch (error) {
            console.error('Error loading resume content:', error);
            this.showError(error);
        } finally {
            this.hideLoading();
        }
    }

    renderBasicInfo(data) {
        try {
            document.querySelector('.header h1').textContent = data.basicInfo.name;
            const contactInfo = document.querySelector('.contact-info');
            
            // 渲染联系方式
            const contacts = data.basicInfo.contacts;
            contactInfo.innerHTML = Object.entries(contacts).map(([type, items]) => `
                <div class="contact-group ${type}-group">
                    ${items.map(contact => `
                        <div class="contact-item">
                            <i class="fas ${contact.icon} icon"></i>
                            ${type === 'email' 
                                ? `<a href="mailto:${contact.value}">${contact.value}</a>`
                                : contact.value}
                        </div>
                    `).join('')}
                </div>
            `).join('');

            document.querySelector('#education').innerHTML = `
                <div class="experience-item">
                    <div class="experience-header">
                        <span class="company">${data.education.university}</span>
                        <span class="date">${data.education.period}</span>
                    </div>
                    <div class="role">${data.education.degree} | GPA: ${data.education.gpa}</div>
                </div>
            `;
        } catch (error) {
            throw new Error(`渲染基本信息失败: ${error.message}`);
        }
    }

    renderExperiences(experiences) {
        const workExp = document.querySelector('#work-experience');
        workExp.innerHTML = experiences.map(exp => this.renderExperienceItem(exp)).join('');
    }

    renderExperienceItem(exp) {
        const sanitizedCompany = this.sanitizeHTML(exp.company);
        const sanitizedRole = this.sanitizeHTML(exp.role);
        const sanitizedDesc = this.sanitizeHTML(exp.description);

        return `
            <div class="experience-item">
                <div class="experience-header">
                    <span class="company">${sanitizedCompany}</span>
                    <span class="date">${this.formatDate(exp.period)}</span>
                </div>
                <div class="role">${sanitizedRole}</div>
                <div class="description">${sanitizedDesc}</div>
                <ul class="project-list">
                    ${exp.projects.map(project => this.renderProjectItem(project)).join('')}
                </ul>
            </div>
        `;
    }

    renderProjectItem(project) {
        const sanitizedName = this.sanitizeHTML(project.name);
        return `
            <li class="project-item">
                <h4>${sanitizedName}</h4>
                ${project.details.map(detail => this.renderDetailItem(detail)).join('')}
            </li>
        `;
    }

    renderDetailItem(detail) {
        const sanitizedContent = this.sanitizeHTML(detail.content);
        const icon = this.getDetailIcon(detail.type);
        return `
            <p><i class="fas ${icon}"></i> ${sanitizedContent}</p>
        `;
    }

    getDetailIcon(type) {
        const icons = {
            engineering: 'fa-cogs',
            algorithm: 'fa-brain',
            result: 'fa-chart-line',
            optimization: 'fa-tachometer-alt',
            architecture: 'fa-sitemap',
            database: 'fa-database',
            deployment: 'fa-rocket',
            monitoring: 'fa-heartbeat',
            performance: 'fa-bolt',
            teaching: 'fa-chalkboard-teacher',
            competition: 'fa-trophy',
            organization: 'fa-users',
            default: 'fa-info-circle'
        };
        return icons[type] || icons.default;
    }

    renderAwards(data) {
        const awards = document.querySelector('#awards');
        awards.innerHTML = data.awards.map(award => `
            <div class="achievement-item">
                <div class="achievement-header">
                    <div class="award-title-wrapper">
                        <i class="fas ${this.getDetailIcon(award.type)}"></i>
                        <span class="award-title">${award.title}</span>
                    </div>
                    <span class="date">${award.date}</span>
                </div>
                <div class="award-desc">${award.description}</div>
            </div>
        `).join('');
    }

    renderProjects(data) {
        const projects = document.querySelector('#projects');
        projects.innerHTML = `
            <div class="project-section">
                <h3>${data.category}</h3>
                ${data.items.map(project => `
                    <div class="project-item">
                        <h4>${project.name}</h4>
                        ${project.details.map(detail => `
                            <p><i class="fas ${detail.icon}"></i> ${detail.content}</p>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderSocial(data) {
        const social = document.querySelector('#social');
        social.innerHTML = data.activities.map(activity => `
            <div class="experience-item">
                <div class="experience-header">
                    <span class="company">${activity.organization}</span>
                    <span class="date">${activity.period}</span>
                </div>
                <div class="role">${activity.role}</div>
                <div class="description">${activity.description}</div>
                <ul class="project-list">
                    ${activity.details.map(detail => `
                        <p><i class="fas ${detail.icon}"></i> ${detail.content}</p>
                    `).join('')}
                </ul>
            </div>
        `).join('');
    }

    getIcon(type) {
        return this.config.icons[type] || 'fa-circle';  // 默认图标
    }

    formatDate(date) {
        return date;  // 可以根据需要添加日期格式化逻辑
    }

    sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
} 