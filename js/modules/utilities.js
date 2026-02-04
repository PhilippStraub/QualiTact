// Utility functions

export function shorten(iri) {
  return iri.replace('http://example.org/', '');
}

export function showLoading(message = 'Laden...') {
  const overlay = document.getElementById('loadingOverlay');
  const details = document.getElementById('loadingDetails');
  if (overlay && details) {
    overlay.classList.add('show');
    details.textContent = message;
    updateLoadingProgress(0);
  }
}

export function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.remove('show');
  }
}

export function updateLoadingProgress(percent, message = null) {
  const progressBar = document.getElementById('loadingProgress');
  const details = document.getElementById('loadingDetails');
  if (progressBar) {
    progressBar.style.width = percent + '%';
    progressBar.setAttribute('aria-valuenow', percent);
    progressBar.textContent = Math.round(percent) + '%';
  }
  if (message && details) {
    details.textContent = message;
  }
}
