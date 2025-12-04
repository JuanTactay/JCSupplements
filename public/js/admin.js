document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-product-form");
  const statusMsg = document.getElementById("status-msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusMsg.textContent = "⏳ Saving product...";
    statusMsg.style.color = "white";

    // 1. Gather data from inputs
    const newProduct = {
      name: document.getElementById("p-name").value,
      price: parseFloat(document.getElementById("p-price").value),
      img: document.getElementById("p-img").value,
      description: document.getElementById("p-desc").value
    };

    try {
      // 2. Send data to server
      const response = await fetch('/api/products', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newProduct)
      });

      const result = await response.json();

      if (response.ok) {
        // 3. Success!
        statusMsg.textContent = "✅ Product Added Successfully!";
        statusMsg.style.color = "#06d6a0";
        form.reset(); // Clear form
        
        // Reset the image path to default for convenience
        document.getElementById("p-img").value = "assets/protein.webp";
      } else {
        throw new Error(result.error || "Failed to save");
      }

    } catch (error) {
      console.error("Error:", error);
      statusMsg.textContent = "❌ Error: " + error.message;
      statusMsg.style.color = "#e63946";
    }
  });
});