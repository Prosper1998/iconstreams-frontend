import { API_BASE_URL } from './utils.js';
import { loadContent } from './app.js';
import { watchlist, isLoggedIn } from './auth.js';
import { initVideoPlayer } from './player.js';

document.addEventListener('DOMContentLoaded', async () => {
    await loadWatchlist();
    loadContent(`${API_BASE_URL}/api/content/watchlist`, 'watchlistItems', 'My List');
    initVideoPlayer();
});

async function loadWatchlist() {
    const token = localStorage.getItem('token');
    if (!token) {
        if (isLoggedIn.value) {
            // If the user is logged in but there's no token, log them out
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            isLoggedIn.value = false;
            utils.showNotification('Session expired. Please sign in again.', 'warning');
            utils.showModal(document.getElementById('loginModal'));
        }
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/content/watchlist`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (response.ok) {
            watchlist.value = Array.isArray(result.watchlist) ? result.watchlist : [];
            localStorage.setItem('watchlist', JSON.stringify(watchlist.value));
        } else {
            console.error('Failed to load watchlist:', result.message);
            watchlist.value = [];
            localStorage.setItem('watchlist', JSON.stringify(watchlist.value));
            if (response.status === 401) {
                // Clear invalid token and prompt for login
                localStorage.removeItem('token');
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('currentUser');
                isLoggedIn.value = false;
                utils.showNotification('Session expired. Please sign in again.', 'warning');
                utils.showModal(document.getElementById('loginModal'));
            }
        }
    } catch (error) {
        console.error('Failed to load watchlist:', error);
        watchlist.value = [];
        localStorage.setItem('watchlist', JSON.stringify(watchlist.value));
    }
}