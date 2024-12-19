class ChatWidget {
    constructor() {
        this.initialize();
    }
 
    initialize() {
        // Получаем элементы (без использования шаблона)
        this.widget = document.querySelector('.chat-widget');
        this.messagesContainer = this.widget.querySelector('.chat-widget-messages');
        this.textarea = this.widget.querySelector('.chat-widget-textarea');
        this.sendButton = this.widget.querySelector('.chat-widget-send');
        this.toggleButton = this.widget.querySelector('.chat-widget-toggle');
 
        // Добавляем обработчики событий
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.toggleButton.addEventListener('click', () => this.toggleWidget());
 
        // Автоматическое изменение высоты textarea
        this.textarea.addEventListener('input', () => {
            this.textarea.style.height = 'auto';
            this.textarea.style.height = this.textarea.scrollHeight + 'px';
        });
    }
 
    async sendMessage() {
        const message = this.textarea.value.trim();
        if (!message) return;
 
        try {
            // Показываем сообщение пользователя
            this.addMessage(message, 'user');
            
            // Очищаем поле ввода
            this.textarea.value = '';
            this.textarea.style.height = 'auto';
 
            // Показываем индикатор загрузки
            this.addMessage('...', 'assistant loading');
 
            // Отправляем запрос на сервер
            const response = await fetch('https://ai-support-h5a0.onrender.com/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ message })
            });
 
            // Удаляем индикатор загрузки
            const loadingMessage = this.messagesContainer.querySelector('.loading');
            if (loadingMessage) {
                this.messagesContainer.removeChild(loadingMessage);
            }
 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
 
            const data = await response.json();
            console.log('Получен ответ:', data); // Отладочный вывод
 
            if (data.error) {
                throw new Error(data.error);
            }
 
            // Добавляем ответ ассистента
            this.addMessage(data.response, 'assistant');
 
        } catch (error) {
            console.error('Error:', error);
            this.addMessage('Извините, произошла ошибка. Попробуйте позже.', 'assistant error');
        }
    }
 
    addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message chat-message-${type}`;
        if (type === 'assistant loading') {
            messageDiv.className += ' loading';
        }
        messageDiv.textContent = text;
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
 
    toggleWidget() {
        this.widget.classList.toggle('minimized');
        this.toggleButton.textContent = this.widget.classList.contains('minimized') ? '+' : '−';
    }
 }
 
 // Инициализация виджета после загрузки DOM
 document.addEventListener('DOMContentLoaded', () => {
    new ChatWidget();
 });