const form = document.querySelector("#admin-login-form");
const usernameInput = document.querySelector("#admin-username");
const passwordInput = document.querySelector("#admin-password");
const errorMessage = document.querySelector("#admin-login-error");
const loginButton = document.querySelector("#admin-login-button");

const ADMIN_SESSION_KEY = "voyagewall_admin";

if (localStorage.getItem(ADMIN_SESSION_KEY) === "true") {
  window.location.replace("/admin/wall");
}

function setLoginError(message) {
  errorMessage.textContent = message;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setLoginError("");

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    setLoginError("Invalid username or password");
    return;
  }

  loginButton.disabled = true;
  loginButton.textContent = "Signing in...";

  try {
    const response = await fetch("/api/admin-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      setLoginError("Invalid username or password");
      return;
    }

    const result = await response.json();
    if (!result?.ok) {
      setLoginError("Invalid username or password");
      return;
    }

    localStorage.setItem(ADMIN_SESSION_KEY, "true");
    window.location.assign("/admin/wall");
  } catch {
    setLoginError("Invalid username or password");
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Sign In";
  }
});
