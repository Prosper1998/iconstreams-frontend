const API_BASE_URL = 'http://localhost:5000';

const utils = {
    showNotification(message, type = 'info') {
        const notificationContainer = document.getElementById('notificationContainer') || document.body;
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'times-circle';
        if (type === 'warning') icon = 'exclamation-circle';
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        notificationContainer.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    validatePhone(phone) {
        return /^\+?[1-9]\d{9,14}$/.test(phone);
    },

    validatePassword(password) {
        return password.length >= 6 && password.length <= 60;
    },

    validateName(name) {
        return name.trim().length >= 2;
    },

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    generateReference() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    },

    showModal(modal) {
        if (!modal) return;
        const authBackground = document.getElementById('authBackground');
        if (authBackground) authBackground.style.display = 'block';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        const firstInput = modal.querySelector('input');
        if (firstInput) firstInput.focus();
    },

    hideModals() {
        const authBackground = document.getElementById('authBackground');
        if (authBackground) authBackground.style.display = 'none';
        document.querySelectorAll('.auth-modal, .modal').forEach(modal => modal.classList.remove('show'));
        document.body.style.overflow = '';
    }
};