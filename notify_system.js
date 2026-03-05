/**
 * VANTIX BIO - EMAIL NOTIFICATION SYSTEM
 * Two-layer storage: localStorage fallback + optional endpoint
 * Lightweight, dependency-free, future-proof
 */

// Email capture state
const NotifySystem = {
  
  /**
   * Open notify modal for a product
   * @param {string} productName - Display name
   * @param {string} sku - Product SKU code
   * @param {string} category - Product category
   */
  openModal: function(productName, sku, category) {
    const modal = document.getElementById('notifyModal');
    const productNameEl = document.getElementById('notifyProductName');
    
    if (!modal || !productNameEl) return;
    
    // Store current product context
    modal.dataset.product = productName;
    modal.dataset.sku = sku;
    modal.dataset.category = category;
    
    // Update modal text
    productNameEl.textContent = productName;
    
    // Reset form
    document.getElementById('notifyEmail').value = '';
    document.getElementById('notifySuccess').style.display = 'none';
    document.getElementById('notifyError').style.display = 'none';
    
    // Show modal
    modal.style.display = 'flex';
    
    // Focus email input
    setTimeout(() => {
      document.getElementById('notifyEmail').focus();
    }, 100);
  },
  
  /**
   * Close notify modal
   */
  closeModal: function() {
    const modal = document.getElementById('notifyModal');
    if (modal) {
      modal.style.display = 'none';
    }
  },
  
  /**
   * Validate email format
   * @param {string} email
   * @returns {boolean}
   */
  validateEmail: function(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  },
  
  /**
   * Check if email already subscribed to this product
   * @param {string} email
   * @param {string} sku
   * @returns {boolean}
   */
  isDuplicate: function(email, sku) {
    const stored = this.getStoredNotifications();
    return stored.some(item => 
      item.email.toLowerCase() === email.toLowerCase() && 
      item.sku === sku
    );
  },
  
  /**
   * Get all stored notifications from localStorage
   * @returns {Array}
   */
  getStoredNotifications: function() {
    try {
      const data = localStorage.getItem('vantixNotifications');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading notifications:', e);
      return [];
    }
  },
  
  /**
   * Store notification locally (Layer A)
   * @param {Object} data
   */
  storeLocally: function(data) {
    try {
      const stored = this.getStoredNotifications();
      stored.push(data);
      localStorage.setItem('vantixNotifications', JSON.stringify(stored));
      return true;
    } catch (e) {
      console.error('Error storing notification:', e);
      return false;
    }
  },
  
  /**
   * Send notification to endpoint (Layer B - optional)
   * @param {Object} data
   * @returns {Promise}
   */
  sendToEndpoint: async function(data) {
    if (typeof VX_NOTIFY_ENDPOINT === 'undefined' || !VX_NOTIFY_ENDPOINT) {
      // Endpoint not configured - skip network request
      return Promise.resolve({ status: 'skipped', reason: 'no_endpoint' });
    }
    
    try {
      const response = await fetch(VX_NOTIFY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Network request failed:', error);
      // Don't throw - local storage still worked
      return { status: 'error', error: error.message };
    }
  },
  
  /**
   * Submit notification request
   */
  submit: async function() {
    const modal = document.getElementById('notifyModal');
    const emailInput = document.getElementById('notifyEmail');
    const successEl = document.getElementById('notifySuccess');
    const errorEl = document.getElementById('notifyError');
    const submitBtn = document.getElementById('notifySubmitBtn');
    
    const email = emailInput.value.trim();
    const productName = modal.dataset.product;
    const sku = modal.dataset.sku;
    const category = modal.dataset.category;
    
    // Validate email
    if (!this.validateEmail(email)) {
      errorEl.textContent = 'Please enter a valid email address';
      errorEl.style.display = 'block';
      return;
    }
    
    // Check for duplicate
    if (this.isDuplicate(email, sku)) {
      errorEl.textContent = 'You\'re already on the list for this product';
      errorEl.style.display = 'block';
      return;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    // Prepare data
    const data = {
      email: email,
      product: productName,
      sku: sku,
      category: category,
      timestamp: new Date().toISOString(),
      pageUrl: window.location.href,
      source: 'shop_notify_modal'
    };
    
    // Layer A: Store locally (always)
    const localSuccess = this.storeLocally(data);
    
    if (!localSuccess) {
      errorEl.textContent = 'Error saving request. Please try again.';
      errorEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Notify Me';
      return;
    }
    
    // Layer B: Send to endpoint (if configured)
    await this.sendToEndpoint(data);
    
    // Show success
    successEl.innerHTML = `✅ You're on the list.<br>We'll notify you when <strong>${productName}</strong> launches.`;
    successEl.style.display = 'block';
    errorEl.style.display = 'none';
    
    // Close modal after delay
    setTimeout(() => {
      this.closeModal();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Notify Me';
    }, 3000);
  }
};

// Initialize modal event listeners
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('notifyModal');
  
  if (!modal) return;
  
  // Close on ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      NotifySystem.closeModal();
    }
  });
  
  // Close when clicking outside
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      NotifySystem.closeModal();
    }
  });
  
  // Submit on Enter key in email input
  const emailInput = document.getElementById('notifyEmail');
  if (emailInput) {
    emailInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        NotifySystem.submit();
      }
    });
  }
});

// Export for use in HTML onclick handlers
window.NotifySystem = NotifySystem;
