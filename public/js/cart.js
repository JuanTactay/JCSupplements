// Function to render the cart with live server data
async function renderCart() {
  const container = document.getElementById("cart-container");
  if (!container) return; // Exit if not on cart page

  // 1. Get the items the user saved in their browser
  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  container.innerHTML = "<p>Loading your cart...</p>";

  try {
    // 2. Fetch the latest product details (names, prices) from the server
    const response = await fetch('/api/products');
    const products = await response.json();

    let total = 0;
    
    // 3. Match cart items (IDs) with server products
    const itemsHtml = cart.map(item => {
      const prod = products.find(p => p.id === item.id);
      
      if (!prod) {
        // Handle case where product was deleted from server
        return `<li>Unknown Item (ID: ${item.id}) - Removed</li>`;
      }

      const subtotal = prod.price * item.quantity;
      total += subtotal;
      return `<li>${prod.name} (x${item.quantity}) - $${subtotal.toFixed(2)}</li>`;
    }).join("");

    // 4. Render the final HTML
    container.innerHTML = "<ul>" + itemsHtml + "</ul>";
    container.innerHTML += `<p><strong>Total: $${total.toFixed(2)}</strong></p>
      <button onclick="checkout()">Proceed to Checkout</button>`;

  } catch (error) {
    console.error("Error loading cart data:", error);
    container.innerHTML = "<p>⚠️ Error loading cart details.</p>";
  }
}

function checkout() {
  alert("Transaction completed! Thank you for shopping at JCSupplements!");
  saveCart([]); // Clear storage
  updateCartCount(); // Reset header count
  renderCart(); // Re-render empty cart
}

document.addEventListener("DOMContentLoaded", renderCart);