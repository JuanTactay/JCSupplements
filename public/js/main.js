function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);

  // Updates every cart count element on the page
  document
    .querySelectorAll("#cart-count")
    .forEach((el) => (el.textContent = count));
}

// Run on page load
document.addEventListener("DOMContentLoaded", updateCartCount);
