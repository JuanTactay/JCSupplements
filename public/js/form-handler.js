document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const messageInput = document.getElementById("message");
  const formMessage = document.getElementById("form-message");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    // 1. Basic Validation
    if (name === "" || email === "" || message === "") {
      showMessage("❌ Please fill in all fields.", "error");
      return;
    }

    // 2. Prepare the data to send
    const formData = {
      name: name,
      email: email,
      message: message,
    };

    // 3. Send data to the server
    try {
      showMessage("⏳ Sending message...", "success"); // Temporary loading state

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        showMessage("✅ Message received by server!", "success");
        form.reset();
      } else {
        showMessage("⚠️ Server error. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage("❌ Failed to connect to server.", "error");
    }
  });

  function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.style.marginTop = "10px";
    formMessage.style.fontWeight = "bold";
    formMessage.style.textAlign = "center";
    formMessage.style.color = type === "error" ? "#e63946" : "#06d6a0";
  }
});
