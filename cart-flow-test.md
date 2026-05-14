# Cart Flow Audit

## Step 1: Product Page (semaglutide.html)
- User clicks "Add to Cart"
- Calls: addToCart()
- Stores to: localStorage.vantixCart
- Expected: [{name: "Semaglutide 10mg", sku: "VX-SEMA-10", price: 42, quantity: 1}]

## Step 2: Cart Icon Click
- Calls: goToCart()
- Checks: localStorage.vantixCart has items
- Redirects to: ../checkout.html

## Step 3: Checkout Page Load
- Runs: loadCart()
- Reads from: localStorage.vantixCart
- Filters: outOfStock array
- Stores to: cart[] global variable
- Calls: renderCart()

## Step 4: Render
- Checks: cart.length > 0
- Renders items or "empty cart" message
