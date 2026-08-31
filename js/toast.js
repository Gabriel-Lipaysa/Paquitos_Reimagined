/**
 * Toast Notification System
 * Modern, user-friendly notifications instead of browser alerts
 */

class Toast {
    constructor(message, type = 'info', duration = 3000) {
        this.message = message;
        this.type = type; // 'success', 'error', 'warning', 'info'
        this.duration = duration;
        this.element = null;
        this.timeoutId = null;
    }

    /**
     * Show the toast notification
     */
    show() {
        // Get or create container
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Create toast element
        this.element = document.createElement('div');
        this.element.className = `toast ${this.type}`;
        this.element.innerHTML = `
            <div class="toast-icon"></div>
            <div class="toast-message">${this.escapeHtml(this.message)}</div>
            <button class="toast-close" aria-label="Close notification"></button>
            <div class="toast-progress"></div>
        `;

        // Add close button handler
        const closeBtn = this.element.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.close());

        // Add to container
        container.appendChild(this.element);

        // Auto close after duration
        if (this.duration > 0) {
            this.timeoutId = setTimeout(() => this.close(), this.duration);
        }

        return this;
    }

    /**
     * Close the toast notification
     */
    close() {
        if (!this.element) return;

        // Clear timeout
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        // Add exit animation
        this.element.classList.add('exit');

        // Remove element after animation
        setTimeout(() => {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        }, 300);
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/**
 * Global Toast Functions - Easy API for showing notifications
 */
window.Toast = {
    /**
     * Show success notification
     * @param {string} message
     * @param {number} duration - milliseconds (0 = no auto-close)
     */
    success(message, duration = 3000) {
        return new Toast(message, 'success', duration).show();
    },

    /**
     * Show error notification
     * @param {string} message
     * @param {number} duration - milliseconds (0 = no auto-close)
     */
    error(message, duration = 5000) {
        return new Toast(message, 'error', duration).show();
    },

    /**
     * Show warning notification
     * @param {string} message
     * @param {number} duration - milliseconds (0 = no auto-close)
     */
    warning(message, duration = 4000) {
        return new Toast(message, 'warning', duration).show();
    },

    /**
     * Show info notification
     * @param {string} message
     * @param {number} duration - milliseconds (0 = no auto-close)
     */
    info(message, duration = 3000) {
        return new Toast(message, 'info', duration).show();
    }
};

/**
 * Form Validation & Error Display
 */
class FormValidator {
    constructor(formElement) {
        this.form = formElement;
        this.errors = new Map();
    }

    /**
     * Validate required field
     */
    isRequired(fieldName, value) {
        if (!value || value.trim() === '') {
            this.setError(fieldName, 'This field is required');
            return false;
        }
        this.clearError(fieldName);
        return true;
    }

    /**
     * Validate email format
     */
    isEmail(fieldName, value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            this.setError(fieldName, 'Invalid email format');
            return false;
        }
        this.clearError(fieldName);
        return true;
    }

    /**
     * Validate minimum length
     */
    minLength(fieldName, value, min) {
        if (value.length < min) {
            this.setError(fieldName, `Must be at least ${min} characters`);
            return false;
        }
        this.clearError(fieldName);
        return true;
    }

    /**
     * Validate maximum length
     */
    maxLength(fieldName, value, max) {
        if (value.length > max) {
            this.setError(fieldName, `Must not exceed ${max} characters`);
            return false;
        }
        this.clearError(fieldName);
        return true;
    }

    /**
     * Validate number range
     */
    numberRange(fieldName, value, min, max) {
        const num = parseFloat(value);
        if (isNaN(num) || num < min || num > max) {
            this.setError(fieldName, `Must be between ${min} and ${max}`);
            return false;
        }
        this.clearError(fieldName);
        return true;
    }

    /**
     * Validate phone number
     */
    isPhone(fieldName, value) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 7) {
            this.setError(fieldName, 'Invalid phone number');
            return false;
        }
        this.clearError(fieldName);
        return true;
    }

    /**
     * Validate match (e.g., password confirmation)
     */
    matches(fieldName, value1, fieldName2, value2) {
        if (value1 !== value2) {
            this.setError(fieldName, `${fieldName} does not match ${fieldName2}`);
            return false;
        }
        this.clearError(fieldName);
        return true;
    }

    /**
     * Set error for a field
     */
    setError(fieldName, message) {
        this.errors.set(fieldName, message);
        this.displayError(fieldName, message);
    }

    /**
     * Clear error for a field
     */
    clearError(fieldName) {
        this.errors.delete(fieldName);
        this.displayError(fieldName, null);
    }

    /**
     * Display error on form field
     */
    displayError(fieldName, message) {
        const input = this.form.querySelector(`[name="${fieldName}"]`);
        if (!input) return;

        const group = input.closest('.form-group');
        if (!group) return;

        // Remove existing error message
        const existingError = group.querySelector('.form-error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add error state
        if (message) {
            input.classList.add('form-error');
            const errorMsg = document.createElement('div');
            errorMsg.className = 'form-error-message';
            errorMsg.textContent = message;
            group.appendChild(errorMsg);
        } else {
            input.classList.remove('form-error');
        }
    }

    /**
     * Check if form has errors
     */
    hasErrors() {
        return this.errors.size > 0;
    }

    /**
     * Get all errors
     */
    getErrors() {
        return Array.from(this.errors.values());
    }

    /**
     * Clear all errors
     */
    clearAllErrors() {
        this.form.querySelectorAll('.form-error').forEach(field => {
            field.classList.remove('form-error');
        });
        this.form.querySelectorAll('.form-error-message').forEach(msg => {
            msg.remove();
        });
        this.errors.clear();
    }
}

/**
 * Example: Display server-side messages as toasts
 * Call this if there are messages in PHP sessions
 */
function displaySessionMessages() {
    const messages = document.querySelectorAll('[data-toast-message]');
    messages.forEach(element => {
        const message = element.getAttribute('data-toast-message');
        const type = element.getAttribute('data-toast-type') || 'info';
        Toast[type](message);
        element.remove(); // Remove the hidden element
    });
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    displaySessionMessages();
});

/**
 * Helper: Redirect with message
 * Usage: showToastAndRedirect('Profile updated!', 'success', '/dashboard');
 */
function showToastAndRedirect(message, type = 'info', redirectUrl = null) {
    Toast[type](message);
    
    if (redirectUrl) {
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1500); // Wait for toast to be visible
    }
}
