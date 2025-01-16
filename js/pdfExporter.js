class PDFExporter {
    constructor() {
        this.initExportButton();
    }

    initExportButton() {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'pdf-export';
        exportBtn.innerHTML = '<i class="fas fa-file-pdf"></i>';
        exportBtn.onclick = () => this.exportToPDF();
        document.body.appendChild(exportBtn);
    }

    async exportToPDF() {
        let printContainer = null;
        try {
            // 显示加载提示
            this.showLoading();

            // 保存当前主题
            const originalTheme = localStorage.getItem('theme');
            
            // 切换到打印主题
            window.dispatchEvent(new CustomEvent('themeChanged', {
                detail: { theme: 'print' }
            }));

            // 等待主题切换完成
            await new Promise(resolve => setTimeout(resolve, 500));

            // 创建打印专用容器
            printContainer = document.createElement('div');
            printContainer.className = 'print-container';
            printContainer.style.position = 'fixed';
            printContainer.style.top = '0';
            printContainer.style.left = '0';
            printContainer.style.width = '210mm';  // A4 宽度
            printContainer.style.minHeight = '297mm';  // A4 高度
            printContainer.style.backgroundColor = '#ffffff';
            printContainer.style.padding = '15mm';
            printContainer.style.margin = '0';
            printContainer.style.visibility = 'hidden';
            printContainer.style.overflow = 'hidden';
            printContainer.style.zIndex = '9999';

            // 获取所有section内容
            const header = document.querySelector('.header');
            const sections = document.querySelectorAll('.section');
            
            // 复制内容到打印容器
            if (header) {
                printContainer.appendChild(header.cloneNode(true));
            }
            sections.forEach(section => {
                printContainer.appendChild(section.cloneNode(true));
            });

            document.body.appendChild(printContainer);

            // 应用打印样式
            document.documentElement.classList.add('printing');

            // 等待样式应用完成
            await new Promise(resolve => setTimeout(resolve, 500));

            // 配置PDF选项
            const opt = {
                margin: 0,
                filename: window.i18n?.[document.documentElement.lang || 'zh']?.pdf?.filename || 'resume.pdf',
                image: { type: 'jpeg', quality: 1 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    scrollY: 0,
                    width: printContainer.offsetWidth,
                    height: printContainer.offsetHeight,
                    windowWidth: printContainer.offsetWidth * 2,
                    logging: true,
                    backgroundColor: '#ffffff'
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait',
                    compress: true,
                    hotfixes: ['px_scaling']
                }
            };

            // 等待图片加载
            await this.waitForImages(printContainer);

            // 临时显示容器以便捕获
            printContainer.style.visibility = 'visible';
            await new Promise(resolve => setTimeout(resolve, 100));

            try {
                // 导出PDF
                await html2pdf().set(opt).from(printContainer).save();
            } catch (pdfError) {
                console.error('PDF生成错误:', pdfError);
                throw pdfError;
            }

            // 清理
            if (printContainer && printContainer.parentNode) {
                document.body.removeChild(printContainer);
            }
            document.documentElement.classList.remove('printing');
            
            // 恢复原来的主题
            if (originalTheme) {
                window.dispatchEvent(new CustomEvent('themeChanged', {
                    detail: { theme: originalTheme }
                }));
            }

            this.hideLoading();
        } catch (error) {
            console.error('PDF导出失败:', error);
            this.hideLoading();
            this.showError();
            
            // 确保清理
            if (printContainer && printContainer.parentNode) {
                document.body.removeChild(printContainer);
            }
            document.documentElement.classList.remove('printing');
            
            // 确保恢复原主题
            if (originalTheme) {
                window.dispatchEvent(new CustomEvent('themeChanged', {
                    detail: { theme: originalTheme }
                }));
            }
        }
    }

    waitForImages(container) {
        const images = container.getElementsByTagName('img');
        const promises = Array.from(images).map(img => {
            if (img.complete) {
                return Promise.resolve();
            }
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
                // 设置超时
                setTimeout(resolve, 3000);
            });
        });
        return Promise.all(promises);
    }

    showLoading() {
        const loading = document.createElement('div');
        loading.className = 'pdf-loading';
        loading.innerHTML = `
            <div class="loading-spinner"></div>
            <p>${window.i18n?.[document.documentElement.lang || 'zh']?.pdf?.loading || '正在生成PDF...'}</p>
        `;
        document.body.appendChild(loading);
    }

    hideLoading() {
        const loading = document.querySelector('.pdf-loading');
        if (loading) {
            loading.remove();
        }
    }

    showError() {
        const lang = document.documentElement.lang || 'zh';
        const i18n = window.i18n?.[lang] || window.i18n?.zh;
        alert(i18n?.error?.exportPDF || 'PDF导出失败，请重试');
    }
} 