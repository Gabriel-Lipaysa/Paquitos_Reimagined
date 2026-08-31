<?php
/**
 * Toast/UI Helper Functions
 * Provides utilities for displaying toasts, field indicators, and improved forms
 */

/**
 * Display toast messages from PHP session
 * Usage: echo displayToastMessages();
 * 
 * @return string HTML for hidden elements with toast data
 */
function displayToastMessages() {
    $output = '';
    
    if (isset($_SESSION['message'])) {
        $message = $_SESSION['message'];
        $type = isset($_SESSION['message_type']) ? $_SESSION['message_type'] : 'info';
        $output .= sprintf(
            '<div data-toast-message="%s" data-toast-type="%s" style="display:none;"></div>',
            htmlspecialchars($message, ENT_QUOTES, 'UTF-8'),
            htmlspecialchars($type, ENT_QUOTES, 'UTF-8')
        );
        unset($_SESSION['message']);
        unset($_SESSION['message_type']);
    }
    
    // Handle multiple messages (array)
    if (isset($_SESSION['messages']) && is_array($_SESSION['messages'])) {
        foreach ($_SESSION['messages'] as $msg) {
            $type = isset($msg['type']) ? $msg['type'] : 'info';
            $text = isset($msg['text']) ? $msg['text'] : $msg;
            $output .= sprintf(
                '<div data-toast-message="%s" data-toast-type="%s" style="display:none;"></div>',
                htmlspecialchars($text, ENT_QUOTES, 'UTF-8'),
                htmlspecialchars($type, ENT_QUOTES, 'UTF-8')
            );
        }
        unset($_SESSION['messages']);
    }
    
    return $output;
}

/**
 * Set a toast message in session
 * Usage: setToastMessage('Profile updated!', 'success');
 * 
 * @param string $message Message text
 * @param string $type Type: 'success', 'error', 'warning', 'info'
 */
function setToastMessage($message, $type = 'info') {
    $_SESSION['message'] = $message;
    $_SESSION['message_type'] = $type;
}

/**
 * Add a message to messages array
 * Usage: addToastMessage('Product added', 'success');
 * 
 * @param string $message Message text
 * @param string $type Type: 'success', 'error', 'warning', 'info'
 */
function addToastMessage($message, $type = 'info') {
    if (!isset($_SESSION['messages'])) {
        $_SESSION['messages'] = [];
    }
    $_SESSION['messages'][] = [
        'text' => $message,
        'type' => $type
    ];
}

/**
 * Generate form field with label and indicator
 * Usage: echo formField('email', 'Email Address', 'email', true, 'Enter your email');
 * 
 * @param string $name Field name
 * @param string $label Field label
 * @param string $type Input type (text, email, password, etc.)
 * @param bool $required Is field required
 * @param string $placeholder Placeholder text
 * @param string $value Current value
 * @param array $attributes Additional HTML attributes
 * @return string HTML form field
 */
function formField($name, $label, $type = 'text', $required = false, $placeholder = '', $value = '', $attributes = []) {
    $requiredStr = $required ? 'required' : '';
    $requiredAttr = $required ? ' required' : '';
    $asterisk = $required ? '<span class="required-asterisk">*</span>' : '';
    $indicator = $required ? 
        '<span class="field-indicator required">Required</span>' : 
        '<span class="field-indicator optional">Optional</span>';
    
    $attrs = '';
    foreach ($attributes as $key => $val) {
        $attrs .= sprintf(' %s="%s"', $key, htmlspecialchars($val, ENT_QUOTES, 'UTF-8'));
    }
    
    return sprintf(
        '<div class="form-group">
            <label class="form-label">
                %s
                %s
                %s
            </label>
            <input 
                type="%s" 
                name="%s" 
                class="form-input" 
                placeholder="%s" 
                value="%s"
                %s%s
            />
        </div>',
        htmlspecialchars($label, ENT_QUOTES, 'UTF-8'),
        $asterisk,
        $indicator,
        htmlspecialchars($type, ENT_QUOTES, 'UTF-8'),
        htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
        htmlspecialchars($placeholder, ENT_QUOTES, 'UTF-8'),
        htmlspecialchars($value, ENT_QUOTES, 'UTF-8'),
        $requiredAttr,
        $attrs
    );
}

/**
 * Generate textarea field with label and indicator
 * 
 * @param string $name Field name
 * @param string $label Field label
 * @param bool $required Is field required
 * @param string $placeholder Placeholder text
 * @param string $value Current value
 * @param int $rows Number of rows
 * @return string HTML textarea field
 */
