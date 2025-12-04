// === CART UTILITIES (Kept from original main.js) ===
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  document.querySelectorAll("#cart-count").forEach(el => el.textContent = count);
}

// Make utilities globally available since they are called in HTML onclick
window.getCart = getCart;
window.saveCart = saveCart;
window.updateCartCount = updateCartCount;

// === NEW: SCROLL REVEAL LOGIC ===
const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1 // Triggers when 10% of the element is visible
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Stop observing once visible
        }
    });
}, observerOptions);

document.addEventListener("DOMContentLoaded", () => {
    // Initial cart count update
    updateCartCount();
    
    // Apply observer to all elements we want to animate
    document.querySelectorAll('.scroll-reveal').forEach(element => {
        observer.observe(element);
    });

    // Apply the .scroll-reveal class to relevant HTML elements:
    // (We will add these classes in the next steps)
});