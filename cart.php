<?php
include 'config.php';
include 'db_helper.php';
include 'security_helper.php';
include 'auth_helper.php';

requireUserLogin();

$user_id = (int)$_SESSION['user_id'];

// Handle cart update via AJAX
if (isset($_POST['cart_id']) && isset($_POST['cart_quantity'])) {
    // Validate inputs
    $cart_id = SecurityHelper::validateInteger($_POST['cart_id']);
    $quantity = SecurityHelper::validateInteger($_POST['cart_quantity']);
    
    if ($cart_id === false || $quantity === false || $quantity < 1 || $quantity > 100) {
        echo 'error';
        exit();
    }

    // Verify cart item belongs to user using prepared statement
    $verify_query = "SELECT id FROM cart WHERE id = ? AND user_id = ?";
    $verify_result = executeQuery($verify_query, "ii", [$cart_id, $user_id]);

    if ($verify_result && $verify_result->num_rows > 0) {
        // Update cart quantity using prepared statement
        $update_query = "UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?";
        if (executeUpdate($update_query, "iii", [$quantity, $cart_id, $user_id])) {
            echo 'success';
        } else {
            echo 'error';
        }
    } else {
        echo 'error';
    }
    exit();
}

// Fetch cart items using prepared statement
$cart_query = "SELECT c.*, sz.sizename, p.name as product_name, p.image
               FROM cart c 
               LEFT JOIN size sz ON c.sizeID = sz.sizeID 
               LEFT JOIN products p ON c.pid = p.id
               WHERE c.user_id = ?
               ORDER BY c.id DESC";
$cart_result = executeQuery($cart_query, "i", [$user_id]);

$subtotal = 0;
$grand_total = 0;
$cart_item = [];

// Calculate totals and build cart summary
if ($cart_result && $cart_result->num_rows > 0) {
    while ($fetch_cart = $cart_result->fetch_assoc()) {
        $sub_total = ($fetch_cart['price'] * $fetch_cart['quantity']);
        $grand_total += $sub_total;
        // Safely escape product name for text output
        $safe_name = SecurityHelper::escape($fetch_cart['name']);
        $cart_item[] = $safe_name . ' ( ₱' . number_format($fetch_cart['price'], 2) . ' x ' . (int)$fetch_cart['quantity'] . ' ) - ';
    }
    $total_products = implode('', $cart_item);
} else {
    $total_products = "No items in the cart.";
}

