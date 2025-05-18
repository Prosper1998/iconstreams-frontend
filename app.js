// app.js

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
        currentUser = JSON.parse(user);
        isLoggedIn = true;
      }
  
      if (list) {
        watchlist = JSON.parse(list);
      }
  
      if (payments) {
        paymentHistory = JSON.parse(payments);
      }
    } catch (e) {
      console.warn("Local storage restoration failed:", e);
    }
  }
  
  // Auth UI
  function updateAuthUI() {
    const signInBtns = document.querySelectorAll('.sign-in-btn');
    const signUpBtns = document.querySelectorAll('.sign-up-btn');
  
    if (isLoggedIn) {
      signInBtns.forEach(btn => {
        btn.textContent = 'Account';
        btn.onclick = showSettingsModal;
      });
  
      signUpBtns.forEach(btn => {
        btn.textContent = 'Sign Out';
        btn.onclick = signOut;
      });
    } else {
      signInBtns.forEach(btn => {
        btn.textContent = 'Sign In';
        btn.onclick = () => utils.showModal(elements.loginModal);
      });
  
      signUpBtns.forEach(btn => {
        btn.textContent = 'Sign Up';
        btn.onclick = () => utils.showModal(elements.signupModal);
      });
    }
  }
  
  function signOut() {
    isLoggedIn = false;
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    utils.showNotification('Signed out successfully', 'info');
  }
  
  // Universal Content Loader
  async function loadContent(endpoint, containerId, typeLabel = "Content") {
    const container = document.getElementById(containerId);
    const loader = document.querySelector('.loading');
  
    try {
      const res = await fetch(endpoint);
      const items = await res.json();
  
      if (!Array.isArray(items)) throw new Error("API response is not an array");
  
      const cards = items.map(item => {
        const title = item.title || "Untitled";
        const year = item.year || "Year";
        const genre = item.genre || "Genre";
        const thumbnail = item.thumbnail || '/api/placeholder/400/300';
        const badge = item.badge ? `<div class="card-badge">${item.badge}</div>` : '';
        const videoSrc = item.video || '';
  
        return `
          <div class="content-card" data-video-src="${videoSrc}" data-id="${item.id}">
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
      loadContent('/api/content?category=TV%20Shows', 'tvShowsContainer', 'TV Shows');
    }
  
    if (pathname.includes('movies.html')) {
      loadContent('/api/content?category=Movies', 'moviesContainer', 'Movies');
    }
  
    if (pathname.includes('index.html')) {
      loadContent('/api/content?category=Featured', 'featuredContainer', 'Featured');
    }
  });
  