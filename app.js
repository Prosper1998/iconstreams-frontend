import { API_BASE_URL, utils } from './utils.js';
import { isLoggedIn, currentUser, watchlist, updateAuthUI, signOut } from './auth.js';
import { initVideoPlayer } from './player.js'; // Import initVideoPlayer

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    restoreLocalStorage();
    updateAuthUI();
    initVideoPlayer();
});

// Mobile Menu
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenuClose = document.querySelector('.mobile-menu-close');
const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');

if (mobileMenuBtn && mobileMenuOverlay) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuOverlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    mobileMenuClose?.addEventListener('click', () => {
        mobileMenuOverlay.style.display = 'none';
        document.body.style.overflow = '';
    });
}

// Restore from LocalStorage
function restoreLocalStorage() {
    try {
        const user = localStorage.getItem('currentUser');
        const list = localStorage.getItem('watchlist');
        const payments = localStorage.getItem('paymentHistory');

        if (user) {
            currentUser.value = JSON.parse(user);
            isLoggedIn.value = true;
        }

        if (list) {
            watchlist.value = JSON.parse(list);
        }

        if (payments) {
            paymentHistory.value = JSON.parse(payments);
        }
    } catch (e) {
        console.warn("Local storage restoration failed:", e);
    }
}

// Universal Content Loader
export async function loadContent(endpoint, containerId, typeLabel = "Content") {
    const container = document.getElementById(containerId);
    const loader = document.querySelector('.loading');

    try {
        const res = await fetch(endpoint);
        const items = await res.json();

        if (!res.ok) {
            throw new Error(`Failed to fetch ${typeLabel}: ${items.message || res.statusText}`);
        }

        if (!Array.isArray(items)) throw new Error("API response is not an array");

        const cards = items.map(item => {
            const title = item.title || "Untitled";
            const year = item.releaseYear || "Year";
            const genre = item.category || "Genre";
            const thumbnail = item.thumbnail || `${API_BASE_URL}/api/placeholder/400/300`;
            const badge = item.visibility === 'premium' ? `<div class="card-badge">PREMIUM</div>` : '';
            const videoSrc = item.video || '';

            return `
                <div class="content-card" data-video-src="${videoSrc}" data-id="${item._id}">
                    ${badge}
                    <div class="card-image">
                        <img src="${thumbnail}" alt="${title}">
                        <div class="card-overlay">
                            <button class="play-btn"><i class="fas fa-play"></i></button>
                        </div>
                    </div>
                    <div class="card-info">
                        <h3>${title}</h3>
                        <div class="meta">
                            <span>${year}</span>
                            <div class="meta-dot"></div>
                            <span>${genre}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = cards.length ? cards : `<p class="empty-message">No ${typeLabel} available.</p>`;
        loader.classList.add('loaded');
        initVideoPlayer();

    } catch (err) {
        console.error(`Failed to load ${typeLabel}:`, err);
        container.innerHTML = `<p class="empty-message">Unable to load ${typeLabel.toLowerCase()} at the moment.</p>`;
        loader?.classList.add('loaded');
    }
}

// Auto-load content on specific pages
document.addEventListener('DOMContentLoaded', () => {
    const pathname = window.location.pathname;

    if (pathname.includes('tv-shows.html')) {
        loadContent(`${API_BASE_URL}/api/content?category=TV%20Shows`, 'tvShowsContainer', 'TV Shows');
    }

    if (pathname.includes('movies.html')) {
        loadContent(`${API_BASE_URL}/api/content?category=Movies`, 'moviesContainer', 'Movies');
    }

    if (pathname.includes('index.html')) {
        loadContent(`${API_BASE_URL}/api/content?category=Featured`, 'featuredContainer', 'Featured');
    }
});