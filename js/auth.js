/**
 * Auth - Client-side Authentication Utilities
 * 
 * Reads auth state from data attributes on <body>:
 *   <body data-user-id="123">    — customer is logged in
 *   <body data-admin-id="1">     — admin is logged in
 */
const Auth = {
    isUserLoggedIn() {
        const body = document.body;
        return body.hasAttribute('data-user-id') && body.getAttribute('data-user-id') !== '';
    },

    isAdminLoggedIn() {
        const body = document.body;
        return body.hasAttribute('data-admin-id') && body.getAttribute('data-admin-id') !== '';
    },

    getUserId() {
        const id = document.body.getAttribute('data-user-id');
        return id ? parseInt(id, 10) : null;
    },

    getAdminId() {
        const id = document.body.getAttribute('data-admin-id');
        return id ? parseInt(id, 10) : null;
    },

    requireLogin(redirectUrl = 'index.php') {
        if (!this.isUserLoggedIn()) {
            alert('You must be logged in to perform this action.');
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }
};

