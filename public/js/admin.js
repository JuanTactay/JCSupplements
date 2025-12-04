document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-product-form");
  const statusMsg = document.getElementById("status-msg");

  // 1. Security Check: Redirect if not logged in
  const key = localStorage.getItem("adminKey");
  if (!key) {
    window.location.href = "login.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusMsg.textContent = "⏳ Saving product...";
    statusMsg.style.color = "white";

    const newProduct = {
      name: document.getElementById("p-name").value,
      price: parseFloat(document.getElementById("p-price").value),
      img: document.getElementById("p-img").value,
      description: document.getElementById("p-desc").value
    };

    try {
      // 2. Send data WITH THE PASSWORD (Header)
      const response = await fetch('/api/products', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key // <--- THE KEY IS ATTACHED HERE
        },
        body: JSON.stringify(newProduct)
      });

      const result = await response.json();

      if (response.ok) {
        statusMsg.textContent = "✅ Product Added Successfully!";
        statusMsg.style.color = "#06d6a0";
        form.reset();
        document.getElementById("p-img").value = "assets/protein.webp";
      } else {
        // If server says "Access Denied", show that specific error
        throw new Error(result.error || "Failed to save");
      }

    } catch (error) {
      console.error("Error:", error);
      statusMsg.textContent = "❌ Error: " + error.message;
      statusMsg.style.color = "#e63946";
      
      // If the error is permission related, kick them out
      if (error.message.includes("Access Denied")) {
        setTimeout(() => window.location.href = "login.html", 2000);
      }
    }
  });
});