// Drag & Drop
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        document.getElementById('file-name').textContent = e.dataTransfer.files[0].name;
    }
});

//отображение имени файла
document.getElementById('file-input').addEventListener('change', function(e) {
    const displayElement = document.getElementById('file-name-display');

    if (this.files.length > 0) {
        const file = this.files[0];
        const fileName = file.name;
        const fileSize = (file.size / 1024).toFixed(1); // Размер в KB

        displayElement.textContent = `${fileName} (${fileSize} KB)`;
        displayElement.title = fileName; // Подсказка при наведении
    } else {
        displayElement.textContent = 'Файл не выбран';
        displayElement.title = '';
    }
});

// Функция поиска
function performSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const images = document.querySelectorAll('.image-card');

    images.forEach((image) => {
        const imageName = image.getAttribute('data-name');
        if (imageName.includes(searchTerm)) {
            image.style.display = 'block';
        } else {
            image.style.display = 'none';
        }
    });
}

// Обработчики событий
document.addEventListener('DOMContentLoaded', () => {
    // По клику на кнопку
    document.getElementById('search-button').addEventListener('click', performSearch);

    // По нажатию Enter в поле ввода
    document.getElementById('search-input').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
});


// Обработка удаления изображений
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('delete-button')) {
        const imageId = e.target.getAttribute('data-id');
        const filename = e.target.getAttribute('data-filename');

        if (confirm('Вы уверены, что хотите удалить это изображение?')) {
            // Отправка запроса на сервер
            fetch('/delete_image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: imageId,
                    filename: filename
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Удаление карточки из интерфейса
                        const card = document.querySelector(`.image-card[data-id="${imageId}"]`);
                        if (card) {
                            card.style.opacity = '0';
                            setTimeout(() => card.remove(), 300);
                        }
                    } else {
                        alert('Ошибка при удалении: ' + (data.error || 'Неизвестная ошибка'));
                    }
                })
                .catch(error => {
                    console.error('Ошибка:', error);
                    alert('Произошла ошибка при удалении');
                });
        }
    }
});

// Копирование ссылки
document.getElementById('copy-link').addEventListener('click', function() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        const originalText = this.innerHTML;
        this.innerHTML = '✓ Скопировано!';
        setTimeout(() => {
            this.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Ошибка копирования: ', err);
        alert('Не удалось скопировать ссылку');
    });
});

// Обработчик удаления (как на главной странице)
// Обработчик удаления
document.querySelector('.delete-button').addEventListener('click', function() {
    const imageId = this.getAttribute('data-id');
    const filename = this.getAttribute('data-filename');

    if (confirm('Вы уверены, что хотите удалить это изображение?')) {
        fetch('/delete_image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: imageId,
                filename: filename
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Изображение удалено!');
                    window.location.href = "{{ url_for('index') }}";
                } else {
                    alert('Ошибка при удалении: ' + (data.error || 'Неизвестная ошибка'));
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                alert('Произошла ошибка при удалении');
            });
    }
});