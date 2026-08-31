<?php
include 'config.php';
include 'auth_helper.php';
include 'db_helper.php';
include 'security_helper.php';
include 'file_upload_handler.php';
include 'ui_helper.php';

requireAdminLogin();
$admin_id = getCurrentAdminId();

if (isset($_POST['add_product'])) {
   // Validate required fields
   $required_fields = ['name', 'price', 'quantity', 'description'];
   $missing = SecurityHelper::validateRequired($_POST, $required_fields);
   
   if (!empty($missing)) {
      addToastMessage('Please fill in all required fields!', 'warning');
   } else {
      // Sanitize and validate input
      $name = SecurityHelper::sanitizeString($_POST['name']);
      $price = SecurityHelper::sanitizeString($_POST['price']);
      $quantity = SecurityHelper::sanitizeString($_POST['quantity']);
      $description = SecurityHelper::sanitizeString($_POST['description']);
      
      // Validate data types
      if (!SecurityHelper::validateString($name, 1, 100)) {
         addToastMessage('Product name must be between 1-100 characters!', 'error');
      } else if (!is_numeric($price) || $price < 0) {
         addToastMessage('Price must be a positive number!', 'error');
      } else if (!is_numeric($quantity) || $quantity < 0) {
         addToastMessage('Quantity must be a positive number!', 'error');
      } else if (!SecurityHelper::validateString($description, 0, 500)) {
         addToastMessage('Description must not exceed 500 characters!', 'error');
      } else {
         // Check if product already exists using prepared statement
         $check_query = "SELECT id FROM `products` WHERE name = ?";
         $result = executeQuery($check_query, "s", [$name]);
         
         if (!$result) {
            addToastMessage('Database error occurred!', 'error');
         } else if ($result->num_rows > 0) {
            addToastMessage('Product name already exists!', 'error');
         } else {
            // Handle file upload
            $uploader = new FileUploadHandler();
            $upload_result = $uploader->upload($_FILES['image']);
            
            if ($upload_result['success']) {
               $image_name = $upload_result['filename'];
               $created_at = date('Y-m-d H:i:s');
               
               // Insert product using prepared statement
               $insert_query = "INSERT INTO `products` (name, price, quantity, description, image, date) 
                               VALUES (?, ?, ?, ?, ?, ?)";
               
               if (executeUpdate($insert_query, "sdiiss", 
                  [$name, (float)$price, (int)$quantity, $description, $image_name, $created_at])) {
                  addToastMessage('New product added successfully! Redirecting...', 'success');
                  header('Refresh: 2; url=admin_products.php');
               } else {
                  addToastMessage('Failed to add product to database!', 'error');
                  // Remove uploaded file if DB insert fails
                  $uploader->delete($image_name);
               }
            } else {
               addToastMessage($upload_result['error'], 'error');
            }
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
   <title>Add Product</title>

   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">
   <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
   <link rel="stylesheet" href="css/admin_style.css">
   <link rel="stylesheet" href="css/toast.css">
   <style>
   html,
      body {
         margin: 0;
         padding: 0;
         height: 100%;
         overflow: hidden;
      }

      body {
         font-family: 'Roboto', sans-serif;
         background-color: #f9fafc;
         color: #333;
         padding: 20px;
         display: flex;
         flex-direction: column;
      }

      main {
         flex: 1 1 auto;
         overflow-y: auto;
         margin-top: 80px;
         margin-left: 250px;
         padding: 20px;
         width: calc(100% - 250px);
         background-color: #fff;
         box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
         border-radius: 8px;
      }

      .heading {
         text-align: center;
         font-size: 2.5rem;
         margin-bottom: 20px;
         color: #2c3e50;
      }

      .add-products {
         margin-top: 50px;
         width: 100%;
         padding: 30px;
         background-color: #fff;
         border-radius: 10px;
         box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
         display: flex;
         flex-direction: column;
         align-items: center;
         box-sizing: border-box;
      }

      .add-products input,
      .add-products textarea {
         width: 100%;
         padding: 12px;
         margin: 10px 0;
         border-radius: 5px;
         border: 1px solid #ddd;
         font-size: 1rem;
         transition: 0.3s ease;
         box-sizing: border-box;
      }

      .box {
         background-color: #f9f9f9;
         border: 1px solid #ddd;
         border-radius: 8px;
         box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
      }

      @media (max-width: 768px) {
         .heading {
            font-size: 2rem;
         }

         .add-products {
            padding: 20px;
         }
      }


      .form-container {
         width: 80%;
         max-width: 800px;
         margin: 20px auto;
         padding: 20px;
         background-color: #fff;
         border-radius: 8px;

      }

      .form-row {
         display: flex;
         gap: 30px;
         align-items: flex-start;
      }

      .image-column {
         flex: 1;
         max-width: 300px;
      }

      .details-column {
         flex: 2;
      }

      .image-preview {
         width: 100%;
         min-height: 200px;
         border: 2px dashed #ddd;
         border-radius: 8px;
         display: flex;
         align-items: center;
         justify-content: center;
         margin-bottom: 10px;
         overflow: hidden;
      }

      .image-preview img {
         max-width: 100%;
         max-height: 200px;
         object-fit: contain;
      }

      .file-input-container {
         width: 100%;
         margin-top: 10px;
      }


      .submit-btn {
         width: 100%;
         padding: 12px;
         background-color: #4CAF50;
         color: white;
         border: none;
         border-radius: 4px;
         cursor: pointer;
         font-size: 16px;
         margin-top: 20px;
      }

      .submit-btn:hover {
         background-color: #45a049;
      }

      .add-products form .box {
         width: 100%;
         padding: 1.4rem;
         font-size: 1rem;
         padding: 12px;
         margin: 10px 0;
         border-radius: 5px;
         border: 1px solid #ddd;
         margin: 1rem 0;
         background-color: var(--white);
      }

      .alert-success {
         background-color: #dff0d8;
         color: #3c763d;
         padding: 10px;
         border-radius: 5px;
         margin-top: 15px;
         text-align: center;

      }

      section {
         max-height: 600px;
      }

      .form-container {
         min-height: 60%;
         display: flex;
         align-items: center;
         justify-content: center;
      }
   </style>
</head>

<body>

   <main>
      <?php include 'admin_header.php'; ?>

      <section class="add-products">
         <h1 class="heading">Add New Product</h1>
         
         <?php echo displayToastMessages(); ?>

         <div class="form-container">
            <form method="POST" enctype="multipart/form-data" id="addProductForm">
               <div class="form-row">
                  <div class="image-column">
                     <div class="form-group">
                        <label class="form-label">
                           Product Image <span class="required-asterisk">*</span>
                           <span class="field-indicator required">Required</span>
                        </label>
                        <div class="image-preview" id="imagePreview">
                           <span>📷 Click to preview</span>
                        </div>
                        <div class="file-input-container">
                           <input type="file" name="image" accept="image/*" class="form-control form-input" required style="padding: 8px;">
                           <small class="form-hint">JPG, PNG, GIF, WEBP (Max 5MB)</small>
                        </div>
                     </div>
                  </div>
                  <div class="details-column">
                     <?php echo formField('name', 'Product Name', 'text', true, 'e.g., Margherita Pizza', ''); ?>
                     <?php echo formField('price', 'Price (₱)', 'number', true, 'e.g., 299.99', '', ['step' => '0.01', 'min' => '0']); ?>
                     <?php echo formField('quantity', 'Stock Quantity', 'number', true, 'e.g., 50', '', ['min' => '0']); ?>
                     <?php echo formTextarea('description', 'Description', false, 'Enter product details...', '', 4); ?>
                     <button type="submit" name="add_product" class="form-button">
                        <i class="fas fa-plus"></i> Add Product
                     </button>
                  </div>
               </div>
            </form>
         </div>
      </section>
   </main>
   <script src="js/admin_table.js"></script>
   <script>
      document.querySelector('input[name="image"]').addEventListener('change', function(e) {
         AdminTable.previewImage(e, 'imagePreview');
      });
   </script>
   <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>