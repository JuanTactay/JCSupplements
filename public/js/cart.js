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
    
    // 2. Build HTML with Decrement and Remove Buttons
    const itemsHtml = cart.map(item => {
      const prod = currentProducts.find(p => p.id === item.id);
      if (!prod) return "";
      const subtotal = prod.price * item.quantity;
      total += subtotal;
      
      // NEW HTML STRUCTURE: Display quantity with a decrement button
      return `<li>
                ${prod.name} 
                <span style="font-weight:bold;">(x${item.quantity})</span>
                
                <button onclick="decrementQuantity(${prod.id})" style="background:#555; border:none; color:white; padding: 1px 6px; border-radius:4px; cursor:pointer; margin-left:10px;">-</button>
                
                — ₱${subtotal.toFixed(2)}
                
                <button onclick="removeItem(${prod.id})" style="float:right; background:#b91c1c; border:none; color:white; padding: 4px 8px; border-radius:4px; cursor:pointer;">Remove All</button>
              </li>`;
    }).join("");

    currentTotal = total;

    container.innerHTML = "<ul>" + itemsHtml + "</ul>";
    container.innerHTML += `<p><strong>Total: ₱${total.toFixed(2)}</strong></p>`;
    
    // Add Checkout Button
    const btn = document.createElement("button");
    btn.textContent = "Proceed to Checkout";
    btn.onclick = openModal; 
    container.appendChild(btn);

  } catch (error) {
    console.error(error);
  }
}

// === NEW FUNCTION: DECREMENT QUANTITY 
function decrementQuantity(id) {
    let cart = getCart();
    
    // Find the item
    const itemIndex = cart.findIndex(item => item.id === id);
    
    if (itemIndex > -1) {
        if (cart[itemIndex].quantity > 1) {
            // Decrease quantity by 1
            cart[itemIndex].quantity -= 1;
        } else {
            // If quantity is 1, remove the whole item
            cart.splice(itemIndex, 1);
        }
    }
    
    saveCart(cart); 
    updateCartCount(); 
    renderCart(); 
}
window.decrementQuantity = decrementQuantity;


// === FUNCTION: REMOVE ALL (Delete line item) ===
function removeItem(id) {
    let cart = getCart();
    
    cart = cart.filter(item => item.id !== id);
    
    saveCart(cart); 
    updateCartCount(); 
    renderCart(); 
}
window.removeItem = removeItem;


// === MODAL LOGIC (Kept for submission) ===
function openModal() {
    document.getElementById("checkout-modal").style.display = "flex";
    document.getElementById("modal-total").textContent = "₱" + currentTotal.toFixed(2);
}

function closeModal() {
    document.getElementById("checkout-modal").style.display = "none";
}

// === FORM SUBMISSION (Kept for submission) ===
document.addEventListener("DOMContentLoaded", () => {
  renderCart();

  const form = document.getElementById("checkout-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const orderItems = currentCart.map(item => {
        const prod = currentProducts.find(p => p.id === item.id);
        return { id: item.id, name: prod ? prod.name : "Unknown", quantity: item.quantity };
      });

      const orderData = {
        customer_name: document.getElementById("c-name").value,
        contact_number: document.getElementById("c-number").value,
        address: document.getElementById("c-address").value,
        city: document.getElementById("c-city").value,
        total: currentTotal,
        items: orderItems
      };

      try {
        const response = await fetch('/api/orders', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (result.success) {
          // Clear cart immediately
          saveCart([]); 
          closeModal();
          updateCartCount();
          renderCart();

          // REDIRECT TO XENDIT
          // The server sent us a special URL (paymentUrl)
          window.location.href = result.paymentUrl;
        }
      } catch (err) {
        alert("Server error.");
      }
    });
  }
});