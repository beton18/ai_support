// widget-embed.js
(function() {
    // Добавляем стили
    const styles = `
        .chat-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 1000;
            font-family: system-ui, -apple-system, sans-serif;
        }

        .chat-widget-header {
            padding: 16px;
            background: #2563eb;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .chat-widget-title {
            font-weight: bold;
        }

        .chat-widget-toggle {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0 8px;
        }

        .chat-widget-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
        }

        .chat-message {
            margin-bottom: 12px;
            max-width: 80%;
            padding: 8px 12px;
            border-radius: 12px;
            line-height: 1.4;
        }

        .chat-message-user {
            background: #e2e8f0;
            margin-left: auto;
            border-bottom-right-radius: 4px;
        }

        .chat-message-assistant {
            background: #2563eb;
            color: white;
            margin-right: auto;
            border-bottom-left-radius: 4px;
        }

        .chat-widget-input {
            padding: 16px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            gap: 8px;
        }

        .chat-widget-textarea {
            flex: 1;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px 12px;
            resize: none;
            font-family: inherit;
            font-size: 14px;
        }

        .chat-widget-send {
            background: #2563eb;
            border: none;
            border-radius: 8px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: white;
        }

        .chat-widget.minimized {
            height: auto;
        }

        .chat-widget.minimized .chat-widget-messages,
        .chat-widget.minimized .chat-widget-input {
            display: none;
        }
    `;

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

    // Добавляем стили на страницу
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Добавляем виджет на страницу
    const container = document.createElement('div');
    container.innerHTML = template;
    document.body.appendChild(container.firstChild);

    // Инициализируем функционал
    class ChatWidget {
        constructor() {
            this.initialize();
        }

        initialize() {
            this.widget = document.querySelector('.chat-widget');
            this.messagesContainer = this.widget.querySelector('.chat-widget-messages');
            this.textarea = this.widget.querySelector('.chat-widget-textarea');
            this.sendButton = this.widget.querySelector('.chat-widget-send');
            this.toggleButton = this.widget.querySelector('.chat-widget-toggle');

            this.sendButton.addEventListener('click', () => this.sendMessage());
            this.textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            this.toggleButton.addEventListener('click', () => this.toggleWidget());
            
            this.textarea.addEventListener('input', () => {
                this.textarea.style.height = 'auto';
                this.textarea.style.height = this.textarea.scrollHeight + 'px';
            });
        }

        async sendMessage() {
            const message = this.textarea.value.trim();
            if (!message) return;

            try {
                this.addMessage(message, 'user');
                this.textarea.value = '';
                this.textarea.style.height = 'auto';

                this.addMessage('...', 'assistant loading');

                const response = await fetch('https://ai-support-h5a0.onrender.com/message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message })
                });

                const loadingMessage = this.messagesContainer.querySelector('.loading');
                if (loadingMessage) {
                    this.messagesContainer.removeChild(loadingMessage);
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
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

    // Инициализируем виджет
    new ChatWidget();
})();