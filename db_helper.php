<?php
/**
 * Secure Database Helper Functions
 * Prevents SQL injection and provides error handling
 */

// Check if .env file exists, otherwise use defaults
if (file_exists(__DIR__ . '/.env')) {
    $env_vars = parse_ini_file(__DIR__ . '/.env');
    foreach ($env_vars as $key => $value) {
        $_ENV[$key] = $value;
    }
}

$db_host = $_ENV['DB_HOST'] ?? "127.0.0.1";
$db_name = $_ENV['DB_NAME'] ?? "pizza_pizza";
$username = $_ENV['DB_USER'] ?? "root";
$password = $_ENV['DB_PASS'] ?? "";

// Create connection
$conn = mysqli_connect($db_host, $username, $password, $db_name);

// Check connection
if (!$conn) {
    die("Database Connection failed: " . mysqli_connect_error());
}

// Set charset to UTF-8 to prevent encoding issues
mysqli_set_charset($conn, "utf8mb4");

/**
 * Execute a prepared statement safely
 * 
 * @param string $query SQL query with ? placeholders
 * @param array $types Types string (s=string, i=int, d=double, b=blob)
 * @param array $params Parameter values
 * @return mysqli_result|bool Result object or false on failure
 */
function executeQuery($query, $types = "", $params = []) {
    global $conn;
    
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        error_log("Query Prepare Error: " . $conn->error);
        return false;
    }
    
    if (!empty($params) && !empty($types)) {
        if (!$stmt->bind_param($types, ...$params)) {
            error_log("Bind Param Error: " . $stmt->error);
            return false;
        }
    }
    
    if (!$stmt->execute()) {
        error_log("Execute Error: " . $stmt->error);
        return false;
    }
    
    return $stmt->get_result();
}

/**
 * Execute an update/insert/delete query
 * 
 * @param string $query SQL query with ? placeholders
 * @param array $types Types string
 * @param array $params Parameter values
 * @return bool True on success, false on failure
 */
function executeUpdate($query, $types = "", $params = []) {
    global $conn;
    
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        error_log("Query Prepare Error: " . $conn->error);
        return false;
    }
    
    if (!empty($params) && !empty($types)) {
        if (!$stmt->bind_param($types, ...$params)) {
            error_log("Bind Param Error: " . $stmt->error);
            return false;
        }
    }
    
    if (!$stmt->execute()) {
        error_log("Execute Error: " . $stmt->error);
        return false;
    }
    
    return true;
}

/**
 * Fetch a single row
 * 
 * @param string $query SQL query with ? placeholders
 * @param array $types Types string
 * @param array $params Parameter values
 * @return array|null Associative array or null if no result
 */
function fetchOne($query, $types = "", $params = []) {
    $result = executeQuery($query, $types, $params);
    
    if (!$result) {
        return null;
    }
    
    return $result->fetch_assoc();
}

/**
 * Fetch all rows
 * 
 * @param string $query SQL query with ? placeholders
 * @param array $types Types string
 * @param array $params Parameter values
 * @return array Array of rows
 */
function fetchAll($query, $types = "", $params = []) {
    $result = executeQuery($query, $types, $params);
    
    if (!$result) {
        return [];
    }
    
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    
    return $rows;
}

/**
 * Get last insert ID
 * 
 * @return int Last inserted ID
 */
function lastInsertId() {
    global $conn;
    return $conn->insert_id;
}

/**
 * Get number of affected rows
 * 
 * @return int Number of affected rows
 */
function affectedRows() {
    global $conn;
    return $conn->affected_rows;
}

/**
 * Get database error
 * 
 * @return string Error message
 */
function getError() {
    global $conn;
    return $conn->error;
}

?>
