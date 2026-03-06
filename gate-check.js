// gate-check.js - Age + Terms Gate Enforcement
// Add this script to the <head> of all public pages (except gate.html, terms.html, privacy.html)

(function() {
    'use strict';

    // Exempt pages (don't enforce gate on these)
    const EXEMPT_PAGES = ['gate.html', 'terms.html', 'privacy.html', 'faq.html', 'contact.html'];
    
    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Check if current page is exempt
    const isExempt = EXEMPT_PAGES.some(page => currentPage === page);
    
    if (isExempt) {
        // Don't enforce gate on exempt pages
        return;
    }

    // Check for gate acceptance
    const localAccepted = localStorage.getItem('vantix_gate_accepted');
    const sessionAccepted = sessionStorage.getItem('vantix_gate_accepted');
    
    let isAccepted = false;
    
    if (localAccepted || sessionAccepted) {
        try {
            const data = JSON.parse(localAccepted || sessionAccepted);
            if (data && data.accepted === true) {
                isAccepted = true;
            }
        } catch (e) {
            // Invalid data, treat as not accepted
            isAccepted = false;
        }
    }

    // If not accepted, redirect to gate
    if (!isAccepted) {
        window.location.href = 'gate.html';
    }
})();
