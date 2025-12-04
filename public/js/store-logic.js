
let products = [];

const container = document.getElementById("product-list");

// Function to fetch data from server and render page
async function initShop() {
  if (!container) return;

  try {
    const response = await fetch("/api/products");
    products = await response.json();
    renderProducts();
  } catch (error) {
    console.error("Error loading products:", error);
    container.innerHTML =
      "<p>⚠️ Failed to load products. Is the server running?</p>";
  }
}

function renderProducts() {
  container.innerHTML = "";

  products.forEach((prod) => {
    const div = document.createElement("div");
    div.classList.add("product", "fade-in");

    // HERE ARE THE LINKS that make clicking work
    div.innerHTML = `
      <a href="product.html?id=${prod.id}">
        <img src="${prod.img}" alt="${prod.name}" class="product-img">
      </a>
      
      <a href="product.html?id=${
        prod.id
      }" style="text-decoration: none; color: inherit;">
        <h3>${prod.name}</h3>
      </a>
      
      <p>₱${prod.price.toFixed(2)}</p>
      <button onclick="addToCart(${prod.id})">Add to Cart</button>
    `;
    container.appendChild(div);
  });
}

function addToCart(id) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === id);

  if (existing) {
    existing.quantity++;
  } else {
    // Verify product exists before adding
    const prod = products.find((p) => p.id === id);
    if (prod) {
      cart.push({ id, quantity: 1 });
    }
  }

  saveCart(cart);
  updateCartCount();
  showPopup();
}

function showPopup() {
  const popup = document.getElementById("popup");
  if (popup) {
    popup.classList.add("show");
    setTimeout(() => popup.classList.remove("show"), 1200);
  }
}

document.addEventListener("DOMContentLoaded", initShop);
