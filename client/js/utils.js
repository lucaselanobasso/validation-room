export function getTaskIdFromUrl() {
  const query = new URLSearchParams(window.location.search);
  return query.get('id');
}

export function formatDate(dateString) {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove('show', 'success', 'error');
  toast.classList.add(type, 'show');

  clearTimeout(showToast.timerId);
  showToast.timerId = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}
