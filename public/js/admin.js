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
    if(!confirm("Delete this product?")) return;
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
    
    // Update preview if using image upload
    const preview = document.getElementById("preview-img");
    if(preview) { preview.src = p.img; preview.style.display = "block"; }
  };

  function resetForm() {
    form.reset();
    pId.value = "";
    submitBtn.textContent = "Save Product";
    cancelBtn.style.display = "none";
    const preview = document.getElementById("preview-img");
    if(preview) preview.style.display = "none";
  }
  cancelBtn.addEventListener("click", resetForm);

  // === IMAGE UPLOAD LOGIC ===
  const fileInput = document.getElementById("file-upload");
  if(fileInput) {
      fileInput.addEventListener("change", async () => {
      const file = fileInput.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("image", file);
      statusMsg.textContent = "⏳ Uploading image...";
      try {
        const res = await fetch('/api/upload', { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) {
          document.getElementById("p-img").value = data.filePath;
          const preview = document.getElementById("preview-img");
          if(preview) { preview.src = data.filePath; preview.style.display = "block"; }
          statusMsg.textContent = "✅ Image uploaded!";
        }
      } catch (err) { statusMsg.textContent = "❌ Upload failed"; }
    });
  }


  // ==========================================
  // SECTION B: ORDERS LOGIC (UPDATED)
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

        let statusColor = "#ccc";
        if(o.status === "Packaged") statusColor = "#f39c12"; 
        if(o.status === "Shipped") statusColor = "#3498db"; 
        if(o.status === "Delivered") statusColor = "#06d6a0"; 

        // CONDITIONAL BUTTON LOGIC
        // Only show the Delete button if status is 'Delivered'
        const deleteBtn = o.status === 'Delivered' 
          ? `<button onclick="deleteOrder(${o.id})" style="margin-left:10px; background:#b91c1c; border:none; color:white; padding:5px 10px; border-radius:4px; cursor:pointer;">Delete Order</button>` 
          : '';

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

            <div style="margin-top:10px; width:100%; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center;">
                    <select onchange="updateOrderStatus(${o.id}, this.value)" style="padding:5px; background:#333; color:white; border:1px solid #555; border-radius:4px; margin-right:10px;">
                        <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Packaged" ${o.status === 'Packaged' ? 'selected' : ''}>Packaged</option>
                        <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    </select>
                    ${deleteBtn}
                </div>
                <div class="item-sub" style="font-size:0.8rem;">Last Update: ${o.last_updated || o.date}</div>
            </div>
          </div>
        `;
      }).join("");
    } catch (err) { console.error(err); }
  }

  // NEW: Function to Delete Order
  window.deleteOrder = async (id) => {
      if(!confirm("Are you sure you want to permanently delete this completed order?")) return;
      try {
          await fetch(`/api/orders/${id}`, { method: "DELETE", headers: { "x-api-key": key } });
          loadOrders(); // Refresh list
      } catch(err) { alert("Error deleting order"); }
  };
  // Function to Update Status
  window.updateOrderStatus = async (id, newStatus) => {
      try {
          const res = await fetch(`/api/orders/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json", "x-api-key": key },
              body: JSON.stringify({ status: newStatus })
          });
          if(res.ok) {
              // Refresh list to show new color/timestamp
              loadOrders();
          } else {
              alert("Failed to update status");
          }
      } catch(err) { console.error(err); }
  };


  // ==========================================
  // SECTION C: MESSAGES LOGIC (UPDATED WITH DELETE)
  // ==========================================
  async function loadMessages() {
    try {
      const res = await fetch('/api/messages', { headers: { "x-api-key": key } });
      const data = await res.json();

      if(data.length === 0) { messageContainer.innerHTML = "<p>Inbox empty.</p>"; return; }

      messageContainer.innerHTML = data.map(m => `
        <div class="list-item msg" style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div class="item-info">
            <strong>${m.name}</strong> (${m.email})
            <div class="item-sub" style="color:white; margin-top:5px;">"${m.message}"</div>
            <div class="item-sub">Date: ${m.date}</div>
          </div>
          <button class="btn-delete" onclick="deleteMessage(${m.id})">Delete</button>
        </div>
      `).join("");
    } catch (err) { console.error(err); }
  }

  // Function to Delete Message
  window.deleteMessage = async (id) => {
      if(!confirm("Delete this message?")) return;
      try {
          await fetch(`/api/messages/${id}`, { method: "DELETE", headers: { "x-api-key": key } });
          loadMessages();
      } catch(err) { alert("Error deleting message"); }
  };
});