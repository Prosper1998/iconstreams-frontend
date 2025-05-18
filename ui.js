async function showWatchlistModal() {
    if (!isLoggedIn) {
        utils.showModal(elements.loginModal);
        return;
    }

    if (!elements.watchlistModal) {
        createWatchlistModal();
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/content/watchlist`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        watchlist = await response.json();
    } catch (error) {
        console.error('Error loading watchlist:', error);
        watchlist = [];
    }

    elements.authBackground.style.display = 'block';
    elements.watchlistModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    updateWatchlistDisplay();
}

function createWatchlistModal() {
    const modal = document.createElement('div');
    modal.id = 'watchlistModal';
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="auth-modal-content watchlist-modal-content">
            <button class="auth-close-btn" aria-label="Close dialog"><i class="fas fa-times"></i></button>
            <div class="auth-header">
                <h2 id="watchlistModalTitle">My List</h2>
            </div>
            <div class="watchlist-controls">
                <div class="filter-group">
                    <label for="watchlistSort">Sort by:</label>
                    <select id="watchlistSort">
                        <option value="title-asc">Title (A-Z)</option>
                        <option value="title-desc">Title (Z-A)</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="watchlistFilter">Filter by genre:</label>
                    <select id="watchlistFilter">
                        <option value="all">All Genres</option>
                        <option value="Drama">Drama</option>
                        <option value="Thriller">Thriller</option>
                        <option value="Adventure">Adventure</option>
                        <option value="Documentary">Documentary</option>
                        <option value="Comedy">Comedy</option>
                    </select>
                </div>
            </div>
            <div class="watchlist-content">
                <div id="watchlistItems" class="watchlist-items"></div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    elements.watchlistModal = modal;

    const closeBtn = modal.querySelector('.auth-close-btn');
    closeBtn.addEventListener('click', utils.hideModals);

    const sortSelect = document.getElementById('watchlistSort');
    const filterSelect = document.getElementById('watchlistFilter');

    sortSelect.addEventListener('change', updateWatchlistDisplay);
    filterSelect.addEventListener('change', updateWatchlistDisplay);
}

function updateWatchlistDisplay() {
    const watchlistItemsContainer = document.getElementById('watchlistItems');
    const sortSelect = document.getElementById('watchlistSort');
    const filterSelect = document.getElementById('watchlistFilter');
    if (!watchlistItemsContainer) return;

    let filteredList = [...watchlist];

    const selectedGenre = filterSelect.value;
    if (selectedGenre !== 'all') {
        filteredList = filteredList.filter(item => item.meta.toLowerCase().includes(selectedGenre.toLowerCase()));
    }

    const sortOption = sortSelect.value;
    filteredList.sort((a, b) => {
        if (sortOption === 'title-asc') {
            return a.title.localeCompare(b.title);
        } else if (sortOption === 'title-desc') {
            return b.title.localeCompare(a.title);
        }
        return 0;
    });

    if (filteredList.length === 0) {
        watchlistItemsContainer.innerHTML = `
            <p class="empty-message">${
                selectedGenre === 'all' ? 
                'Your watchlist is empty. Add some content to get started!' : 
                'No items match this genre.'
            }</p>
        `;
        return;
    }

    watchlistItemsContainer.innerHTML = filteredList.map(item => `
        <div class="watchlist-item" data-id="${item.contentId}">
            <img src="${item.image || '/api/placeholder/100/60'}" alt="${item.title}">
            <div class="watchlist-item-info">
                <h4>${item.title}</h4>
                <p>${item.meta}</p>
            </div>
            <button class="btn secondary remove-watchlist-btn" data-id="${item.contentId}">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
    `).join('');

    document.querySelectorAll('.remove-watchlist-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const contentId = this.getAttribute('data-id');
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${API_BASE_URL}/api/content/watchlist/${contentId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (response.ok) {
                    watchlist = result.watchlist;
                    updateWatchlistDisplay();
                    utils.showNotification('Removed from watchlist', 'info');
                } else {
                    utils.showNotification(result.message || 'Error removing from watchlist', 'error');
                }
            } catch (error) {
                console.error('Error removing from watchlist:', error);
                utils.showNotification('Error removing from watchlist', 'error');
            }
        });
    });

    document.querySelectorAll('.watchlist-item').forEach(item => {
        item.addEventListener('click', async function(e) {
            if (e.target.closest('.remove-watchlist-btn')) return;
            const contentId = this.getAttribute('data-id');
            try {
                const response = await fetch(`${API_BASE_URL}/api/content`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const allContent = await response.json();
                const content = allContent.find(item => item._id === contentId);
                if (!content) {
                    utils.showNotification('Content not found', 'error');
                    return;
                }
                const videoModal = document.getElementById('videoModal');
                const modalTitle = videoModal.querySelector('.video-info h3');
                const modalMeta = videoModal.querySelector('.video-info .meta');
                const modalDescription = videoModal.querySelector('.video-info .video-description');
                const watchlistBtn = videoModal.querySelector('.video-actions .btn.primary');

                modalTitle.textContent = content.title;
                modalMeta.innerHTML = `
                    <span>${content.releaseYear || 'N/A'}</span>
                    <div class="meta-dot"></div>
                    <span>${content.category}</span>
                    <div class="meta-dot"></div>
                    <span>${content.duration}m</span>
                `;
                modalDescription.textContent = content.description;

                const videoElement = document.getElementById('iconPlayer');
                videoElement.querySelector('source').src = content.video;
                videoElement.querySelector('source').type = 'video/mp4';
                videoElement.load();

                videoModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';

                updateWatchlistButton(watchlistBtn, contentId);
                watchlistBtn.onclick = () => toggleWatchlist(contentId, content.title, `${content.releaseYear} • ${content.category} • ${content.duration}m`, content.thumbnail, watchlistBtn);

                await fetch(`${API_BASE_URL}/api/content/${contentId}/view`, { method: 'POST' });
            } catch (error) {
                console.error('Error loading content:', error);
                utils.showNotification('Error loading content', 'error');
            }
        });
    });
}

async function showSettingsModal() {
    if (!isLoggedIn) {
        utils.showModal(elements.loginModal);
        return;
    }

    if (!elements.settingsModal) {
        createSettingsModal();
    }

    elements.authBackground.style.display = 'block';
    elements.settingsModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function createSettingsModal() {
    const modal = document.createElement('div');
    modal.id = 'settingsModal';
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="auth-modal-content settings-modal-content">
            <button class="auth-close-btn" aria-label="Close dialog"><i class="fas fa-times"></i></button>
            <div class="auth-header">
                <h2 id="settingsModalTitle">Settings</h2>
            </div>
            <div class="settings-content">
                <div class="settings-section">
                    <h3>Account Settings</h3>
                    <div class="settings-item">
                        <label for="userEmail">Email</label>
                        <input type="email" id="userEmail" value="${currentUser.email}" readonly>
                    </div>
                    <div class="settings-item">
                        <label for="userName">Name</label>
                        <input type="text" id="userName" value="${currentUser.name}">
                    </div>
                    <div class="settings-item">
                        <label for="newPassword">New Password</label>
                        <input type="password" id="newPassword" placeholder="Enter new password">
                        <span class="error-message" id="newPasswordError"></span>
                    </div>
                    <div class="settings-item">
                        <label for="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" placeholder="Confirm new password">
                        <span class="error-message" id="confirmPasswordError"></span>
                    </div>
                </div>
                <div class="settings-actions">
                    <button class="btn primary save-settings-btn">Save Changes</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    elements.settingsModal = modal;

    const closeBtn = modal.querySelector('.auth-close-btn');
    closeBtn.addEventListener('click', utils.hideModals);

    const saveBtn = modal.querySelector('.save-settings-btn');
    saveBtn.addEventListener('click', async function() {
        const newName = document.getElementById('userName').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const passwordError = document.getElementById('newPasswordError');
        const confirmError = document.getElementById('confirmPasswordError');

        passwordError.textContent = '';
        confirmError.textContent = '';

        let isValid = true;
        if (!utils.validateName(newName)) {
            utils.showNotification('Please enter a valid name', 'error');
            isValid = false;
        }

        if (newPassword || confirmPassword) {
            if (!utils.validatePassword(newPassword)) {
                passwordError.textContent = 'Password must be at least 6 characters.';
                passwordError.style.display = 'block';
                isValid = false;
            }
            if (newPassword !== confirmPassword) {
                confirmError.textContent = 'Passwords do not match.';
                confirmError.style.display = 'block';
                isValid = false;
            }
        }

        if (isValid) {
            try {
                const token = localStorage.getItem('token');
                const updateData = { name: newName };
                if (newPassword) updateData.password = newPassword;

                const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });

                const result = await response.json();
                if (response.ok) {
                    currentUser.name = newName;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    updateAuthUI();
                    updateMobileMenuAuth();
                    utils.showNotification('Settings updated successfully', 'success');
                    utils.hideModals();
                } else {
                    utils.showNotification(result.message || 'Error updating settings', 'error');
                }
            } catch (error) {
                console.error('Error updating settings:', error);
                utils.showNotification('Error updating settings', 'error');
            }
        }
    });
}