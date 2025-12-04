document.addEventListener("DOMContentLoaded", () => {
  // === CONFIG & SELECTORS ===
  const form = document.getElementById("add-product-form");
  const statusMsg = document.getElementById("status-msg");
  
  // Containers
  const productContainer = document.getElementById("product-list");
  const orderContainer = document.getElementById("order-list");
  const messageContainer = document.getElementById("message-list");
  
  // Form Inputs
  const pId = document.getElementById("p-id");
  const pName = document.getElementById("p-name");
  const pPrice = document.getElementById("p-price");
  const pImg = document.getElementById("p-img");
  const pDesc = document.getElementById("p-desc");
  
  const submitBtn = form.querySelector("button[type='submit']");
  const cancelBtn = document.getElementById("btn-cancel");

  // === 1. SECURITY CHECK ===
  const key = localStorage.getItem("adminKey");
  if (!key) {
    window.location.href = "login.html";
    return;
  }

  // === 2. INITIAL DATA LOAD ===
  loadProducts();
  loadOrders();
  loadMessages();

  // ==========================================
  // SECTION A: INVENTORY LOGIC
  // ==========================================
  async function loadProducts() {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      
      if(data.length === 0) { productContainer.innerHTML = "<p>Empty.</p>"; return; }

      productContainer.innerHTML = data.map(p => `
        <div class="list-item">
          <div class="item-info">
            <img src="${p.img}" class="thumb">
            <div>
              <strong>${p.name}</strong> - ₱${p.price.toFixed(2)}
            </div>
          </div>
          <div>
            <button onclick='startEdit(${JSON.stringify(p)})' style="margin-right:10px; cursor:pointer;">✏️ Edit</button>
            <button class="btn-delete" onclick="deleteProduct(${p.id})">Delete</button>
          </div>
        </div>
      `).join("");
    } catch (err) { console.error(err); }
  }

  // Handle Form Submit (Add/Edit)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const isEdit = pId.value !== "";
    
    const payload = {
      name: pName.value,
      price: parseFloat(pPrice.value),
      img: pImg.value,
      description: pDesc.value
    };

    try {
      const url = isEdit ? `/api/products/${pId.value}` : '/api/products';
      const method = isEdit ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "x-api-key": key },
        body: JSON.stringify(payload)
      });

      if(res.ok) {
        statusMsg.textContent = "✅ Saved!";
        statusMsg.style.color = "#06d6a0";
        resetForm();
        loadProducts();
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      statusMsg.textContent = "❌ Error";
      statusMsg.style.color = "red";
    }
  });

  window.deleteProduct = async (id) => {
    if(!confirm("Delete this?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE", headers: { "x-api-key": key } });
    loadProducts();
  };

  window.startEdit = (p) => {
    pId.value = p.id;
    pName.value = p.name;
    pPrice.value = p.price;
    pImg.value = p.img;
    pDesc.value = p.description;
    submitBtn.textContent = "Update";
    cancelBtn.style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  function resetForm() {
    form.reset();
    pId.value = "";
    submitBtn.textContent = "Save Product";
    cancelBtn.style.display = "none";
  }
  
  cancelBtn.addEventListener("click", resetForm);


  // ==========================================
  // SECTION B: ORDERS LOGIC
  // ==========================================
  async function loadOrders() {
    try {
      const res = await fetch('/api/orders', { headers: { "x-api-key": key } });
      const data = await res.json();

      if(data.length === 0) { orderContainer.innerHTML = "<p>No orders yet.</p>"; return; }

      orderContainer.innerHTML = data.map(o => {
        let itemsDisplay = "";
        try {
          const items = JSON.parse(o.items);
          itemsDisplay = items.map(i => `${i.name} (x${i.quantity})`).join(", ");
        } catch(e) { itemsDisplay = o.items; }

        return `
          <div class="list-item order" style="flex-direction:column; align-items:flex-start;">
            <div style="width:100%; display:flex; justify-content:space-between; margin-bottom:10px;">
              <strong>Order #${o.id} - ${o.customer_name}</strong>
              <span style="color:#06d6a0; font-weight:bold;">₱${o.total.toFixed(2)}</span>
            </div>
            
            <div style="background:#222; width:100%; padding:10px; border-radius:6px; font-size:0.9rem; color:#ccc;">
              <div>📞 <strong>Contact:</strong> ${o.contact_number || "N/A"}</div>
              <div>📍 <strong>Address:</strong> ${o.address || "N/A"}, ${o.city || ""}</div>
              <div style="margin-top:5px; border-top:1px solid #333; padding-top:5px;">
                🛒 <strong>Items:</strong> ${itemsDisplay}
              </div>
            </div>
            <div class="item-sub" style="margin-top:5px;">Date: ${o.date}</div>
          </div>
        `;
      }).join("");
    } catch (err) { console.error(err); }
  }


  // ==========================================
  // SECTION C: MESSAGES LOGIC
  // ==========================================
  async function loadMessages() {
    try {
      const res = await fetch('/api/messages', { headers: { "x-api-key": key } });
      const data = await res.json();

      if(data.length === 0) { messageContainer.innerHTML = "<p>Inbox empty.</p>"; return; }

      messageContainer.innerHTML = data.map(m => `
        <div class="list-item msg">
          <div class="item-info">
            <strong>${m.name}</strong> (${m.email})
            <div class="item-sub" style="color:white; margin-top:5px;">"${m.message}"</div>
            <div class="item-sub">Date: ${m.date}</div>
          </div>
        </div>
      `).join("");
    } catch (err) { console.error(err); }
  }
});