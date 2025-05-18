let currentUser = null;
let isLoggedIn = false;

const elements = {
    loginModal: document.getElementById('loginModal'),
    signupModal: document.getElementById('signupModal'),
    videoModal: document.getElementById('videoModal'),
    authBackground: document.getElementById('authBackground')
};

function initAuth() {
    const signInBtn = document.querySelector('.sign-in-btn');
    const signUpBtn = document.querySelector('.sign-up-btn');
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginCloseBtn = document.querySelector('#loginModal .auth-close-btn');
    const signupCloseBtn = document.querySelector('#signupModal .auth-close-btn');

    if (signInBtn) signInBtn.addEventListener('click', () => {
        if (isLoggedIn) {
            showSettingsModal();
        } else {
            utils.showModal(elements.loginModal);
        }
    });

    if (signUpBtn) signUpBtn.addEventListener('click', () => {
        if (isLoggedIn) {
            signOut();
        } else {
            utils.showModal(elements.signupModal);
        }
    });

    if (showSignupLink) showSignupLink.addEventListener('click', e => {
        e.preventDefault();
        utils.hideModals();
        utils.showModal(elements.signupModal);
    });

    if (showLoginLink) showLoginLink.addEventListener('click', e => {
        e.preventDefault();
        utils.hideModals();
        utils.showModal(elements.loginModal);
    });

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);

    if (loginCloseBtn) loginCloseBtn.addEventListener('click', utils.hideModals);
    if (signupCloseBtn) signupCloseBtn.addEventListener('click', utils.hideModals);

    restoreUserSession();
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const emailError = document.getElementById('loginEmailError');
    const passwordError = document.getElementById('loginPasswordError');

    emailError.textContent = '';
    passwordError.textContent = '';

    let isValid = true;
    if (!utils.validateEmail(email)) {
        emailError.textContent = 'Please enter a valid email.';
        isValid = false;
    }
    if (!utils.validatePassword(password)) {
        passwordError.textContent = 'Password must be at least 6 characters.';
        isValid = false;
    }

    if (!isValid) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            isLoggedIn = true;
            currentUser = result.user;
            utils.showNotification('Logged in successfully', 'success');
            utils.hideModals();
            updateAuthUI();
            updateMobileMenuAuth();
            this.reset();
        } else {
            utils.showNotification(result.message || 'Invalid email or password', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        utils.showNotification('Login failed. Please try again.', 'error');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const nameError = document.getElementById('signupNameError');
    const emailError = document.getElementById('signupEmailError');
    const phoneError = document.getElementById('signupPhoneError');
    const passwordError = document.getElementById('signupPasswordError');

    nameError.textContent = '';
    emailError.textContent = '';
    phoneError.textContent = '';
    passwordError.textContent = '';

    let isValid = true;
    if (!utils.validateName(name)) {
        nameError.textContent = 'Name must be at least 2 characters.';
        isValid = false;
    }
    if (!utils.validateEmail(email)) {
        emailError.textContent = 'Please enter a valid email.';
        isValid = false;
    }
    if (!utils.validatePhone(phone)) {
        phoneError.textContent = 'Please enter a valid phone number.';
        isValid = false;
    }
    if (!utils.validatePassword(password)) {
        passwordError.textContent = 'Password must be at least 6 characters.';
        isValid = false;
    }

    if (!isValid) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password })
        });
        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            isLoggedIn = true;
            currentUser = result.user;
            utils.showNotification('Signed up successfully', 'success');
            utils.hideModals();
            updateAuthUI();
            updateMobileMenuAuth();
            showPaymentOptions(currentUser.name, currentUser.email);
            this.reset();
        } else {
            utils.showNotification(result.message || 'Signup failed', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        utils.showNotification('Signup failed. Please try again.', 'error');
    }
}

function restoreUserSession() {
    const storedUser = localStorage.getItem('currentUser');
    const storedLogin = localStorage.getItem('isLoggedIn');
    if (storedLogin === 'true' && storedUser) {
        currentUser = JSON.parse(storedUser);
        isLoggedIn = true;
        updateAuthUI();
        updateMobileMenuAuth();
    }
}

function signOut() {
    isLoggedIn = false;
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    watchlist = [];
    updateAuthUI();
    updateMobileMenuAuth();
    utils.showNotification('Signed out successfully', 'info');
}

function updateAuthUI() {
    const signInBtn = document.querySelector('.sign-in-btn');
    const signUpBtn = document.querySelector('.sign-up-btn');
    if (isLoggedIn && currentUser) {
        if (signInBtn) {
            signInBtn.textContent = 'Settings';
            signInBtn.onclick = showSettingsModal;
        }
        if (signUpBtn) {
            signUpBtn.textContent = 'Sign Out';
            signUpBtn.onclick = signOut;
        }
    } else {
        if (signInBtn) {
            signInBtn.textContent = 'Sign In';
            signInBtn.onclick = () => utils.showModal(elements.loginModal);
        }
        if (signUpBtn) {
            signUpBtn.textContent = 'Sign Up';
            signUpBtn.onclick = () => utils.showModal(elements.signupModal);
        }
    }
}

function updateMobileMenuAuth() {
    const mobileSignInLink = document.querySelector('.mobile-signin-link');
    if (mobileSignInLink) {
        if (isLoggedIn && currentUser) {
            mobileSignInLink.textContent = `Settings (${currentUser.name.split(' ')[0]})`;
            mobileSignInLink.onclick = showSettingsModal;
        } else {
            mobileSignInLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
            mobileSignInLink.onclick = () => utils.showModal(elements.loginModal);
        }
    }
}

document.addEventListener('DOMContentLoaded', initAuth);