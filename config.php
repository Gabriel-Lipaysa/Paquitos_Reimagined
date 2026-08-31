<?php
require_once __DIR__ . '/security_helper.php';
SecurityHelper::loadEnv();

$db_host = getenv('DB_HOST') ?: '127.0.0.1';
$db_name = getenv('DB_NAME') ?: 'pizza_pizza';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
$db_port = getenv('DB_PORT') ?: 3306;

// Create connection
$conn = mysqli_connect($db_host, $username, $password, $db_name, (int)$db_port);

// Check connection
if (!$conn) {
   die("Connection failed: " . mysqli_connect_error());
}
?>
