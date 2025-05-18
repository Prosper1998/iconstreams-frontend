document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        document.getElementById('watchlistItems').innerHTML = '<p class="empty-message">Please sign in to view your list.</p>';
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/content/watchlist`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const watchlist = await res.json();
        if (!Array.isArray(watchlist) || !watchlist.length) {
            document.getElementById('watchlistItems').innerHTML = '<p class="empty-message">Your watchlist is empty.</p>';
            return;
        }

        renderWatchlist(watchlist);

        // Sort & Filter Events
        document.getElementById('watchlistSort').addEventListener('change', () => renderWatchlist(watchlist));
        document.getElementById('watchlistFilter').addEventListener('change', () => renderWatchlist(watchlist));
    } catch (error) {
        console.error('Failed to load watchlist:', error);
        document.getElementById('watchlistItems').innerHTML = '<p class="empty-message">Error loading watchlist.</p>';
    }
});

function renderWatchlist(items) {
    const sort = document.getElementById('watchlistSort').value;
    const filter = document.getElementById('watchlistFilter').value;

    let filtered = [...items];

    // Apply Genre Filter
    if (filter !== 'all') {
        filtered = filtered.filter(item => item.meta?.toLowerCase().includes(filter.toLowerCase()));
    }

    // Apply Sort
    if (sort === 'title-asc') filtered.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'title-desc') filtered.sort((a, b) => b.title.localeCompare(a.title));
    else if (sort === 'meta-asc') filtered.sort((a, b) => (a.meta || '').localeCompare(b.meta || ''));
    else if (sort === 'meta-desc') filtered.sort((a, b) => (b.meta || '').localeCompare(a.meta || ''));

    // Render Items
    const container = document.getElementById('watchlistItems');
    container.innerHTML = filtered.map(item => `
        <div class="content-card" data-video-src="${item.video}" data-id="${item.contentId}">
            <div class="card-image">
                <img src="${item.image || `${API_BASE_URL}/api/placeholder/400/300`}" alt="${item.title}">
                <div class="card-overlay">
                    <button class="play-btn"><i class="fas fa-play"></i></button>
                </div>
            </div>
            <div class="card-info">
                <h3>${item.title}</h3>
                <p>${item.meta}</p>
                <button class="btn danger remove-btn" data-id="${item.contentId}"><i class="fas fa-times"></i> Remove</button>
            </div>
        </div>
    `).join('');

    // Bind Remove
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const contentId = e.currentTarget.dataset.id;
            try {
                await fetch(`${API_BASE_URL}/api/content/watchlist/${contentId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const newList = items.filter(item => item.contentId !== contentId);
                utils.showNotification('Removed from watchlist', 'info');
                renderWatchlist(newList);
            } catch (err) {
                console.error('Failed to remove from watchlist:', err);
                utils.showNotification('Failed to remove from watchlist', 'error');
            }
        });
    });

    // Rebind video play buttons
    initVideoPlayer();
}
