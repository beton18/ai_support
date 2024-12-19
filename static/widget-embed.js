(function() {
    // Функция для загрузки CSS
    function loadStyles() {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://ai-support-h5a0.onrender.com/style.css';
            link.onload = () => {
                console.log('Styles loaded');
                resolve();
            };
            link.onerror = (e) => reject(e);
            document.head.appendChild(link);
        });
    }

    // Функция для загрузки основного скрипта
    function loadScript() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://ai-support-h5a0.onrender.com/app.js';
            script.onload = () => {
                console.log('App script loaded');
                resolve();
            };
            script.onerror = (e) => reject(e);
            document.body.appendChild(script);
        });
    }

    // Функция добавления HTML структуры
    function addWidgetStructure() {
        const container = document.createElement('div');
        container.id = 'chat-widget-container';
        
        const template = document.createElement('template');
        template.id = 'chat-widget-template';
        template.innerHTML = `
            <div class="chat-widget">
                <div class="chat-widget-header">
                    <span class="chat-widget-title">AI Ассистент</span>
                    <button class="chat-widget-toggle">−</button>
                </div>
                <div class="chat-widget-messages"></div>
                <div class="chat-widget-input">
                    <textarea placeholder="Введите сообщение..." rows="1" class="chat-widget-textarea"></textarea>
                    <button class="chat-widget-send">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                            <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(container);
        document.body.appendChild(template);
    }

    // Инициализация
    async function init() {
        try {
            console.log('Initializing widget...');
            await loadStyles();
            addWidgetStructure();
            await loadScript();
            console.log('Widget initialization complete');
        } catch (error) {
            console.error('Error during widget initialization:', error);
        }
    }

    // Запускаем после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();