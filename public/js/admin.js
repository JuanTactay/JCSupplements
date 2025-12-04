document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-product-form");
  const statusMsg = document.getElementById("status-msg");
  const listContainer = document.getElementById("admin-product-list");

  // 1. Security Check
  const key = localStorage.getItem("adminKey");
  if (!key) {
    window.location.href = "login.html";
    return;
  }

  // 2. Load the list immediately
  loadProducts();

  // === FUNCTION: FETCH & RENDER LIST ===
  async function loadProducts() {
    try {
      const response = await fetch('/api/products');
      const products = await response.json();

      if (products.length === 0) {
        listContainer.innerHTML = "<p>No products found.</p>";
        return;
      }

      listContainer.innerHTML = products.map(p => `
        <div class="product-row">
          <div class="product-info">
            <img src="${p.img}" class="thumb" alt="img">
            <div>
              <strong>${p.name}</strong> - $${p.price.toFixed(2)}
            </div>
          </div>
          <button class="btn-delete" onclick="deleteProduct(${p.id})">Delete</button>
        </div>
      `).join("");

    } catch (error) {
      console.error("Error loading list:", error);
      listContainer.innerHTML = "<p style='color:red'>Error loading inventory.</p>";
    }
  }

  // === FUNCTION: ADD PRODUCT ===
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusMsg.textContent = "⏳ Saving...";
    statusMsg.style.color = "white";

    const newProduct = {
      name: document.getElementById("p-name").value,
      price: parseFloat(document.getElementById("p-price").value),
      img: document.getElementById("p-img").value,
      description: document.getElementById("p-desc").value
    };

    try {
      const response = await fetch('/api/products', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key // Send Password
        },
        body: JSON.stringify(newProduct)
      });

      const result = await response.json();

      if (response.ok) {
        statusMsg.textContent = "✅ Added!";
        statusMsg.style.color = "#06d6a0";
        form.reset();
        document.getElementById("p-img").value = "assets/protein.webp";
        
        // Refresh the list immediately!
        loadProducts();
      } else {
        throw new Error(result.error || "Failed to save");
      }
    } catch (error) {
      statusMsg.textContent = "❌ " + error.message;
      statusMsg.style.color = "#e63946";
    }
  });

  // === FUNCTION: DELETE PRODUCT ===
  // We attach this to 'window' so the HTML onclick="..." can find it
  window.deleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "x-api-key": key // Send Password for permission
        }
      });

      if (response.ok) {
        // Remove the row instantly or reload
        loadProducts(); 
      } else {
        alert("Failed to delete. Access Denied?");
      }
    } catch (error) {
      alert("Error deleting product.");
    }
  };
});