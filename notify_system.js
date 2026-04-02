// notify_system.js - Email notification system for Phase 2 products
// Version 1.1 - March 5, 2026

const NotifySystem = {
    // Local queue (localStorage backup)
    queue: JSON.parse(localStorage.getItem('vxNotifyQueue') || '[]'),
    
    // Backend endpoint (Google Apps Script)
    endpoint: 'https://script.google.com/macros/s/AKfycbzyizJvjL3mWE-U-fKdO4bru9hk1yCY1MKTjMzrwayiGIlIs9os7f8mL4HbdDD-vEj2/exec',
    
    // Add email to notification queue (with dedupe and error handling)
    addToQueue(email, product, sku, category) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { success: false, error: 'invalid_email', message: 'Please enter a valid email address.' };
        }
        
        const normalizedEmail = email.toLowerCase().trim();
        
        // Dedupe check: email + SKU combo
        const exists = this.queue.find(item => 
            item.email === normalizedEmail && item.sku === sku
        );
        
        if (exists) {
            return { success: false, error: 'duplicate', message: "You're already on the list for this item." };
        }
        
        // Create entry with full context
        const entry = {
            email: normalizedEmail,
            product: product,
            sku: sku,
            category: category,
            timestamp: Date.now(),
            pageUrl: window.location.href,
            source: 'shop_page',
            status: 'pending'
        };
        
        // Add to queue
        this.queue.push(entry);
        localStorage.setItem('vxNotifyQueue', JSON.stringify(this.queue));
        
        // Send to backend if endpoint configured (async, non-blocking)
        if (this.endpoint) {
            this.sendToBackend(entry).catch(err => {
                console.warn('Backend sync failed (saved locally):', err);
            });
        }
        
        return { success: true, savedLocally: !this.endpoint };
    },
    
    // Send notification request to backend
    async sendToBackend(entry) {
        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'launch_notify',
                    ...entry
                })
            });
            
            if (response.ok) {
                console.log('Notification signup synced to backend');
                // Update status in queue
                const queueEntry = this.queue.find(e => 
                    e.email === entry.email && e.sku === entry.sku
                );
                if (queueEntry) {
                    queueEntry.status = 'synced';
                    localStorage.setItem('vxNotifyQueue', JSON.stringify(this.queue));
                }
                return { success: true };
            } else {
                throw new Error(`Backend returned ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to sync with backend:', error);
            throw error;
        }
    },
    
    // Open modal with product details
    openModal(product, sku, category) {
        document.getElementById('modalProductName').textContent = `Get Notified: ${product}`;
        document.getElementById('notifyProduct').value = product;
        document.getElementById('notifySKU').value = sku;
        document.getElementById('notifyCategory').value = category;
        
        // Reset form state
        document.getElementById('notifyForm').style.display = 'block';
        document.getElementById('notifySuccess').style.display = 'none';
        document.getElementById('notifyError').style.display = 'none';
        document.getElementById('notifyEmail').value = '';
        
        document.getElementById('notifyModal').classList.add('active');
        
        // Focus email input
        setTimeout(() => {
            document.getElementById('notifyEmail').focus();
        }, 100);
    },
    
    // Close modal
    closeModal() {
        document.getElementById('notifyModal').classList.remove('active');
    },
    
    // Submit form with error handling
    submitForm(event) {
        event.preventDefault();
        
        const email = document.getElementById('notifyEmail').value;
        const product = document.getElementById('notifyProduct').value;
        const sku = document.getElementById('notifySKU').value;
        const category = document.getElementById('notifyCategory').value;
        
        // Hide previous errors
        document.getElementById('notifyError').style.display = 'none';
        
        const result = this.addToQueue(email, product, sku, category);
        
        if (result.success) {
            // Show success message
            document.getElementById('notifyForm').style.display = 'none';
            
            const successText = result.savedLocally 
                ? "You're on the list! (Saved locally — we'll sync when you're online.)"
                : "You're on the list! We'll notify you at launch.";
            
            document.getElementById('notifySuccessText').textContent = successText;
            document.getElementById('notifySuccess').style.display = 'flex';
            
            // Auto-close after 2.5 seconds
            setTimeout(() => {
                this.closeModal();
            }, 2500);
            
            // Track analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'notify_signup', {
                    product_name: product,
                    product_sku: sku,
                    product_category: category
                });
            }
        } else {
            // Show error message
            document.getElementById('notifyErrorText').textContent = result.message;
            document.getElementById('notifyError').style.display = 'flex';
            
            // Shake animation
            const errorEl = document.getElementById('notifyError');
            errorEl.style.animation = 'none';
            setTimeout(() => {
                errorEl.style.animation = 'shake 0.4s';
            }, 10);
        }
    },
    
    // Get queue summary (for admin/debugging)
    getQueueStats() {
        return {
            total: this.queue.length,
            pending: this.queue.filter(e => e.status === 'pending').length,
            synced: this.queue.filter(e => e.status === 'synced').length,
            products: [...new Set(this.queue.map(e => e.product))],
            categories: [...new Set(this.queue.map(e => e.category))]
        };
    }
};

// Close modal on outside click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('notifyModal');
    if (e.target === modal) {
        NotifySystem.closeModal();
    }
});

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
        const modal = document.getElementById('notifyModal');
        if (modal && modal.classList.contains('active')) {
            NotifySystem.closeModal();
        }
    }
});
