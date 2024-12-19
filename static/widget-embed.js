(function() {
    // Функция для загрузки CSS
    function loadStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://ai-support-h5a0.onrender.com/style.css';
        document.head.appendChild(link);
    }

    // Функция для загрузки основного скрипта
    function loadScript() {
        const script = document.createElement('script');
        script.src = 'https://ai-support-h5a0.onrender.com/app.js';
        document.body.appendChild(script);
    }

    // Создаем HTML разметку
    const template = `
        <div class="chat-widget">
            <div class="chat-widget-header">
                <span class="chat-widget-title">AI Ассистент</span>
                <button class="chat-widget-toggle">−</button>
            </div>
            <div class="chat-widget-messages"></div>
            <div class="chat-widget-input">
                <textarea 
                    placeholder="Введите сообщение..."
                    rows="1"
                    class="chat-widget-textarea"
                ></textarea>
                <button class="chat-widget-send">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;

    // Добавляем виджет на страницу
    const container = document.createElement('div');
    container.innerHTML = template;
    document.body.appendChild(container.firstChild);

    // Загружаем стили и скрипт
    loadStyles();
    loadScript();
})();