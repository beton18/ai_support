from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from openai import OpenAI
import os
import logging
from logging.handlers import RotatingFileHandler

# Создаём папку для логов
if not os.path.exists('logs'):
   os.makedirs('logs')

# Настраиваем логирование
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('chat_server')

formatter = logging.Formatter(
   '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

file_handler = RotatingFileHandler(
   filename=f'logs/chat_server.log',
   maxBytes=10485760,
   backupCount=30
)
file_handler.setFormatter(formatter)
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)

logger.addHandler(file_handler)
logger.addHandler(console_handler)

# Инициализация Flask и OpenAI
app = Flask(__name__, static_folder='static')

# Более детальная настройка CORS
CORS(app, resources={
   r"/message": {"origins": "*"},
   r"/widget-embed.js": {"origins": "*"}
})

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
ASSISTANT_ID = os.getenv("ASSISTANT_ID")

if not os.getenv("OPENAI_API_KEY"):
   logger.error("API ключ OpenAI не найден")
   raise ValueError("OPENAI_API_KEY не установлен")

if not ASSISTANT_ID:
   logger.error("ID ассистента не найден")
   raise ValueError("ASSISTANT_ID не установлен")

# Маршрут для корневой страницы
@app.route('/')
def index():
   return send_from_directory('static', 'index.html')

# Специальный маршрут для виджета
@app.route('/widget-embed.js')
def widget_embed():
   return send_from_directory('static', 'widget-embed.js', mimetype='application/javascript')

# Маршрут для статических файлов
@app.route('/<path:path>')
def static_files(path):
   return send_from_directory('static', path)

@app.route("/message", methods=["POST"])
def get_message():
   try:
       logger.info("Получен новый запрос")
       
       user_message = request.json.get("message")
       if not user_message:
           logger.warning("Получен пустой запрос")
           return jsonify({"error": "Сообщение отсутствует"}), 400

       logger.info(f"Сообщение пользователя: {user_message[:50]}...")
       
       try:
           thread = client.beta.threads.create()
           
           client.beta.threads.messages.create(
               thread_id=thread.id,
               role="user",
               content=user_message
           )
           
           run = client.beta.threads.runs.create(
               thread_id=thread.id,
               assistant_id=ASSISTANT_ID
           )
           
           while True:
               run_status = client.beta.threads.runs.retrieve(
                   thread_id=thread.id,
                   run_id=run.id
               )
               if run_status.status == 'completed':
                   break
           
           messages = client.beta.threads.messages.list(thread_id=thread.id)
           assistant_response = messages.data[0].content[0].text.value
           
           logger.info(f"Получен ответ от ассистента: {assistant_response[:50]}...")
           
       except Exception as e:
           logger.error(f"Ошибка при работе с OpenAI API: {str(e)}")
           return jsonify({"error": "Ошибка при получении ответа от AI"}), 500

       return jsonify({
           "response": assistant_response,
           "status": "success"
       })

   except Exception as e:
       logger.error(f"Необработанная ошибка: {str(e)}", exc_info=True)
       return jsonify({
           "error": "Внутренняя ошибка сервера",
           "details": str(e)
       }), 500

@app.errorhandler(404)
def not_found_error(error):
   logger.warning(f"Попытка доступа к несуществующему endpoint: {request.url}")
   return jsonify({"error": "Endpoint не найден"}), 404

@app.errorhandler(500)
def internal_error(error):
   logger.error(f"Внутренняя ошибка сервера: {str(error)}", exc_info=True)
   return jsonify({"error": "Внутренняя ошибка сервера"}), 500

if __name__ == "__main__":
   port = int(os.getenv("PORT", 10000))
   logger.info(f"Сервер запущен на порту {port}")
   app.run(host="0.0.0.0", port=port)