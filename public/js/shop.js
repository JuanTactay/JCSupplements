const products = [
  {
    id: 1,
    name: "Feral Pre-Workout",
    price: 39.99,
    img: "assets/preworkout.webp",
  },
  { id: 2, name: "Beast Protein", price: 49.99, img: "assets/protein.webp" },
  { id: 3, name: "Alpha Recovery", price: 29.99, img: "assets/bcaa.webp" },
];

const container = document.getElementById("product-list");

// Only run if the product container exists (prevents errors on other pages)
if (container) {
  products.forEach((prod) => {
    const div = document.createElement("div");
    div.classList.add("product", "fade-in");
    div.innerHTML = `
      <img src="${prod.img}" alt="${prod.name}" class="product-img">
      <h3>${prod.name}</h3>
      <p>$${prod.price.toFixed(2)}</p>
      <button onclick="addToCart(${prod.id})">Add to Cart</button>
    `;
    container.appendChild(div);
  });
}

function addToCart(id) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === id);
  if (existing) existing.quantity++;
  else cart.push({ id, quantity: 1 });

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
