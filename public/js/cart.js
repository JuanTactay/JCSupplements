let currentTotal = 0;
let currentCart = [];
let currentProducts = [];

async function renderCart() {
  const container = document.getElementById("cart-container");
  if (!container) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  container.innerHTML = "<p>Loading...</p>";

  try {
    const response = await fetch('/api/products');
    currentProducts = await response.json();
    currentCart = cart;

    let total = 0;
    const itemsHtml = cart.map(item => {
      const prod = currentProducts.find(p => p.id === item.id);
      if (!prod) return "";
      const subtotal = prod.price * item.quantity;
      total += subtotal;
      return `<li>${prod.name} (x${item.quantity}) - ₱${subtotal.toFixed(2)}</li>`;
    }).join("");

    currentTotal = total;

    container.innerHTML = "<ul>" + itemsHtml + "</ul>";
    container.innerHTML += `<p><strong>Total: ₱${total.toFixed(2)}</strong></p>`;
    
    // Change: Opens the Modal instead of immediate prompt
    const btn = document.createElement("button");
    btn.textContent = "Proceed to Checkout";
    btn.onclick = openModal; 
    container.appendChild(btn);

  } catch (error) {
    console.error(error);
  }
}

// === MODAL LOGIC ===
function openModal() {
  document.getElementById("checkout-modal").style.display = "flex";
  document.getElementById("modal-total").textContent = "₱" + currentTotal.toFixed(2);
}

function closeModal() {
  document.getElementById("checkout-modal").style.display = "none";
}

// === FORM SUBMISSION ===
document.addEventListener("DOMContentLoaded", () => {
  renderCart();

  const form = document.getElementById("checkout-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // 1. Gather Data
      const orderItems = currentCart.map(item => {
        const prod = currentProducts.find(p => p.id === item.id);
        return { 
          id: item.id, 
          name: prod ? prod.name : "Unknown", 
          quantity: item.quantity 
        };
      });

      const orderData = {
        customer_name: document.getElementById("c-name").value,
        contact_number: document.getElementById("c-number").value,
        address: document.getElementById("c-address").value,
        city: document.getElementById("c-city").value,
        total: currentTotal,
        items: orderItems
      };

      // 2. Send to Server
      try {
        const response = await fetch('/api/orders', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (result.success) {
          alert("✅ Order Placed! We will ship to " + orderData.city);
          saveCart([]); 
          closeModal();
          updateCartCount();
          renderCart();
        } else {
          alert("❌ Error placing order.");
        }
      } catch (err) {
        alert("Server error.");
      }
    });
  }
});