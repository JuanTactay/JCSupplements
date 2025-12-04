// NOTE: Ideally, we should fetch this from a database or a shared file
// to avoid duplicating data from shop.js.
const products = [
  { id: 1, name: "Feral Pre-Workout", price: 39.99 },
  { id: 2, name: "Beast Protein", price: 49.99 },
  { id: 3, name: "Alpha Recovery", price: 29.99 },
];

function renderCart() {
  const container = document.getElementById("cart-container");
  if (!container) return; // Exit if not on cart page

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  let total = 0;
  // Generate HTML for items
  const itemsHtml = cart
    .map((item) => {
      const prod = products.find((p) => p.id === item.id);
      if (!prod) return ""; // Skip if product not found
      const subtotal = prod.price * item.quantity;
      total += subtotal;
      return `<li>${prod.name} (x${item.quantity}) - $${subtotal.toFixed(
        2
      )}</li>`;
    })
    .join("");

  container.innerHTML = "<ul>" + itemsHtml + "</ul>";

  container.innerHTML += `<p><strong>Total: $${total.toFixed(2)}</strong></p>
    <button onclick="checkout()">Proceed to Checkout</button>`;
}

function checkout() {
  alert("Transaction completed! Thank you for shopping at JCSupplements!");
  saveCart([]); // Clear storage
  updateCartCount(); // Reset header count
  renderCart(); // Re-render empty cart
}

document.addEventListener("DOMContentLoaded", renderCart);
