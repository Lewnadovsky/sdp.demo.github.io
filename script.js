// Dark Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Sprawdź wcześniejszy wybór użytkownika
const savedTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', savedTheme);
updateToggleButton(savedTheme);

// Nasłuchiwanie kliknięcia na przycisk
themeToggle.addEventListener('click', () => {
  const currentTheme = htmlElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  htmlElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateToggleButton(newTheme);
});

function updateToggleButton(theme) {
  themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
}