function formTextarea($name, $label, $required = false, $placeholder = '', $value = '', $rows = 5) {
    $requiredAttr = $required ? ' required' : '';
    $asterisk = $required ? '<span class="required-asterisk">*</span>' : '';
    $indicator = $required ? 
        '<span class="field-indicator required">Required</span>' : 
        '<span class="field-indicator optional">Optional</span>';
    
    return sprintf(
        '<div class="form-group">
            <label class="form-label">
                %s
                %s
                %s
            </label>
            <textarea 
                name="%s" 
                class="form-textarea" 
                placeholder="%s"
                rows="%d"
                %s
            >%s</textarea>
        </div>',
        htmlspecialchars($label, ENT_QUOTES, 'UTF-8'),
        $asterisk,
        $indicator,
        htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
        htmlspecialchars($placeholder, ENT_QUOTES, 'UTF-8'),
        (int)$rows,
        $requiredAttr,
        htmlspecialchars($value, ENT_QUOTES, 'UTF-8')
    );
}

/**
 * Generate select field with label and indicator
 * 
 * @param string $name Field name
 * @param string $label Field label
 * @param array $options Options array ['value' => 'Label']
 * @param bool $required Is field required
 * @param string $selected Selected value
 * @return string HTML select field
 */
function formSelect($name, $label, $options = [], $required = false, $selected = '') {
    $requiredAttr = $required ? ' required' : '';
    $asterisk = $required ? '<span class="required-asterisk">*</span>' : '';
    $indicator = $required ? 
        '<span class="field-indicator required">Required</span>' : 
        '<span class="field-indicator optional">Optional</span>';
    
    $optionsHtml = '';
    if ($required) {
        $optionsHtml .= '<option value="">-- Select --</option>';
    }
    
    foreach ($options as $value => $label_text) {
        $sel = ($value === $selected || $value == $selected) ? ' selected' : '';
        $optionsHtml .= sprintf(
            '<option value="%s"%s>%s</option>',
            htmlspecialchars($value, ENT_QUOTES, 'UTF-8'),
            $sel,
            htmlspecialchars($label_text, ENT_QUOTES, 'UTF-8')
        );
    }
    
    return sprintf(
        '<div class="form-group">
            <label class="form-label">
                %s
                %s
                %s
            </label>
            <select name="%s" class="form-select"%s>
                %s
            </select>
        </div>',
        htmlspecialchars($label, ENT_QUOTES, 'UTF-8'),
        $asterisk,
        $indicator,
        htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
        $requiredAttr,
        $optionsHtml
    );
}

/**
 * Generate form button
 * 
 * @param string $label Button label
 * @param string $type Button type (submit, button, reset)
 * @param string $name Button name
 * @param array $attributes Additional HTML attributes
 * @return string HTML button
 */
function formButton($label, $type = 'submit', $name = '', $attributes = []) {
    $nameAttr = $name ? sprintf(' name="%s"', htmlspecialchars($name, ENT_QUOTES, 'UTF-8')) : '';
    
    $attrs = '';
    foreach ($attributes as $key => $val) {
        $attrs .= sprintf(' %s="%s"', $key, htmlspecialchars($val, ENT_QUOTES, 'UTF-8'));
    }
    
    return sprintf(
        '<button type="%s" class="form-button"%s%s>%s</button>',
        htmlspecialchars($type, ENT_QUOTES, 'UTF-8'),
        $nameAttr,
        $attrs,
        htmlspecialchars($label, ENT_QUOTES, 'UTF-8')
    );
}

/**
 * Start a form group row (for side-by-side fields)
 * 
 * @param bool $full If true, only one field per row
 * @return string HTML opening div
 */
function startFormRow($full = false) {
    $class = $full ? 'form-row full' : 'form-row';
    return sprintf('<div class="%s">', $class);
}

/**
 * End a form group row
 * 
 * @return string HTML closing div
 */
function endFormRow() {
    return '</div>';
}

/**
 * Generate a complete form card
 * 
 * @param string $title Form title
 * @param string $content Form content HTML
 * @param string $classes Additional CSS classes
 * @return string HTML form card
 */
function formCard($title, $content, $classes = '') {
    return sprintf(
        '<div class="form-card %s">
            <h2 class="form-title">%s</h2>
            %s
        </div>',
        htmlspecialchars($classes, ENT_QUOTES, 'UTF-8'),
        htmlspecialchars($title, ENT_QUOTES, 'UTF-8'),
        $content
    );
}

/**
 * Generate error message display
 * 
 * @param string $message Error message
 * @return string HTML error alert
 */
function errorAlert($message) {
    return sprintf(
        '<div class="toast error" style="position: relative;">
            <div class="toast-icon"></div>
            <div class="toast-message">%s</div>
        </div>',
        htmlspecialchars($message, ENT_QUOTES, 'UTF-8')
    );
}

/**
 * Generate success message display
 * 
 * @param string $message Success message
 * @return string HTML success alert
 */
function successAlert($message) {
    return sprintf(
        '<div class="toast success" style="position: relative;">
            <div class="toast-icon"></div>
            <div class="toast-message">%s</div>
        </div>',
        htmlspecialchars($message, ENT_QUOTES, 'UTF-8')
    );
}

?>
