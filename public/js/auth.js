document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const errorMsg = document.getElementById("error-msg");

  // === PART 1: HANDLING LOGIN PAGE ===
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const password = document.getElementById("password").value;
      
      // Reset error message
      if(errorMsg) errorMsg.style.display = "none";

      try {
        // 1. Ask the server if the password is correct
        const response = await fetch('/api/login', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password })
        });

        const result = await response.json();

        if (result.success) {
          // 2. If Server says YES: Save key and go to Admin
          localStorage.setItem("adminKey", password);
          window.location.href = "admin.html";
        } else {
          // 3. If Server says NO: Show error
          if(errorMsg) errorMsg.style.display = "block";
        }
      } catch (error) {
        console.error("Login error:", error);
      }
    });
  }

  // === PART 2: PROTECTING ADMIN PAGE ===
  if (window.location.pathname.includes("admin.html")) {
    const key = localStorage.getItem("adminKey");
    if (!key) {
      window.location.href = "login.html";
    }
  }
});