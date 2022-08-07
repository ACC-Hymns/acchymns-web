const songView = document.getElementById('songview');
const backButton = document.getElementById('backButton');
const searchContent = document.getElementById('content');

backButton.addEventListener('click', () => {
    searchContent.classList.remove('hidden');
    songView.classList.add('hidden');
});