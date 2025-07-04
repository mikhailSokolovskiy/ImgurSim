from flask import Flask, render_template, request, redirect, url_for, send_from_directory, jsonify, abort
import os
import sqlite3
from werkzeug.utils import secure_filename
import uuid  # Для генерации уникальных имен файлов

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['DATABASE'] = 'database.db'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB лимит

# Создаем папку для загрузок, если её нет
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Инициализация БД
def init_db():
    conn = sqlite3.connect(app.config['DATABASE'])
    cursor = conn.cursor()
    cursor.execute('''
                   CREATE TABLE IF NOT EXISTS images (
                                                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                         filename TEXT NOT NULL,
                                                         original_name TEXT NOT NULL,
                                                         upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                   )
                   ''')
    conn.commit()
    conn.close()

init_db()

# Главная страница (загрузка + список файлов)
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        file = request.files['file']
        custom_name = request.form.get('custom_name', '').strip()

        if file and file.filename != '':
            # Берём имя файла из формы или оригинальное имя
            original_name = custom_name if custom_name else file.filename
            ext = os.path.splitext(file.filename)[1]

            # Генерируем уникальное имя для хранения
            unique_filename = str(uuid.uuid4()) + ext
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(filepath)

            # Сохраняем в БД (original_name — имя, которое видит пользователь)
            conn = sqlite3.connect(app.config['DATABASE'])
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO images (filename, original_name) VALUES (?, ?)',
                (unique_filename, original_name)
            )
            conn.commit()
            conn.close()

            return redirect(url_for('index'))

    # Получаем список изображений из БД
    conn = sqlite3.connect(app.config['DATABASE'])
    cursor = conn.cursor()
    cursor.execute('SELECT id, filename, original_name FROM images ORDER BY upload_time DESC')
    images = cursor.fetchall()
    conn.close()

    return render_template('index.html', images=images)

# Просмотр изображения
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/delete_image', methods=['POST'])
def delete_image():
    try:
        data = request.get_json()
        image_id = data['id']
        filename = data['filename']

        # Удаление из базы данных
        conn = sqlite3.connect(app.config['DATABASE'])
        cursor = conn.cursor()
        cursor.execute('DELETE FROM images WHERE id = ?', (image_id,))
        conn.commit()
        conn.close()

        # Удаление файла
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(file_path):
            os.remove(file_path)

        return jsonify({'success': True})
    except Exception as e:
        print(f"Ошибка при удалении: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/image/<int:image_id>')
def image_detail(image_id):
    conn = sqlite3.connect(app.config['DATABASE'])
    cursor = conn.cursor()
    # Добавляем upload_time в SELECT запрос
    cursor.execute('SELECT id, filename, original_name, upload_time FROM images WHERE id = ?', (image_id,))
    image = cursor.fetchone()
    conn.close()

    if not image:
        abort(404)

    return render_template('image_detail.html', image=image)

if __name__ == '__main__':
    app.run(debug=True)