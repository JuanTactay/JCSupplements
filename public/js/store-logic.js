// Global variable to store products
let products = []; 

const container = document.getElementById("product-list");

// Function to render the skeleton loading state
function renderSkeletons() {
    if (!container) return;
    
    // Create 6 placeholder cards
    let skeletonHTML = '';
    for (let i = 0; i < 6; i++) {
        skeletonHTML += `
            <div class="skeleton-card">
                <div class="skeleton skeleton-image"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-price"></div>
                <div class="skeleton skeleton-button"></div>
            </div>
        `;
    }
    container.innerHTML = skeletonHTML;
}


async function initShop() {
    // 1. Show the loading placeholders immediately
    renderSkeletons();
    
    if (!container) return;

    try {
        // 2. Fetch data from server
        const response = await fetch('/api/products');
        products = await response.json();
        
        // 3. Render real products, overwriting skeletons
        renderProducts(); 
    } catch (error) {
        console.error("Error loading products:", error);
        container.innerHTML = "<p>⚠️ Failed to load products. Is the server running?</p>";
    }
}

function renderProducts() {
  container.innerHTML = ""; // Clear skeletons
  
  products.forEach(prod => {
    const div = document.createElement("div");
    // Apply the scroll-reveal class for animation as products appear
    div.classList.add("product", "scroll-reveal"); 
    
    // Check if the scroll observer has been initialized (from main.js)
    if (window.observer) {
        window.observer.observe(div);
    }

    // Set inner HTML with linking logic
    div.innerHTML = `
      <a href="product.html?id=${prod.id}" style="text-decoration: none; color: inherit;">
        <img src="${prod.img}" alt="${prod.name}" class="product-img">
      </a>
      
      <a href="product.html?id=${prod.id}" style="text-decoration: none; color: inherit;">
        <h3>${prod.name}</h3>
      </a>
      
      <p>₱${prod.price.toFixed(2)}</p>
      <button onclick="addToCart(${prod.id}, event)">Add to Cart</button>
    `;
    container.appendChild(div);
  });
}

// === Cart Logic (Must be global for HTML onclick to work) ===
function addToCart(id, event) {
    const cart = getCart();
    const existing = cart.find(i => i.id === id);
    if (existing) existing.quantity++;
    else {
        const product = products.find(p => p.id === id);
        if (product) {
             cart.push({ id, quantity: 1 });
        }
    }
    saveCart(cart);
    updateCartCount();
    showPopup();

    if (event && event.target) {
        event.target.style.animation = 'none'; 
        event.target.offsetHeight; 
        event.target.style.animation = 'button-press 0.3s ease-out';
        setTimeout(() => {
            event.target.style.animation = 'none';
        }, 300);
    }
}

function showPopup() {
    const popup = document.getElementById("popup");
    if (popup) {
        popup.classList.add("show");
        setTimeout(() => popup.classList.remove("show"), 1200);
    }
}

// Make functions globally available
window.addToCart = addToCart;
window.showPopup = showPopup;
window.renderProducts = renderProducts; // Added just in case

document.addEventListener("DOMContentLoaded", initShop);