import { API_BASE_URL, utils } from './utils.js';
import { showSettingsModal } from './ui.js'; // Ensure this import is present

// Shared state using objects to allow reactivity across modules
export const isLoggedIn = { value: false };
export const currentUser = { value: null };
export const watchlist = { value: [] };
export const paymentHistory = { value: [] };

export const elements = {
    loginModal: document.getElementById('loginModal'),
    signupModal: document.getElementById('signupModal'),
    videoModal: document.getElementById('videoModal'),
    authBackground: document.getElementById('authBackground')
};

export function initAuth() {
    const signInBtn = document.querySelector('.sign-in-btn');
    const signUpBtn = document.querySelector('.sign-up-btn');
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginCloseBtn = document.querySelector('#loginModal .auth-close-btn');
    const signupCloseBtn = document.querySelector('#signupModal .auth-close-btn');

    if (signInBtn) signInBtn.addEventListener('click', () => {
        if (isLoggedIn.value) {
            showSettingsModal(); // Now defined
        } else {
            utils.showModal(elements.loginModal);
        }
    });

    if (signUpBtn) signUpBtn.addEventListener('click', () => {
        if (isLoggedIn.value) {
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

export async function handleLogin(e) {
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
            isLoggedIn.value = true;
            currentUser.value = result.user;
            utils.showNotification('Logged in successfully', 'success');
            utils.hideModals();
            updateAuthUI();
            updateMobileMenuAuth();
            e.target.reset();
        } else {
            utils.showNotification(result.message || 'Invalid email or password', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        utils.showNotification('Login failed. Please try again.', 'error');
    }
}

export async function handleSignup(e) {
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
            isLoggedIn.value = true;
            currentUser.value = result.user;
            utils.showNotification('Signed up successfully', 'success');
            utils.hideModals();
            updateAuthUI();
            updateMobileMenuAuth();
            showPaymentOptions(currentUser.value.name, currentUser.value.email);
            e.target.reset();
        } else {
            utils.showNotification(result.message || 'Signup failed', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        utils.showNotification('Signup failed. Please try again.', 'error');
    }
}

export function restoreUserSession() {
    const storedUser = localStorage.getItem('currentUser');
    const storedLogin = localStorage.getItem('isLoggedIn');
    if (storedLogin === 'true' && storedUser) {
        currentUser.value = JSON.parse(storedUser);
        isLoggedIn.value = true;
        updateAuthUI();
        updateMobileMenuAuth();
    }
}

export function signOut() {
    isLoggedIn.value = false;
    currentUser.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    watchlist.value = [];
    localStorage.setItem('watchlist', JSON.stringify(watchlist.value));
    updateAuthUI();
    updateMobileMenuAuth();
    utils.showNotification('Signed out successfully', 'info');
}

export function updateAuthUI() {
    const signInBtn = document.querySelector('.sign-in-btn');
    const signUpBtn = document.querySelector('.sign-up-btn');
    if (isLoggedIn.value && currentUser.value) {
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

export function updateMobileMenuAuth() {
    const mobileSignInLink = document.querySelector('.mobile-signin-link');
    if (mobileSignInLink) {
        if (isLoggedIn.value && currentUser.value) {
            mobileSignInLink.textContent = `Settings (${currentUser.value.name.split(' ')[0]})`;
            mobileSignInLink.onclick = showSettingsModal;
        } else {
            mobileSignInLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
            mobileSignInLink.onclick = () => utils.showModal(elements.loginModal);
        }
    }
}

document.addEventListener('DOMContentLoaded', initAuth);

export function showPaymentOptions(name, email) {
    if (!elements.paymentModal) {
        createPaymentModal();
    }
    
    elements.authBackground.style.display = 'block';
    elements.paymentModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    const userInfo = document.getElementById('paymentUserInfo');
    if (userInfo) {
        userInfo.textContent = `Welcome, ${name}! Please select your subscription plan.`;
    }
}

function createPaymentModal() {
    const modal = document.createElement('div');
    modal.id = 'paymentModal';
    modal.className = 'auth-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'paymentModalTitle');
    modal.setAttribute('aria-modal', 'true');
    
    modal.innerHTML = `
        <div class="auth-modal-content payment-modal-content">
            <button class="auth-close-btn" aria-label="Close dialog"><i class="fas fa-times"></i></button>
            <div class="auth-header">
                <h2 id="paymentModalTitle">Your Subscription</h2>
                <p id="paymentUserInfo" class="user-welcome">Welcome! Please select your subscription plan.</p>
                <p class="trial-info">Enjoy your first week completely free!</p>
            </div>
            <div class="subscription-options">
                <div class="subscription-card">
                    <div class="subscription-header">
                        <h3>Basic Plan</h3>
                        <div class="price">K30</div>
                        <p class="price-period">per month</p>
                    </div>
                    <div class="subscription-features">
                        <p><i class="fas fa-check"></i> Unlimited streaming</p>
                        <p><i class="fas fa-check"></i> HD quality</p>
                        <p><i class="fas fa-check"></i> Watch on any device</p>
                        <p><i class="fas fa-check"></i> Local content</p>
                        <p><i class="fas fa-info-circle"></i> Contains advertisements</p>
                    </div>
                    <button class="btn primary select-plan-btn" data-plan="basic" data-price="30">Select Plan</button>
                </div>
                <div class="subscription-card premium">
                    <div class="subscription-badge">Popular</div>
                    <div class="subscription-header">
                        <h3>Premium Plan</h3>
                        <div class="price">K50</div>
                        <p class="price-period">per month</p>
                    </div>
                    <div class="subscription-features">
                        <p><i class="fas fa-check"></i> Unlimited streaming</p>
                        <p><i class="fas fa-check"></i> Ultra HD quality</p>
                        <p><i class="fas fa-check"></i> Watch on any device</p>
                        <p><i class="fas fa-check"></i> Ad-free experience</p>
                        <p><i class="fas fa-check"></i> Exclusive premium content</p>
                    </div>
                    <button class="btn primary select-plan-btn" data-plan="premium" data-price="50">Select Plan</button>
                </div>
            </div>
            <div class="payment-history-section">
                <h3>Payment History</h3>
                <div id="paymentHistory" class="payment-history-items">
                    <!-- Payment history items will be dynamically added here -->
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    elements.paymentModal = modal;
    
    const closeBtn = modal.querySelector('.auth-close-btn');
    closeBtn.addEventListener('click', utils.hideModals);
    
    const selectPlanBtns = modal.querySelectorAll('.select-plan-btn');
    selectPlanBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const plan = this.getAttribute('data-plan');
            const price = this.getAttribute('data-price');
            showPaymentMethods(plan, price);
        });
    });
    
    updatePaymentHistoryDisplay();
}

function updatePaymentHistoryDisplay() {
    const paymentHistoryContainer = document.getElementById('paymentHistory');
    if (!paymentHistoryContainer) return;
    
    if (paymentHistory.value.length === 0) {
        paymentHistoryContainer.innerHTML = `
            <p class="empty-message">No payment history available.</p>
        `;
        return;
    }
    
    paymentHistoryContainer.innerHTML = paymentHistory.value.map(payment => `
        <div class="payment-history-item">
            <div class="payment-history-info">
                <p><strong>Plan:</strong> ${payment.plan === 'premium' ? 'Premium' : 'Basic'}</p>
                <p><strong>Amount:</strong> K${payment.price}</p>
                <p><strong>Method:</strong> ${payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}</p>
                <p><strong>Date:</strong> ${payment.date}</p>
                <p><strong>Reference:</strong> ${payment.reference}</p>
            </div>
        </div>
    `).join('');
}

function showPaymentMethods(plan, price) {
    const subscriptionOptions = document.querySelector('.subscription-options');
    const paymentHistorySection = document.querySelector('.payment-history-section');
    subscriptionOptions.style.display = 'none';
    paymentHistorySection.style.display = 'none';
    
    const paymentMethodsContent = document.createElement('div');
    paymentMethodsContent.className = 'payment-methods';
    paymentMethodsContent.innerHTML = `
        <h3>Payment Methods</h3>
        <p class="selected-plan">Selected plan: <strong>${plan === 'premium' ? 'Premium' : 'Basic'} - K${price}/month</strong></p>
        <div class="payment-method-options">
            <div class="payment-method-group">
                <h4>Mobile Money</h4>
                <div class="mobile-money-options">
                    <label class="payment-option">
                        <input type="radio" name="paymentMethod" value="airtel">
                        <span class="payment-option-content">
                            <span class="payment-option-name">Airtel Money</span>
                            <img src="${API_BASE_URL}/api/placeholder/100/40" alt="Airtel Money">
                        </span>
                    </label>
                    <label class="payment-option">
                        <input type="radio" name="paymentMethod" value="mtn">
                        <span class="payment-option-content">
                            <span class="payment-option-name">MTN MoMo</span>
                            <img src="${API_BASE_URL}/api/placeholder/100/40" alt="MTN Money">
                        </span>
                    </label>
                    <label class="payment-option">
                        <input type="radio" name="paymentMethod" value="zamtel">
                        <span class="payment-option-content">
                            <span class="payment-option-name">Zamtel Money</span>
                            <img src="${API_BASE_URL}/api/placeholder/100/40" alt="Zamtel Money">
                        </span>
                    </label>
                </div>
            </div>
            <div class="payment-method-group">
                <h4>Bank Transfer</h4>
                <label class="payment-option">
                    <input type="radio" name="paymentMethod" value="bank">
                    <span class="payment-option-content">
                        <span class="payment-option-name">Bank Transfer</span>
                        <img src="${API_BASE_URL}/api/placeholder/100/40" alt="Bank Transfer">
                    </span>
                </label>
            </div>
        </div>
        <div class="payment-action-buttons">
            <button class="btn secondary back-to-plans-btn">
                <i class="fas fa-arrow-left"></i> Back to Plans
            </button>
            <button class="btn primary proceed-payment-btn">
                Proceed to Payment <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
    
    const modalContent = document.querySelector('.payment-modal-content');
    modalContent.appendChild(paymentMethodsContent);
    
    const modalTitle = document.getElementById('paymentModalTitle');
    modalTitle.textContent = 'Select Payment Method';
    
    const backButton = document.querySelector('.back-to-plans-btn');
    backButton.addEventListener('click', function() {
        subscriptionOptions.style.display = 'flex';
        paymentHistorySection.style.display = 'block';
        paymentMethodsContent.remove();
        modalTitle.textContent = 'Your Subscription';
    });
    
    const proceedButton = document.querySelector('.proceed-payment-btn');
    proceedButton.addEventListener('click', function() {
        const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (!selectedMethod) {
            utils.showNotification('Please select a payment method', 'error');
            return;
        }
        processPayment(plan, price, selectedMethod.value);
    });
}

function processPayment(plan, price, method) {
    const paymentProcessingContent = document.createElement('div');
    paymentProcessingContent.className = 'payment-processing';
    
    const paymentSuccess = Math.random() > 0.2;
    
    if (!paymentSuccess) {
        paymentProcessingContent.innerHTML = `
            <h3>Payment Failed</h3>
            <p class="error-message">There was an issue processing your payment. Please try again or use a different payment method.</p>
            <div class="payment-action-buttons">
                <button class="btn secondary back-to-methods-btn">
                    <i class="fas fa-arrow-left"></i> Back to Payment Methods
                </button>
            </div>
        `;
        
        const modalContent = document.querySelector('.payment-modal-content');
        const paymentMethods = document.querySelector('.payment-methods');
        if (paymentMethods) paymentMethods.remove();
        
        modalContent.appendChild(paymentProcessingContent);
        
        const modalTitle = document.getElementById('paymentModalTitle');
        modalTitle.textContent = 'Payment Error';
        
        const backButton = paymentProcessingContent.querySelector('.back-to-methods-btn');
        backButton.addEventListener('click', function() {
            paymentProcessingContent.remove();
            showPaymentMethods(plan, price);
        });
        
        utils.showNotification('Payment failed. Please try again.', 'error');
        return;
    }
    
    const reference = utils.generateReference();
    const paymentDate = utils.formatDate(new Date());
    
    if (method === 'bank') {
        paymentProcessingContent.innerHTML = `
            <h3>Bank Transfer Details</h3>
            <div class="bank-details">
                <p>Please transfer <strong>K${price}</strong> to the following account:</p>
                <div class="bank-info">
                    <p><strong>Bank Name:</strong> ICON Bank of Zambia</p>
                    <p><strong>Account Name:</strong> ICON Streaming</p>
                    <p><strong>Account Number:</strong> 1234567890</p>
                    <p><strong>Reference:</strong> ICON-${reference}</p>
                </div>
                <p class="bank-note">After making the transfer, please send the receipt to <strong>payments@iconstreaming.com</strong> to activate your account.</p>
            </div>
            <div class="payment-confirmation">
                <button class="btn primary complete-signup-btn">Complete Sign Up</button>
            </div>
        `;
    } else {
        let providerName = 'Mobile Money';
        if (method === 'airtel') providerName = 'Airtel Money';
        if (method === 'mtn') providerName = 'MTN MoMo';
        if (method === 'zamtel') providerName = 'Zamtel Money';
        
        paymentProcessingContent.innerHTML = `
            <h3>${providerName} Payment</h3>
            <div class="mobile-money-instructions">
                <p>To complete your payment of <strong>K${price}</strong> using ${providerName}:</p>
                <ol>
                    <li>Dial *XXX#</li>
                    <li>Select "Pay for Services"</li>
                    <li>Enter Business Number: 123456</li>
                    <li>Enter Reference Number: ICON-${reference}</li>
                    <li>Enter Amount: K${price}</li>
                    <li>Confirm with your PIN</li>
                </ol>
                <p class="mobile-note">You will receive an SMS confirmation once your payment is processed.</p>
            </div>
            <div class="payment-confirmation">
                <button class="btn primary complete-signup-btn">I've Made the Payment</button>
            </div>
        `;
    }
    
    const modalContent = document.querySelector('.payment-modal-content');
    const paymentMethods = document.querySelector('.payment-methods');
    if (paymentMethods) paymentMethods.remove();
    
    modalContent.appendChild(paymentProcessingContent);
    
    const modalTitle = document.getElementById('paymentModalTitle');
    modalTitle.textContent = 'Complete Your Payment';
    
    const completeSignupBtn = document.querySelector('.complete-signup-btn');
    completeSignupBtn.addEventListener('click', function() {
        const paymentRecord = {
            plan: plan,
            price: price,
            method: method,
            date: paymentDate,
            reference: `ICON-${reference}`
        };
        paymentHistory.value.push(paymentRecord);
        try {
            localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory.value));
        } catch (e) {
            console.warn('localStorage not available:', e);
        }
        utils.showNotification('Account successfully created. Enjoy your free week!', 'success');
        utils.hideModals();
        updateAuthUI();
    });
}