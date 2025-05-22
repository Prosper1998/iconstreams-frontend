import { API_BASE_URL, utils } from './utils.js';
import { loadContent } from './app.js';
import { initVideoPlayer } from './player.js';

document.addEventListener('DOMContentLoaded', () => {
    loadContent(`${API_BASE_URL}/api/content?tags=local`, 'localContainer', 'Local Content');
    initVideoPlayer();

    const searchInputs = [document.getElementById('searchInput'), document.getElementById('mobileSearchInput')];
    searchInputs.forEach(input => {
        input?.addEventListener('input', async () => {
            const query = input.value.trim().toLowerCase();
            if (query.length < 3) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/content?tags=local`);
                const data = await res.json();
                const filtered = data.filter(item => item.title.toLowerCase().includes(query));
                const container = document.getElementById('localContainer');
                container.innerHTML = filtered.map(item => `
                    <div class="content-card" data-video-src="${item.video}" data-id="${item._id}">
                        ${item.visibility === 'premium' ? '<div class="card-badge">PREMIUM</div>' : ''}
                        <div class="card-image">
                            <img src="${item.thumbnail || `${API_BASE_URL}/api/placeholder/400/300`}" alt="${item.title}">
                            <div class="card-overlay">
                                <button class="play-btn"><i class="fas fa-play"></i></button>
                            </div>
                        </div>
                        <div class="card-info">
                            <h3>${item.title}</h3>
                            <div class="meta">
                                <span>${item.releaseYear || 'N/A'}</span>
                                <div class="meta-dot"></div>
                                <span>${item.category}</span>
                                <div class="meta-dot"></div>
                                <span>${item.duration}m</span>
                            </div>
                            <p>${item.description.slice(0, 100)}${item.description.length > 100 ? '...' : ''}</p>
                        </div>
                    </div>
                `).join('') || `<p class="empty-message">No results for "${query}" in Local Content.</p>`;
            } catch (error) {
                console.error('Search error:', error);
                utils.showNotification('Error searching content', 'error');
            }
        });
    });
});