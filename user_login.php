<?php

include 'config.php';
include 'db_helper.php';
include 'security_helper.php';
include 'ui_helper.php';

session_start();

if (isset($_POST['login'])) {
    // Validate required fields
    $required_fields = ['email', 'pass'];
    $missing = SecurityHelper::validateRequired($_POST, $required_fields);
    
    if (!empty($missing)) {
        setToastMessage('Please fill in all required fields!', 'warning');
    } else {
        $email = SecurityHelper::sanitizeString($_POST['email']);
        $pass = SecurityHelper::sanitizeString($_POST['pass']);
        
        // Validate email format
        if (!SecurityHelper::validateEmail($email)) {
            setToastMessage('Invalid email format!', 'error');
        } else {
            // Use prepared statement to prevent SQL injection
            $query = "SELECT * FROM `user` WHERE email = ?";
            $result = executeQuery($query, "s", [$email]);
            
            if ($result && $result->num_rows > 0) {
                $row = $result->fetch_assoc();
                
                // Verify password (use SHA1 for backward compatibility)
                $pass_hash = sha1($pass);
                
                if ($pass_hash === $row['password']) {
                    $_SESSION['user_id'] = $row['id'];
                    $_SESSION['user_name'] = $row['name'];
                    setToastMessage('Login successful! Redirecting...', 'success');
                    header('Refresh: 1; url=index.php');
                    exit();
                } else {
                    setToastMessage('Incorrect email or password!', 'error');
                    header('location:index.php');
                    exit();
                }
            } else {
                setToastMessage('Incorrect email or password!', 'error');
                header('location:index.php');
                exit();
            }
        }
    }
    
    // Fallback redirect
    header('location:index.php');
    exit();
}

?>
