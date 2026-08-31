<?php
/**
 * Centralized Authentication Helper
 * 
 * Replaces ad-hoc $_SESSION checks scattered across PHP files.
 * Include this file and call the appropriate function at the top of each page.
 */

/**
 * Ensure session is started (safe to call multiple times)
 */
function ensureSession() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

/**
 * Check if an admin is currently logged in
 * @return bool
 */
function isAdminLoggedIn() {
    ensureSession();
    return isset($_SESSION['admin_id']);
}

/**
 * Check if a customer/user is currently logged in
 * @return bool
 */
function isUserLoggedIn() {
    ensureSession();
    return isset($_SESSION['user_id']);
}

/**
 * Get the current admin ID, or null if not logged in
 * @return int|null
 */
function getCurrentAdminId() {
    ensureSession();
    return isset($_SESSION['admin_id']) ? (int)$_SESSION['admin_id'] : null;
}

/**
 * Get the current user ID, or null if not logged in
 * @return int|null
 */
function getCurrentUserId() {
    ensureSession();
    return isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
}

/**
 * Require admin login — redirect to admin_login.php if not authenticated.
 * Call this at the top of every admin page.
 */
function requireAdminLogin() {
    ensureSession();
    if (!isAdminLoggedIn()) {
        header('Location: admin_login.php');
        exit();
    }
}

/**
 * Require user login — redirect to index.php if not authenticated.
 * Call this at the top of every customer-only page.
 */
function requireUserLogin() {
    ensureSession();
    if (!isUserLoggedIn()) {
        header('Location: index.php');
        exit();
    }
}
?>

