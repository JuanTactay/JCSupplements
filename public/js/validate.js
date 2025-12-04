document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const messageInput = document.getElementById("message");
  const formMessage = document.getElementById("form-message");

  if (!form) return; // Exit if form doesn't exist

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    // Simple validation
    if (name === "" || email === "" || message === "") {
      showMessage("❌ Please fill in all fields.", "error");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      showMessage("⚠️ Please enter a valid email address.", "error");
      return;
    }

    if (message.length < 10) {
      showMessage("📝 Message must be at least 10 characters long.", "error");
      return;
    }

    // If all is good
    showMessage(
      "✅ Thank you! Your message has been sent successfully.",
      "success"
    );
    form.reset();
  });

  // Function to display messages
  function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.style.marginTop = "10px";
    formMessage.style.fontWeight = "bold";
    formMessage.style.textAlign = "center";

    if (type === "error") {
      formMessage.style.color = "#e63946";
    } else {
      formMessage.style.color = "#06d6a0";
    }
  }
});
