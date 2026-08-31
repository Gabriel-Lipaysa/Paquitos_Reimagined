<?php
include 'config.php';
include 'db_helper.php';
include 'security_helper.php';

session_start();
include 'customer_header.php';

function isProductInFavorites($user_id, $product_id) {
    // Use prepared statement to prevent SQL injection
    $query = "SELECT * FROM `favorites` WHERE `user_id` = ? AND `product_id` = ?";
    $result = executeQuery($query, "ii", [$user_id, $product_id]);
    return $result && $result->num_rows > 0;
}

if (isset($_POST['add_to_favorites'])) {
    // Validate required fields
    $required_fields = ['pid', 'name', 'price', 'image'];
    $missing = SecurityHelper::validateRequired($_POST, $required_fields);
    
    if (!empty($missing)) {
        echo "<script>alert('Missing required information');</script>";
    } else {
        $pid = SecurityHelper::validateInteger($_POST['pid']);
        $name = SecurityHelper::sanitizeString($_POST['name']);
        $price = SecurityHelper::sanitizeString($_POST['price']);
        $image = SecurityHelper::sanitizeString($_POST['image']);
        
        if (!$pid || $pid === false) {
            echo "<script>alert('Invalid product ID');</script>";
        } else if (isset($_SESSION['user_id'])) {
            $user_id = $_SESSION['user_id'];
            
            if (!isProductInFavorites($user_id, $pid)) {
                // Use prepared statement for INSERT
                $insert_query = "INSERT INTO `favorites` (`user_id`, `product_id`, `name`, `price`, `image`) VALUES (?, ?, ?, ?, ?)";
                
                if (executeUpdate($insert_query, "iisss", [$user_id, $pid, $name, $price, $image])) {
                    $msg = 'Product added to favorites';
                    echo "<script>alert(" . json_encode($msg, JSON_HEX_QUOT | JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP) . "); window.location.href = 'customer_menu.php';</script>";
                } else {
                    $msg = 'Failed to add to favorites: ' . getError();
                    echo "<script>alert(" . json_encode($msg, JSON_HEX_QUOT | JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP) . ");</script>";
                }
            } else {
                $msg = 'Product already in favorites';
                echo "<script>alert(" . json_encode($msg, JSON_HEX_QUOT | JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP) . ");</script>";
            }
        } else {
            $msg = 'Please log in first';
            echo "<script>alert(" . json_encode($msg, JSON_HEX_QUOT | JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP) . ");</script>";
        }
    }
}
?>


?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Paquito's Pizza</title>
    <link rel="icon" type="image/png" href="images/pizzalogo32x32.png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">
    <link rel="stylesheet" href="css/style.css">
 
</head>

<body>



<section id="menu" class="menu">
    <br><br>
    <h1 class="heading">Our Menu</h1>
    <div class="search-filter-container">
  <div class="search-filter-wrapper">
    <div class="search-box">
      <input type="text" class="search-input" placeholder="Search our menu..." id="menuSearch">
      <i class="fas fa-search search-icon"></i>
    </div>
    <div class="price-filters">
      <button class="price-btn active" data-price="all">All Prices</button>
      <button class="price-btn" data-price="200">Under ₱200</button>
      <button class="price-btn" data-price="400">₱200 - ₱400</button>
      <button class="price-btn" data-price="600">₱400 - ₱600</button>
      <button class="price-btn" data-price="601">Over ₱600</button>
    </div>
  </div>
</div>
    <?php
    // Use prepared statement to prevent SQL injection
    $select_products_query = "SELECT * FROM `products`";
    $result_products = executeQuery($select_products_query);

    if ($result_products && $result_products->num_rows > 0) {
        echo '<div class="box-container">';
        while ($fetch_products = $result_products->fetch_assoc()) {
    ?>

            <div class="box">
                <div class="price">₱<?= SecurityHelper::escape($fetch_products['price']) ?></div>
                <img src="uploaded_img/<?= SecurityHelper::escape($fetch_products['image']) ?>" alt="<?= SecurityHelper::escape($fetch_products['name']) ?>">
                <div class="name"><?= SecurityHelper::escape($fetch_products['name']) ?></div>

                <div class="product-actions" style="display: flex; align-items: center; gap: 10px;">
                    <form action="" method="post" style="margin: 0;">
                        <input type="hidden" name="pid" value="<?= SecurityHelper::escape($fetch_products['id']) ?>">
                        <input type="hidden" name="name" value="<?= SecurityHelper::escape($fetch_products['name']) ?>">
                        <input type="hidden" name="price" value="<?= SecurityHelper::escape($fetch_products['price']) ?>">
                        <input type="hidden" name="image" value="<?= SecurityHelper::escape($fetch_products['image']) ?>">

                        <button type="submit" class="favorite-btn" name="add_to_favorites" title="Add to Favorites">
                            <?php 
                            if (isset($_SESSION['user_id']) && isProductInFavorites($_SESSION['user_id'], $fetch_products['id'])) {
                                echo '<i class="fas fa-heart"></i>'; 
                            } else {
                                echo '<i class="far fa-heart"></i>';
                            }
                            ?>
                        </button>
                    </form>

                    <form action="product_details.php" method="post" style="margin: 0;">
                        <input type="hidden" name="pid" value="<?= SecurityHelper::escape($fetch_products['id']) ?>">
                        <input type="hidden" name="name" value="<?= SecurityHelper::escape($fetch_products['name']) ?>">
                        <input type="hidden" name="price" value="<?= $fetch_products['price'] ?>">
                        <input type="hidden" name="image" value="<?= $fetch_products['image'] ?>">
                        <input type="submit" class="cart-btn" name="add_to_cart" value="Add to Cart">
                    </form>
                </div>
            </div>
    <?php
        }
        echo '</div>';
    } else {
        echo '<p class="empty">No products available at the moment!</p>';
    }
    ?>
</section>

<script src="js/script.js"></script>
<script src="js/menu_filter.js"></script>

</body>
</html>


<style>
    .menu{
        margin-top: 100px;
    }
    .box {
    transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
}

.no-results-message {
    text-align: center;
    padding: 20px;
    color: #666;
    width: 100%;
}
.search-filter-container {

  max-width: 1200px;
 
  padding: 0 15px;
  margin-bottom: 20px;
}

.search-filter-wrapper {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-box {
  position: relative;
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: lightgreen;
  box-shadow: 0 0 0 2px rgba(255, 77, 77, 0.1);
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.price-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.price-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.price-btn:hover {
  background:#333333;
  color: #fff;
  border-color: #333333;
}

.price-btn.active {
  background: green;
  color: #fff;
  border-color: darkgreen;
}

@media (max-width: 768px) {
  .search-filter-wrapper {
    padding: 15px;
  }
  
  .price-filters {
    justify-content: center;
  }
  
  .price-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>