<?php
session_start();
include 'config.php';
include 'db_helper.php';
include 'security_helper.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Validate session
    if (!isset($_SESSION['user_id'])) {
        echo "<script>alert('Please log in first'); window.location.href = 'user_login.php';</script>";
        exit();
    }
    
    // Validate required fields
    $required_fields = ['product_id', 'quantity', 'base_price'];
    $missing = SecurityHelper::validateRequired($_POST, $required_fields);
    
    if (!empty($missing)) {
        echo "<script>alert('Missing required information'); window.location.href = 'customer_menu.php';</script>";
        exit();
    }
    
    // Validate and sanitize input
    $user_id = (int)$_SESSION['user_id'];
    $product_id = SecurityHelper::validateInteger($_POST['product_id']);
    $quantity = SecurityHelper::validateInteger($_POST['quantity']);
    $base_price = (float)$_POST['base_price'];
    $size_id = isset($_POST['size']) ? SecurityHelper::validateInteger($_POST['size']) : null;
    
    // Validate inputs
    if (!$product_id || $product_id === false) {
        echo "<script>alert('Invalid product ID'); window.location.href = 'customer_menu.php';</script>";
        exit();
    }
    
    if (!$quantity || $quantity <= 0 || $quantity > 100) {
        echo "<script>alert('Invalid quantity'); window.location.href = 'customer_menu.php';</script>";
        exit();
    }
    
    if ($base_price < 0) {
        echo "<script>alert('Invalid price'); window.location.href = 'customer_menu.php';</script>";
        exit();
    }
    
    if ($size_id !== null && $size_id === false) {
        echo "<script>alert('Invalid size'); window.location.href = 'customer_menu.php';</script>";
        exit();
    }
    
    // Process customizations/toppings
    $customIDS = '';
    if (isset($_POST['toppings']) && is_array($_POST['toppings'])) {
        // Validate each topping ID as integer
        $valid_toppings = [];
        foreach ($_POST['toppings'] as $topping_id) {
            $validated_id = SecurityHelper::validateInteger($topping_id);
            if ($validated_id !== false && $validated_id > 0) {
                $valid_toppings[] = $validated_id;
            }
        }
        if (!empty($valid_toppings)) {
            $customIDS = implode(',', $valid_toppings);
        }
    }
    
    // Fetch product details using prepared statement
    $product_query = "SELECT name, image FROM products WHERE id = ?";
    $product_result = executeQuery($product_query, "i", [$product_id]);
    
    if (!$product_result || $product_result->num_rows === 0) {
        echo "<script>alert('Product not found'); window.location.href = 'customer_menu.php';</script>";
        exit();
    }
    
    $product = $product_result->fetch_assoc();
    $total_price = $base_price;
    
    // Calculate size price if provided
    if ($size_id !== null) {
        $size_query = "SELECT sizeprice FROM size WHERE sizeID = ?";
        $size_result = executeQuery($size_query, "i", [$size_id]);
        
        if ($size_result && $size_row = $size_result->fetch_assoc()) {
            $total_price += (float)$size_row['sizeprice'];
        }
    }
    
    // Calculate customization prices
    if (!empty($customIDS)) {
        // Build safe query for IN clause
        $placeholders = implode(',', array_fill(0, count($valid_toppings), '?'));
        $customization_query = "SELECT cusPrice FROM customization WHERE cusID IN ($placeholders)";
        $customization_result = executeQuery($customization_query, str_repeat('i', count($valid_toppings)), $valid_toppings);
        
        if ($customization_result) {
            while ($row = $customization_result->fetch_assoc()) {
                $total_price += (float)$row['cusPrice'];
            }
        }
    }
    
    // Calculate final price
    $total_price = $total_price * $quantity;
    
    // Insert into cart using prepared statement
    $insert_query = "INSERT INTO cart (user_id, pid, name, price, quantity, image, sizeID, customIDS) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    if (executeUpdate($insert_query, "iisiisis", 
        [$user_id, $product_id, $product['name'], $total_price, $quantity, $product['image'], $size_id ?? 0, $customIDS])) {
        $msg = 'Product added to cart successfully!';
        echo "<script>alert(" . json_encode($msg, JSON_HEX_QUOT | JSON_HEX_TAG) . "); window.location.href = 'customer_menu.php';</script>";
    } else {
        $msg = 'Failed to add product to cart. Please try again.';
        echo "<script>alert(" . json_encode($msg, JSON_HEX_QUOT | JSON_HEX_TAG) . "); window.location.href = 'customer_menu.php';</script>";
    }
}
?>
