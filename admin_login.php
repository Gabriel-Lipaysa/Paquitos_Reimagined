<?php
include 'config.php';
include 'db_helper.php';
include 'security_helper.php';
include 'ui_helper.php';

session_start();

$message = [];

if (isset($_POST['login'])) {
    // Validate required fields
    $required_fields = ['name', 'pass'];
    $missing = SecurityHelper::validateRequired($_POST, $required_fields);
    
    if (!empty($missing)) {
        addToastMessage('Please fill in all required fields!', 'warning');
    } else {
        $name = SecurityHelper::sanitizeString($_POST['name']);
        $pass = SecurityHelper::sanitizeString($_POST['pass']);
        
        // Validate input
        if (!SecurityHelper::validateString($name, 1, 20)) {
            addToastMessage('Invalid username format!', 'error');
        } else {
            // Use prepared statement to prevent SQL injection
            $select_admin_query = "SELECT * FROM `admin` WHERE name = ?";
            $result = executeQuery($select_admin_query, "s", [$name]);
            
            if ($result && $result->num_rows > 0) {
                $row = $result->fetch_assoc();
                
                // Verify password (use SHA1 for backward compatibility with existing hashes)
                $pass_hash = sha1($pass);
                
                if ($pass_hash === $row['password']) {
                    $_SESSION['admin_id'] = $row['id'];
                    $_SESSION['admin_name'] = $row['name'];
                    setToastMessage('Login successful! Redirecting...', 'success');
                    header('Refresh: 1; url=admin_page.php');
                } else {
                    addToastMessage('Incorrect username or password!', 'error');
                }
            } else {
                addToastMessage('Incorrect username or password!', 'error');
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Admin Login</title>

   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">
   <link rel="stylesheet" href="css/admin_style.css">
   <link rel="stylesheet" href="css/toast.css">

   <style>
      body {
         /* Changed to a green gradient */
         background: linear-gradient(135deg, #00b34a 0%, #008C3B 100%);
         display: flex;
         justify-content: center;
         align-items: center;
         min-height: 100vh;
         font-family: 'Nunito', sans-serif;
      }

      .login-container {
         background: white;
         border-radius: 12px;
         box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
         padding: 40px;
         width: 100%;
         max-width: 400px;
      }

      .login-header {
         text-align: center;
         margin-bottom: 30px;
      }

      .login-title {
         font-size: 28px;
         font-weight: 700;
         color: #333;
         margin: 0 0 10px;
      }

      .login-subtitle {
         font-size: 14px;
         color: #666;
         margin: 0;
      }

      .form-group {
         margin-bottom: 20px;
      }

      .form-label {
         font-weight: 600;
         margin-bottom: 8px;
         color: #333;
         font-size: 14px;
         display: flex;
         align-items: center;
         gap: 8px;
      }

      .form-input {
         width: 100%;
         padding: 12px;
         border: 1px solid #ddd;
         border-radius: 6px;
         font-size: 14px;
         transition: all 0.3s;
      }

      .form-input:focus {
         /* Updated focus border and shadow to green */
         border-color: #008C3B;
         box-shadow: 0 0 0 3px rgba(0, 140, 59, 0.1);
      }

      .submit-button {
         width: 100%;
         padding: 12px;
         Changed to green gradient
         background: linear-gradient(135deg, #00b34a 0%, #008C3B 100%);
         color: white;
         border: none;
         border-radius: 6px;
         font-size: 16px;
         font-weight: 600;
         cursor: pointer;
         transition: transform 0.2s, box-shadow 0.2s;
         margin-top: 20px;
      }

      .submit-button:hover {
         transform: translateY(-2px);
         /* Updated shadow to match green theme */
         box-shadow: 0 4px 16px rgba(0, 140, 59, 0.4);
      }

      .submit-button:active {
         transform: translateY(0);
      }

      .helper-text {
         text-align: center;
         font-size: 13px;
         color: #666;
         margin-top: 15px;
      }

      .helper-text strong {
         /* Updated bold text to green */
         color: #008C3B;
         font-weight: 600;
      }

      .field-indicator {
         font-size: 11px;
         font-weight: 600;
         padding: 2px 8px;
         border-radius: 4px;
         background-color: #ffebee;
         color: #c62828;
         text-transform: uppercase;
      }

      .required-asterisk {
         color: #f44336;
         font-weight: bold;
      }

      @media (max-width: 480px) {
         .login-container {
            padding: 20px;
         }

         .login-title {
            font-size: 24px;
         }
      }
   </style>
</head>
<body>

<?php echo displayToastMessages(); ?>

<div class="login-container">
   <div class="login-header">
      <h1 class="login-title">Admin Login</h1>
      <p class="login-subtitle">Pizza ETR Management System</p>
   </div>

   <form action="" method="post" id="loginForm">
      <?php echo formField('name', 'Username', 'text', true, 'Enter your username', '', ['maxlength' => '20']); ?>
      <?php echo formField('pass', 'Password', 'password', true, 'Enter your password', '', ['maxlength' => '20']); ?>
      
      <button type="submit" name="login" class="submit-button">
         <i class="fas fa-sign-in-alt"></i> Login Now
      </button>
   </form>

   <p class="helper-text">
      Default: <strong>admin</strong> / <strong>111</strong>
   </p>
</div>

<script src="js/toast.js"></script>
</body>
</html>
