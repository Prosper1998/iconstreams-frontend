const utils = {
    showNotification(message, type) {
        console.log(`[${type}] ${message}`);
    },
    showModal(modalElement) {
        if (modalElement) modalElement.style.display = 'block';
    }
};

const elements = {
    loginModal: document.getElementById('loginModal')
};

let watchlist = [];
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

document.addEventListener('DOMContentLoaded', () => {
    initContinueWatching();
    initTrendingCards();
    initNewReleases();
    initCategoryCards();
    enableHorizontalScroll();
    loadWatchlist();
});

async function loadWatchlist() {
    if (!isLoggedIn) return;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/content/watchlist', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        watchlist = await response.json();
    } catch (error) {
        console.error('Error loading watchlist:', error);
    }
}

function setupVideoModal(videoModal, videoTitle, metaText, description) {
    if (!videoModal) return;

    const modalTitle = videoModal.querySelector('.video-info h3');
    const modalMeta = videoModal.querySelector('.video-info .meta');
    const modalDescription = videoModal.querySelector('.video-description');

    if (modalTitle) modalTitle.textContent = videoTitle;
    if (modalMeta) {
        const metaParts = metaText.split('•').map(part => part.trim()).filter(Boolean);
        modalMeta.innerHTML = metaParts.map((part, index) => 
            `<span>${part}</span>${index < metaParts.length - 1 ? '<div class="meta-dot"></div>' : ''}`
        ).join('');
    }
    if (modalDescription) modalDescription.textContent = description;

    videoModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function initContinueWatching() {
    const continueCards = document.querySelectorAll('.continue-card');

    continueCards.forEach(card => {
        const playBtn = card.querySelector('.play-btn');
        const addBtn = card.querySelector('.add-btn');

        if (playBtn) {
            playBtn.addEventListener('click', async (e) => {
                e.preventDefault();

                if (!isLoggedIn) {
                    utils.showNotification('Please sign in to continue watching', 'warning');
                    utils.showModal(elements.loginModal);
                    return;
                }

                const videoTitle = card.querySelector('h3')?.textContent || 'Untitled';
                const episodeInfo = card.querySelector('.episode-info span')?.textContent || '';
                const progress = card.querySelector('.progress')?.style.width || '0%';
                const description = `Continuing from where you left off (${progress}).`;

                const metaText = episodeInfo.includes('S') 
                    ? `TV Show • ${episodeInfo}` 
                    : `Movie • ${episodeInfo.split(' watched')[0]} watched`;

                const videoModal = document.getElementById('videoModal');
                setupVideoModal(videoModal, videoTitle, metaText, description);

                // Increment view count
                const contentId = card.dataset.id;
                await fetch(`/api/content/${contentId}/view`, { method: 'POST' });
            });
        }

        if (addBtn) {
            addBtn.addEventListener('click', async (e) => {
                e.preventDefault();

                if (!isLoggedIn) {
                    utils.showNotification('Please sign in to add to your list', 'warning');
                    utils.showModal(elements.loginModal);
                    return;
                }

                const contentId = card.dataset.id;
                const videoTitle = card.querySelector('h3')?.textContent || 'Untitled';
                const token = localStorage.getItem('token');

                if (addBtn.innerHTML.includes('Add to List')) {
                    try {
                        const response = await fetch('/api/content/watchlist', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ contentId }),
                        });
                        const result = await response.json();
                        if (response.ok) {
                            addBtn.innerHTML = '<i class="fas fa-check"></i> Added to List';
                            watchlist = result.watchlist;
                            utils.showNotification(`${videoTitle} added to your list`, 'success');
                        } else {
                            utils.showNotification(result.message, 'error');
                        }
                    } catch (error) {
                        console.error('Error adding to watchlist:', error);
                        utils.showNotification('Error adding to watchlist', 'error');
                    }
                } else {
                    try {
                        const response = await fetch(`/api/content/watchlist/${contentId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        });
                        const result = await response.json();
                        if (response.ok) {
                            addBtn.innerHTML = '<i class="fas fa-plus"></i> Add to List';
                            watchlist = result.watchlist;
                            utils.showNotification(`${videoTitle} removed from your list`, 'info');
                        } else {
                            utils.showNotification(result.message, 'error');
                        }
                    } catch (error) {
                        console.error('Error removing from watchlist:', error);
                        utils.showNotification('Error removing from watchlist', 'error');
                    }
                }
            });
        }
    });
}

function initTrendingCards() {
    const trendingCards = document.querySelectorAll('.trending-card');

    trendingCards.forEach(card => {
        const playBtn = card.querySelector('.play-btn');

        if (playBtn) {
            playBtn.addEventListener('click', async (e) => {
                e.preventDefault();

                if (!isLoggedIn) {
                    utils.showNotification('Please sign in to watch', 'warning');
                    utils.showModal(elements.loginModal);
                    return;
                }

                const videoTitle = card.querySelector('h3')?.textContent || 'Untitled';
                const metaText = card.querySelector('.meta')?.textContent || '';
                const description = card.querySelector('p')?.textContent || 'No description available';

                const videoModal = document.getElementById('videoModal');
                setupVideoModal(videoModal, videoTitle, metaText, description);

                const contentId = card.dataset.id;
                await fetch(`/api/content/${contentId}/view`, { method: 'POST' });
            });
        }
    });
}

function initNewReleases() {
    const featuredRelease = document.querySelector('.new-release-featured');
    if (featuredRelease) {
        const watchBtn = featuredRelease.querySelector('.btn.primary');
        const addBtn = featuredRelease.querySelector('.btn.secondary');

        if (watchBtn) {
            watchBtn.addEventListener('click', async (e) => {
                e.preventDefault();

                if (!isLoggedIn) {
                    utils.showNotification('Please sign in to watch', 'warning');
                    utils.showModal(elements.loginModal);
                    return;
                }

                const videoTitle = featuredRelease.querySelector('h3')?.textContent || 'Untitled';
                const metaText = featuredRelease.querySelector('.meta')?.textContent || '';
                const description = featuredRelease.querySelector('p')?.textContent || 'No description available';

                const videoModal = document.getElementById('videoModal');
                setupVideoModal(videoModal, videoTitle, metaText, description);

                const contentId = featuredRelease.dataset.id;
                if (contentId) {
                    await fetch(`/api/content/${contentId}/view`, { method: 'POST' });
                }
            });
        }

        if (addBtn) {
            addBtn.addEventListener('click', async (e) => {
                e.preventDefault();

                if (!isLoggedIn) {
                    utils.showNotification('Please sign in to add to your list', 'warning');
                    utils.showModal(elements.loginModal);
                    return;
                }

                const contentId = featuredRelease.dataset.id;
                const videoTitle = featuredRelease.querySelector('h3')?.textContent || 'Untitled';
                const token = localStorage.getItem('token');

                if (addBtn.innerHTML.includes('Add to List')) {
                    try {
                        const response = await fetch('/api/content/watchlist', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ contentId }),
                        });
                        const result = await response.json();
                        if (response.ok) {
                            addBtn.innerHTML = '<i class="fas fa-check"></i> Added to List';
                            watchlist = result.watchlist;
                            utils.showNotification(`${videoTitle} added to your list`, 'success');
                        } else {
                            utils.showNotification(result.message, 'error');
                        }
                    } catch (error) {
                        console.error('Error adding to watchlist:', error);
                        utils.showNotification('Error adding to watchlist', 'error');
                    }
                } else {
                    try {
                        const response = await fetch(`/api/content/watchlist/${contentId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        });
                        const result = await response.json();
                        if (response.ok) {
                            addBtn.innerHTML = '<i class="fas fa-plus"></i> Add to List';
                            watchlist = result.watchlist;
                            utils.showNotification(`${videoTitle} removed from your list`, 'info');
                        } else {
                            utils.showNotification(result.message, 'error');
                        }
                    } catch (error) {
                        console.error('Error removing from watchlist:', error);
                        utils.showNotification('Error removing from watchlist', 'error');
                    }
                }
            });
        }
    }

    const newReleaseCards = document.querySelectorAll('.new-release-card');

    newReleaseCards.forEach(card => {
        const playBtn = card.querySelector('.play-btn');

        if (playBtn) {
            playBtn.addEventListener('click', async (e) => {
                e.preventDefault();

                if (!isLoggedIn) {
                    utils.showNotification('Please sign in to watch', 'warning');
                    utils.showModal(elements.loginModal);
                    return;
                }

                const videoTitle = card.querySelector('h4')?.textContent || 'Untitled';
                const metaText = card.querySelector('.meta')?.textContent || '';
                const description = 'Watch this brand new release on ICON. Just added to our library!';

                const videoModal = document.getElementById('videoModal');
                setupVideoModal(videoModal, videoTitle, metaText, description);

                const contentId = card.dataset.id;
                await fetch(`/api/content/${contentId}/view`, { method: 'POST' });
            });
        }
    });
}

function initCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');

    categoryCards.forEach(card => {
        card.addEventListener('click', async (e) => {
            e.preventDefault();

            const categoryName = card.querySelector('h4')?.textContent || 'Unknown Category';
            utils.showNotification(`Exploring ${categoryName} content`, 'info');
            // Navigate to category page or filter content
        });
    });
}

function enableHorizontalScroll() {
    const sliders = document.querySelectorAll('.trending-slider, .continue-watching-slider, .content-slider');

    sliders.forEach(slider => {
        slider.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                slider.scrollLeft += e.deltaY;
            }
        }, { passive: false });
    });
}