function showPaymentOptions(name, email) {
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
    
    if (paymentHistory.length === 0) {
        paymentHistoryContainer.innerHTML = `
            <p class="empty-message">No payment history available.</p>
        `;
        return;
    }
    
    paymentHistoryContainer.innerHTML = paymentHistory.map(payment => `
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
                            <img src="/api/placeholder/100/40" alt="Airtel Money">
                        </span>
                    </label>
                    <label class="payment-option">
                        <input type="radio" name="paymentMethod" value="mtn">
                        <span class="payment-option-content">
                            <span class="payment-option-name">MTN MoMo</span>
                            <img src="/api/placeholder/100/40" alt="MTN Money">
                        </span>
                    </label>
                    <label class="payment-option">
                        <input type="radio" name="paymentMethod" value="zamtel">
                        <span class="payment-option-content">
                            <span class="payment-option-name">Zamtel Money</span>
                            <img src="/api/placeholder/100/40" alt="Zamtel Money">
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
                        <img src="/api/placeholder/100/40" alt="Bank Transfer">
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
        paymentHistory.push(paymentRecord);
        try {
            localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory));
        } catch (e) {
            console.warn('localStorage not available:', e);
        }
        utils.showNotification('Account successfully created. Enjoy your free week!', 'success');
        utils.hideModals();
        updateAuthUI();
    });
}