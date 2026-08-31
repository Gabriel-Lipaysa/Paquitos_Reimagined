<?php
/**
 * Input Validation and Output Security Helper
 */

class SecurityHelper {
    /**
     * Safely escape HTML output to prevent XSS
     * 
     * @param string $value Value to escape
     * @return string Escaped value
     */
    public static function escape($value) {
        return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Validate email format
     * 
     * @param string $email Email to validate
     * @return bool True if valid
     */
    public static function validateEmail($email) {
        $email = trim($email);
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * Validate integer
     * 
     * @param mixed $value Value to validate
     * @return int|false Integer value or false
     */
    public static function validateInteger($value) {
        $value = trim((string)$value);
        if (filter_var($value, FILTER_VALIDATE_INT) === false) {
            return false;
        }
        return (int)$value;
    }
    
    /**
     * Validate string length
     * 
     * @param string $value String to validate
     * @param int $min Minimum length
     * @param int $max Maximum length
     * @return bool True if valid
     */
    public static function validateString($value, $min = 1, $max = 255) {
        $length = strlen(trim($value));
        return $length >= $min && $length <= $max;
    }
    
    /**
     * Sanitize string input
     * 
     * @param string $value Value to sanitize
     * @return string Sanitized value
     */
    public static function sanitizeString($value) {
        $value = trim($value);
        $value = stripslashes($value);
        return $value;
    }
    
    /**
     * Validate phone number
     * 
     * @param string $phone Phone number
     * @return bool True if valid
     */
    public static function validatePhone($phone) {
        $phone = preg_replace('/[^0-9+\-().]/', '', $phone);
        return strlen($phone) >= 7 && strlen($phone) <= 20;
    }
    
    /**
     * Validate address (basic check)
     * 
     * @param string $address Address
     * @return bool True if valid
     */
    public static function validateAddress($address) {
        return self::validateString($address, 5, 500);
    }
    
    /**
     * Hash password using bcrypt
     * 
     * @param string $password Password to hash
     * @return string Hashed password
     */
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }
    
    /**
     * Verify password against hash
     * 
     * @param string $password Plain text password
     * @param string $hash Password hash
     * @return bool True if password matches
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    /**
     * Validate required fields in array
     * 
     * @param array $data Array to validate
     * @param array $required Required field names
     * @return array Array of missing fields
     */
    public static function validateRequired($data, $required) {
        $missing = [];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                $missing[] = $field;
            }
        }
        return $missing;
    }
    
    /**
     * Generate CSRF token
     * 
     * @return string CSRF token
     */
    public static function generateCSRFToken() {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
    
    /**
     * Verify CSRF token
     * 
     * @param string $token Token to verify
     * @return bool True if valid
     */
    public static function verifyCSRFToken($token) {
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }
}

?>
