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

// Поиск
document.getElementById('search-button').addEventListener('click', () => {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const images = document.querySelectorAll('.image-card');

    images.forEach((image) => {
        const name = image.dataset.name.toLowerCase();
        if (name.includes(searchTerm)) {
            image.style.display = 'block';
        } else {
            image.style.display = 'none';
        }
    });
});