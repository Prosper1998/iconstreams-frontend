let watchlist = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadWatchlist();
    initVideoPlayer();
});

async function loadWatchlist() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/content/watchlist`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (response.ok) {
            watchlist = result.watchlist;
        }
    } catch (error) {
        console.error('Error loading watchlist:', error);
    }
}

function initVideoPlayer() {
    const playButtons = document.querySelectorAll('.play-btn');
    const videoCloseBtn = document.querySelector('.close-btn');
    const videoModal = document.getElementById('videoModal');
    const watchlistBtn = videoModal?.querySelector('.video-actions .btn.primary');
    const shareBtn = videoModal?.querySelector('.video-actions .btn.secondary');

    playButtons.forEach(button => {
        button.addEventListener('click', async function (e) {
            e.preventDefault();
            const card = this.closest('.content-card');
            if (!card) return;

            if (!isLoggedIn) {
                utils.showNotification('Please sign in to watch content', 'warning');
                utils.showModal(document.getElementById('loginModal'));
                return;
            }

            const contentId = card.dataset.id;
            const videoTitle = card.querySelector('h3')?.textContent || 'Untitled';
            const meta = card.querySelector('.meta')?.textContent || '';
            const description = card.querySelector('p')?.textContent || 'No description available';
            const videoSource = card.dataset.videoSrc;

            if (!videoSource) {
                utils.showNotification('Video source not available', 'error');
                return;
            }

            const modalTitle = videoModal?.querySelector('.video-info h3');
            const modalMeta = videoModal?.querySelector('.video-info .meta');
            const modalDescription = videoModal?.querySelector('.video-info .video-description');

            if (modalTitle) modalTitle.textContent = videoTitle;
            if (modalMeta) {
                const metaParts = meta.split('•').map(part => part.trim()).filter(Boolean);
                modalMeta.innerHTML = metaParts.map((part, i) =>
                    `<span>${part}</span>${i < metaParts.length - 1 ? '<div class="meta-dot"></div>' : ''}`
                ).join('');
            }
            if (modalDescription) modalDescription.textContent = description;

            const videoElement = document.getElementById('iconPlayer');
            if (videoElement) {
                const source = videoElement.querySelector('source');
                source.src = videoSource;
                source.type = 'video/mp4';
                videoElement.load();
            }

            if (videoModal) {
                videoModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }

            try {
                await fetch(`${API_BASE_URL}/api/content/${contentId}/view`, { method: 'POST' });
            } catch (error) {
                console.error('Error incrementing view count:', error);
            }

            if (watchlistBtn) {
                updateWatchlistButton(watchlistBtn, contentId);
                watchlistBtn.onclick = () => toggleWatchlist(
                    contentId, videoTitle, meta, card.querySelector('img')?.src, watchlistBtn
                );
            }
        });
    });

    if (videoCloseBtn) {
        videoCloseBtn.addEventListener('click', () => {
            const videoElement = document.getElementById('iconPlayer');
            if (videoElement) videoElement.pause();
            if (videoModal) videoModal.style.display = 'none';
            document.body.style.overflow = '';
        });
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const title = videoModal?.querySelector('.video-info h3')?.textContent || 'ICON content';
            if (navigator.share) {
                navigator.share({
                    title,
                    text: `Check out ${title} on ICON Streaming!`,
                    url: window.location.href
                }).catch(err => console.error('Error sharing:', err));
            } else {
                navigator.clipboard.writeText(window.location.href);
                utils.showNotification('Link copied to clipboard', 'info');
            }
        });
    }
}

async function toggleWatchlist(contentId, title, meta, image, button) {
    if (!isLoggedIn) {
        utils.showModal(document.getElementById('loginModal'));
        return;
    }

    const token = localStorage.getItem('token');
    const isInWatchlist = watchlist.some(item => item.contentId === contentId);

    try {
        if (isInWatchlist) {
            const res = await fetch(`${API_BASE_URL}/api/content/watchlist/${contentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (res.ok) {
                watchlist = result.watchlist;
                updateWatchlistButton(button, contentId);
                utils.showNotification(`${title} removed from watchlist`, 'info');
            } else {
                utils.showNotification(result.message || 'Error removing from watchlist', 'error');
            }
        } else {
            const res = await fetch(`${API_BASE_URL}/api/content/watchlist`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ contentId })
            });
            const result = await res.json();
            if (res.ok) {
                watchlist = result.watchlist;
                updateWatchlistButton(button, contentId);
                utils.showNotification(`${title} added to watchlist`, 'success');
            } else {
                utils.showNotification(result.message || 'Error adding to watchlist', 'error');
            }
        }
    } catch (err) {
        console.error('Watchlist toggle error:', err);
        utils.showNotification('Error updating watchlist', 'error');
    }
}

function updateWatchlistButton(button, contentId) {
    const isInWatchlist = watchlist.some(item => item.contentId === contentId);
    button.innerHTML = isInWatchlist
        ? '<i class="fas fa-check"></i> Added to Watchlist'
        : '<i class="fas fa-plus"></i> Add to Watchlist';
}
