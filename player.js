export function initVideoPlayer() {
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

            if (!isLoggedIn.value) {
                utils.showNotification('Please sign in to watch content', 'warning');
                utils.showModal(elements.loginModal);
                return;
            }

            const contentId = card.dataset.id;
            console.log('contentId:', contentId);
            if (!contentId) {
                utils.showNotification('Content ID is missing', 'error');
                console.error('Content ID is undefined for card:', card);
                return;
            }

            const videoTitle = card.querySelector('h3')?.textContent || 'Untitled';
            const meta = card.querySelector('.meta')?.textContent || '';
            const description = card.querySelector('p')?.textContent || 'No description available';
            const videoSource = card.dataset.videoSrc;
            console.log('videoSource:', videoSource); // Add this log

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
                source.type = videoSource.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4';
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
                console.log('watchlist before updateWatchlistButton:', watchlist.value);
                updateWatchlistButton(watchlistBtn, contentId);
                watchlistBtn.onclick = () => toggleWatchlist(
                    contentId, videoTitle, meta, card.querySelector('img')?.src, watchlistBtn
                );
            }
        });
    });

    // ... (rest of the function unchanged)
}