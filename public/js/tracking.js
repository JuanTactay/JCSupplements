document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("track-form");
  const resultBox = document.getElementById("result-box");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("order-id").value;
    
    resultBox.style.display = "block";
    resultBox.innerHTML = "<p>🔍 Searching...</p>";
    resultBox.style.borderLeftColor = "#ccc";

    try {
      // 1. Fetch public tracking info
      const res = await fetch(`/api/orders/${id}/track`);
      
      if (!res.ok) {
        throw new Error("Order not found");
      }

      const order = await res.json();

      // 2. Parse Items
      let itemsList = "<ul>";
      try {
        const items = JSON.parse(order.items);
        items.forEach(i => {
            itemsList += `<li>${i.name} (x${i.quantity})</li>`;
        });
        itemsList += "</ul>";
      } catch(e) { itemsList = "<p>Items info unavailable</p>"; }

      // 3. Determine Color based on status
      let color = "#e63946"; // Default Red
      if(order.status === "Pending") color = "#f39c12"; // Orange
      if(order.status === "Packaged") color = "#3498db"; // Blue
      if(order.status === "Shipped") color = "#9b59b6"; // Purple
      if(order.status === "Delivered") color = "#06d6a0"; // Green

      resultBox.style.borderLeftColor = color;

      // 4. Render
      resultBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h3>Order #${order.id}</h3>
            <span style="background:${color}; padding:5px 10px; border-radius:4px; color:white; font-weight:bold;">
                ${order.status}
            </span>
        </div>
        <p><strong>Last Update:</strong> ${order.last_updated || "Just now"}</p>
        <div style="margin-top:15px; border-top:1px solid #333; padding-top:10px;">
            <strong>Items:</strong>
            ${itemsList}
        </div>
        <p style="margin-top:10px; font-size:1.2rem;"><strong>Total: ₱${order.total.toFixed(2)}</strong></p>
      `;

    } catch (err) {
      resultBox.innerHTML = "<p style='color:#e63946'>❌ Order ID not found. Please check your number.</p>";
      resultBox.style.borderLeftColor = "#e63946";
    }
  });
});