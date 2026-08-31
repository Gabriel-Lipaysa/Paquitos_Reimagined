<?php
/**
 * Secure File Upload Handler
 * Validates file type, size, and prevents directory traversal
 */

class FileUploadHandler {
    private $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    private $max_size = 5242880; // 5MB
    private $upload_dir = 'uploaded_img/';
    
    /**
     * Validate and upload file
     * 
     * @param array $file $_FILES array element
     * @param string $custom_dir Optional custom directory
     * @return array ['success' => bool, 'filename' => string, 'error' => string]
     */
    public function upload($file, $custom_dir = '') {
        $dir = empty($custom_dir) ? $this->upload_dir : $custom_dir;
        
        // Check if file was uploaded
        if (!isset($file['tmp_name']) || $file['tmp_name'] == '') {
            return ['success' => false, 'error' => 'No file uploaded'];
        }
        
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errors = [
                UPLOAD_ERR_INI_SIZE => 'File exceeds server maximum size',
                UPLOAD_ERR_FORM_SIZE => 'File exceeds form maximum size',
                UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
                UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
                UPLOAD_ERR_CANT_WRITE => 'Failed to write file',
                UPLOAD_ERR_EXTENSION => 'Upload stopped by extension'
            ];
            return ['success' => false, 'error' => $errors[$file['error']] ?? 'Unknown error'];
        }
        
        // Check file size
        if ($file['size'] > $this->max_size) {
            return ['success' => false, 'error' => 'File exceeds maximum size of 5MB'];
        }
        
        // Get file info
        $file_name = $file['name'];
        $file_tmp = $file['tmp_name'];
        $file_size = $file['size'];
        
        // Get file extension
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        
        // Validate extension
        $allowed_ext = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($file_ext, $allowed_ext)) {
            return ['success' => false, 'error' => 'Invalid file type. Allowed: JPG, PNG, GIF, WEBP'];
        }
        
        // Check MIME type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $file_tmp);
        finfo_close($finfo);
        
        if (!in_array($mime_type, $this->allowed_types)) {
            return ['success' => false, 'error' => 'File MIME type is not allowed'];
        }
        
        // Generate unique filename to prevent directory traversal
        $new_filename = uniqid('img_', true) . '.' . $file_ext;
        
        // Ensure directory exists
        if (!file_exists($dir)) {
            mkdir($dir, 0755, true);
        }
        
        // Safe path - prevent directory traversal
        $target_path = realpath($dir) . DIRECTORY_SEPARATOR . $new_filename;
        $real_dir = realpath($dir);
        
        // Verify the target is within upload directory
        if (strpos($target_path, $real_dir) !== 0) {
            return ['success' => false, 'error' => 'Invalid upload path'];
        }
        
        // Move file
        if (move_uploaded_file($file_tmp, $target_path)) {
            // Set proper permissions
            chmod($target_path, 0644);
            return ['success' => true, 'filename' => $new_filename];
        } else {
            return ['success' => false, 'error' => 'Failed to move uploaded file'];
        }
    }
    
    /**
     * Delete file safely
     * 
     * @param string $filename Filename to delete
     * @param string $custom_dir Optional custom directory
     * @return bool True on success
     */
    public function delete($filename, $custom_dir = '') {
        $dir = empty($custom_dir) ? $this->upload_dir : $custom_dir;
        
        // Prevent directory traversal
        if (strpos($filename, '/') !== false || strpos($filename, '\\') !== false) {
            return false;
        }
        
        $file_path = $dir . $filename;
        
        if (file_exists($file_path) && is_file($file_path)) {
            return unlink($file_path);
        }
        
        return false;
    }
    
    /**
     * Set maximum file size
     * 
     * @param int $bytes Maximum size in bytes
     */
    public function setMaxSize($bytes) {
        $this->max_size = $bytes;
    }
    
    /**
     * Set allowed MIME types
     * 
     * @param array $types Array of MIME types
     */
    public function setAllowedTypes($types) {
        $this->allowed_types = $types;
    }
}

?>
