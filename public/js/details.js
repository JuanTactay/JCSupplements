document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("product-details");

  // 1. Get the Product ID from the URL (e.g., product.html?id=1)
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId) {
    container.innerHTML =
      "<p>⚠️ No product selected. <a href='shop.html'>Go back to Shop</a></p>";
    return;
  }

  try {
    // 2. Fetch the specific product from the server
    const response = await fetch(`/api/products/${productId}`);

    if (!response.ok) {
      throw new Error("Product not found");
    }

    const product = await response.json();

    // 3. Render the details to the HTML
    container.innerHTML = `
      <div class="product-detail-view">
        <img src="${product.img}" alt="${product.name}" class="detail-img">
        <div class="detail-info">
          <h1>${product.name}</h1>
          <h2 class="price">₱${product.price.toFixed(2)}</h2>
          
          <p class="description">${product.description}</p>
          
          <button onclick="addToCart(${product.id})" class="btn-large">Add to Cart</button>
          <br><br>
          <a href="shop.html" class="back-link">← Back to Shop</a>
        </div>
      </div>
    `;
  } catch (error) {
    container.innerHTML =
      "<p>❌ Product not found. <a href='shop.html'>Go back to Shop</a></p>";
  }
});

// Reuse the Add to Cart logic
function addToCart(id) {
  const cart = getCart(); // defined in main.js
  const existing = cart.find((i) => i.id === id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveCart(cart); // defined in main.js
  updateCartCount(); // defined in main.js

  // Show popup
  const popup = document.getElementById("popup");
  if (popup) {
    popup.classList.add("show");
    setTimeout(() => popup.classList.remove("show"), 1200);
  }
}