// Handle delete request
if (isset($_GET['delete'])) {
    $delete_id = SecurityHelper::validateInteger($_GET['delete']);
    
    if ($delete_id === false) {
        echo '<script>alert("Invalid cart ID"); window.location = "cart.php";</script>';
        exit();
    }
    
    // Verify cart item belongs to user
    $verify_query = "SELECT id FROM cart WHERE id = ? AND user_id = ?";
    $verify_result = executeQuery($verify_query, "ii", [$delete_id, $user_id]);

    if ($verify_result && $verify_result->num_rows > 0) {
        // Delete cart item
        $delete_query = "DELETE FROM cart WHERE id = ? AND user_id = ?";
        if (executeUpdate($delete_query, "ii", [$delete_id, $user_id])) {
            header('Location: cart.php');
            exit();
        } else {
            echo '<script>alert("Error deleting the item"); window.location = "cart.php";</script>';
        }
    } else {
        echo 'Item not found or unauthorized action.';
    }
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = !empty($_POST['name']) ? mysqli_real_escape_string($conn, $_POST['name']) : null;
    $number = !empty($_POST['number']) ? mysqli_real_escape_string($conn, $_POST['number']) : null;
    $method = !empty($_POST['method']) ? mysqli_real_escape_string($conn, $_POST['method']) : null;
    $address = !empty($_POST['flat']) ? mysqli_real_escape_string($conn, $_POST['flat']) : null;
    $total_price = !empty($_POST['total_price']) ? mysqli_real_escape_string($conn, $_POST['total_price']) : null;
    $placed_on = date('Y-m-d H:i:s'); 

    $columns = ['user_id', 'placed_on', 'payment_status'];
    $values = [$user_id, "'$placed_on'", "'pending'"];

    if ($name !== null) {
        $columns[] = 'name';
        $values[] = "'$name'";
    }

    if ($number !== null) {
        $columns[] = 'number';
        $values[] = "'$number'";
    }

    if ($method !== null) {
        $columns[] = 'method';
        $values[] = "'$method'";
    }

    if ($address !== null) {
        $columns[] = 'address';
        $values[] = "'$address'";
    }

    if ($total_price !== null) {
        $columns[] = 'total_price';
        $values[] = "'$total_price'";
    }

    $columns_str = implode(', ', $columns);
    $values_str = implode(', ', $values);

    $insert_order_query = "INSERT INTO orders ($columns_str) VALUES ($values_str)";

if (mysqli_query($conn, $insert_order_query)) {
    $order_id = mysqli_insert_id($conn);

    $select_cart_query = "SELECT id, pid, name, price, quantity, sizeID, customIDS FROM cart WHERE user_id = '$user_id'";
    $result_cart = mysqli_query($conn, $select_cart_query); 

    if ($result_cart && mysqli_num_rows($result_cart) > 0) {
        while ($fetch_cart = mysqli_fetch_assoc($result_cart)) {
            $customizations = '';
            if (!empty($fetch_cart['customIDS'])) {
                $custom_ids = explode(',', $fetch_cart['customIDS']);
                $customizations = implode(',', array_map('intval', $custom_ids));
            }
            var_dump($fetch_cart['sizeID']);
            $size_id = intval($fetch_cart['sizeID']);
            $insert_item_query = "INSERT INTO order_items (order_id, product_id, name, price, quantity, size, customizations) 
                                  VALUES ('$order_id', '$fetch_cart[pid]', '$fetch_cart[name]', '$fetch_cart[price]', 
                                          '$fetch_cart[quantity]','$size_id', 
                                          '$customizations')";
            mysqli_query($conn, $insert_item_query);
        }

        $delete_cart_query = "DELETE FROM cart WHERE user_id = '$user_id'";
        mysqli_query($conn, $delete_cart_query);

        echo "<script>
                alert('Your order has been successfully placed!');
                window.location = 'cart.php';
              </script>";
    } else {
        echo "Error: Cart is empty.";
    }
} else {
    echo "Error: " . mysqli_error($conn);
}
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        .order-container {
            max-width: 500px;
            margin: 50px auto;
            background: #fff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        h2 {
            text-align: center;
            margin-bottom: 20px;
            color: #333;
        }

        .grand-total h3 {
            text-align: center;
            color: #444;
            font-weight: bold;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .inputBox {
            display: flex;
            flex-direction: column;
        }

        .inputBox label {
            margin-bottom: 5px;
            font-size: 14px;
            color: #555;
        }

        .inputBox .box {
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 14px;
            width: 100%;
        }

        .inputBox select {
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 14px;
        }

        .btn {
            width: 100%;
            padding: 10px;
            background: #28a745;
            color: #fff;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s ease;
        }

        .btn:hover {
            background: #218838;
        }

        .grand-total span {
            color: #d9534f;
        }

        .back-button {
            margin-bottom: 20px;
        }

        .back-button a {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #333;
            text-decoration: none;
            font-size: 1rem;
            padding: 8px 12px;
            border-radius: 4px;
            transition: all 0.3s ease;
        }

        .back-button a:hover {
            background: #f5f5f5;
            color: #4CAF50;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }

        h1 {
            font-size: 2.5rem;
            margin-bottom: 2rem;
            color: #333;
        }

        .cart-container {
            display: grid;
            grid-template-columns: 1fr 350px;
            gap: 2rem;
        }

        .cart-header {
            display: grid;
            grid-template-columns: 3fr 1fr 1fr 1fr 40px;
            padding: 1rem 0;
            border-bottom: 1px solid #eee;
            font-size: 0.875rem;
            color: #666;
            text-transform: uppercase;
        }

        .cart-item {
            display: grid;
            grid-template-columns: 3fr 1fr 1fr 1fr 40px;
            padding: 1.5rem 0;
            border-bottom: 1px solid #eee;
            align-items: center;
        }

        .product-col {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .product-col img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 4px;
        }

        .product-details h3 {
            margin: 0;
            font-size: 1rem;
            color: #333;
        }

        .variant {
            margin: 0.25rem 0;
            color: #666;
            font-size: 0.875rem;
        }

        .toppings {
            margin: 0.25rem 0;
            color: #888;
            font-size: 0.875rem;
        }

        .quantity-controls {
            display: flex;
            align-items: center;
            border: 1px solid #ddd;
            border-radius: 4px;
            width: fit-content;
        }

        .quantity-btn {
            border: none;
            background: none;
            padding: 0.5rem 1rem;
            cursor: pointer;
            color: #666;
        }

        .quantity-input {
            width: 40px;
            text-align: center;
            border: none;
            padding: 0.5rem 0;
        }

        .remove-btn {
            border: none;
            background: none;
            font-size: 1.5rem;
            color: #999;
            cursor: pointer;
            padding: 0.25rem;
        }

        .order-summary {
            background: #f8f8f8;
            padding: 1.5rem;
            border-radius: 8px;
        }

        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 1rem 0;
            border-bottom: 1px solid #eee;
        }

        .coupon-row {
            padding: 1rem 0;
            border-bottom: 1px solid #eee;
        }

        .coupon-btn {
            border: none;
            background: none;
            color: #4CAF50;
            cursor: pointer;
            padding: 0;
        }

        .total {
            font-weight: bold;
            font-size: 1.125rem;
        }

        .checkout-btn {
            width: 100%;
            padding: 1rem;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            margin-top: 1rem;
            cursor: pointer;
            font-weight: bold;
        }

        .checkout-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }

        .empty-cart {
            text-align: center;
            padding: 2rem;
            color: #666;
            grid-column: 1 / -1;
        }
    </style>
</head>

<body>

    <div class="container">
        <div class="back-button">
            <a href="index.php"><i class="fas fa-arrow-left"></i> Back to Shop</a>
        </div>
        <h1>Your Cart</h1>

        <div class="cart-container">
            <div class="cart-items">
                <div class="cart-header">
                    <div class="product-col">PRODUCT</div>
                    <div class="price-col">PRICE</div>
                    <div class="quantity-col">QUANTITY</div>
                    <div class="total-col">TOTAL</div>
                    <div class="remove-col"></div>
                </div>

                <?php if (mysqli_num_rows($cart_result) > 0):
                    while ($item = mysqli_fetch_assoc($cart_result)):
                        $customization_names = [];
                        if (!empty($item['customIDS'])) {
                            $custom_ids = explode(',', $item['customIDS']);
                            if (!empty($custom_ids)) {
                                $custom_ids_string = implode(',', array_map('intval', $custom_ids));
                                $custom_query = "SELECT cusName FROM customization WHERE cusID IN ($custom_ids_string)";
                                $custom_result = mysqli_query($conn, $custom_query);
                                while ($custom = mysqli_fetch_assoc($custom_result)) {
                                    $customization_names[] = $custom['cusName'];
                                }
                            }
                        }
                        $item_total = $item['price'] * $item['quantity'];
                        $subtotal += $item_total;
                ?>
                        <div class="cart-item">
                            <div class="product-col">
                                <img src="uploaded_img/<?= $item['image'] ?>" alt="<?= $item['name'] ?>">
                                <div class="product-details">
                                    <h3><?= $item['name'] ?></h3>
                                    <p class="variant"><?= $item['sizename'] ?? 'Regular' ?></p>
                                    <?php if (!empty($customization_names)): ?>
                                        <p class="toppings"><?= implode(', ', $customization_names) ?></p>
                                    <?php endif; ?>
                                </div>
                            </div>
                            <div class="price-col">₱<?= number_format($item['price'], 2) ?></div>
                            <div class="quantity-col">
                                <div class="quantity-controls">
                                    <button type="button" class="quantity-btn minus" onclick="updateQuantity(<?= $item['id'] ?>, -1)">−</button>
                                    <input type="number" value="<?= $item['quantity'] ?>" min="1" readonly class="quantity-input" id="qty_<?= $item['id'] ?>">
                                    <button type="button" class="quantity-btn plus" onclick="updateQuantity(<?= $item['id'] ?>, 1)">+</button>
                                </div>
                            </div>
                            <div class="total-col">₱<?= number_format($item_total, 2) ?></div>
                            <div class="remove-col">
                                <button onclick="removeItem(<?= $item['id'] ?>)" class="remove-btn">×</button>
                            </div>
                        </div>
                    <?php
                    endwhile;
                else: ?>
                    <div class="empty-cart">Your cart is empty</div>
                <?php endif; ?>
            </div>

            <div class="order-summary">
                <h2>Order Summary</h2>
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>₱<?= number_format($subtotal, 2) ?></span>
                </div>
                <div class="summary-row">
                    <span>Shipping</span>
                    <span>Free</span>
                </div>
                <div class="coupon-row">
                    <button class="coupon-btn">Add coupon code →</button>
                </div>
                <div class="summary-row total">
                    <span>Total</span>
                    <span>₱<?= number_format($subtotal, 2) ?></span>
                </div>

                <section class="order" id="order">
                    <div class="order-container">
                        <h2></h2>
                        <form action="" method="post">
                            <input type="hidden" name="total_products" value="<?= $total_products; ?>">
                            <input type="hidden" name="total_price" value="<?= $grand_total; ?>">

                            <div class="form-group">
                                <div class="inputBox">
                                    <label for="name">Name</label>
                                    <input type="text" id="name" name="name" class="box" required placeholder="Enter your name" maxlength="20">
                                </div>
                                <div class="inputBox">
                                    <label for="number">Phone Number</label>
                                    <input type="number" id="number" name="number" class="box" required placeholder="Enter your number" min="0" max="9999999999" onkeypress="if(this.value.length == 10) return false;">
                                </div>
                                <div class="inputBox">
                                    <label for="method">Payment Method</label>
                                    <select id="method" name="method" class="box">
                                        <option value="Cash on delivery">Cash on delivery</option>
                                        <option value="Credit card">Credit card</option>
                                        <option value="Gcash">Gcash</option>
                                        <option value="Paypal">Paypal</option>
                                    </select>
                                </div>
                                <div class="inputBox">
                                    <label for="flat">Address</label>
                                    <input type="text" id="flat" name="flat" class="box" required placeholder="Enter your address">
                                </div>
                            </div>

                            <button class="checkout-btn" <?= ($subtotal > 0) ? '' : 'disabled' ?>>
                                CHECKOUT
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    </div>
    <script src="js/api.js"></script>
    <script src="js/cart.js"></script>
</body>
</html>
