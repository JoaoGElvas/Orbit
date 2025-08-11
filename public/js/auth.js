// Classe para gerenciar autenticação
class AuthManager {
  constructor() {
    this.token = localStorage.getItem("orbit_token");
    this.user = JSON.parse(localStorage.getItem("orbit_user") || "null");
    this.init();
  }

  init() {
    // Verificar se está na página de login
    if (
      window.location.pathname.includes("login.html") ||
      window.location.pathname === "/login"
    ) {
      this.initLoginPage();
    } else {
      this.checkAuth();
    }
  }

  initLoginPage() {
    // Se já está logado, redirecionar para dashboard
    if (this.token) {
      this.verifyTokenAndRedirect();
      return;
    }

    this.setupLoginForm();
    this.setupTabSwitching();
  }

  setupTabSwitching() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const forms = document.querySelectorAll(".auth-form");

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tabName = button.dataset.tab;

        // Atualizar botões
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        // Atualizar forms
        forms.forEach((form) => form.classList.remove("active"));
        document.getElementById(`${tabName}-form`).classList.add("active");
      });
    });
  }

  setupLoginForm() {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    if (registerForm) {
      registerForm.addEventListener("submit", (e) => this.handleRegister(e));
    }
  }

  async handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    if (!username || !password) {
      this.showMessage("Todos os campos são obrigatórios", "error");
      return;
    }

    try {
      this.showMessage("Conectando à nave...", "info");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        this.setAuth(data.token, data.user);
        this.showMessage(data.message, "success");

        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        this.showMessage(data.message, "error");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      this.showMessage("Erro de conexão com o servidor", "error");
    }
  }

  async handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    if (!username || !email || !password) {
      this.showMessage("Todos os campos são obrigatórios", "error");
      return;
    }

    if (password.length < 6) {
      this.showMessage("A senha deve ter pelo menos 6 caracteres", "error");
      return;
    }

    try {
      this.showMessage("Registrando comandante...", "info");

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        this.setAuth(data.token, data.user);
        this.showMessage(data.message, "success");

        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        this.showMessage(data.message, "error");
      }
    } catch (error) {
      console.error("Erro no registro:", error);
      this.showMessage("Erro de conexão com o servidor", "error");
    }
  }

  async verifyTokenAndRedirect() {
    try {
      const response = await fetch("/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      const data = await response.json();

      if (data.valid) {
        window.location.href = "/";
      } else {
        this.clearAuth();
      }
    } catch (error) {
      console.error("Erro na verificação:", error);
      this.clearAuth();
    }
  }

  async checkAuth() {
    if (!this.token) {
      window.location.href = "/login";
      return false;
    }

    try {
      const response = await fetch("/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      const data = await response.json();

      if (data.valid) {
        this.user = data.user;
        localStorage.setItem("orbit_user", JSON.stringify(data.user));
        return true;
      } else {
        this.clearAuth();
        window.location.href = "/login";
        return false;
      }
    } catch (error) {
      console.error("Erro na verificação:", error);
      this.clearAuth();
      window.location.href = "/login";
      return false;
    }
  }

  setAuth(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem("orbit_token", token);
    localStorage.setItem("orbit_user", JSON.stringify(user));
  }

  clearAuth() {
    this.token = null;
    this.user = null;
    localStorage.removeItem("orbit_token");
    localStorage.removeItem("orbit_user");
  }

  logout() {
    this.clearAuth();
    window.location.href = "/login";
  }

  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  showMessage(message, type) {
    const messageDisplay = document.getElementById("message-display");
    const messageText = document.getElementById("message-text");

    if (!messageDisplay || !messageText) return;

    messageText.textContent = message;

    // Remove classes anteriores
    messageDisplay.className = "message-display";

    // Adiciona nova classe baseada no tipo
    switch (type) {
      case "success":
        messageDisplay.classList.add("message-success");
        break;
      case "error":
        messageDisplay.classList.add("message-error");
        break;
      case "info":
        messageDisplay.classList.add("message-info");
        break;
    }

    messageDisplay.style.display = "block";

    // Auto-hide após 5 segundos para sucesso e info
    if (type === "success" || type === "info") {
      setTimeout(() => {
        messageDisplay.style.display = "none";
      }, 5000);
    }
  }
}

// Inicializar gerenciador de autenticação
document.addEventListener("DOMContentLoaded", () => {
  window.authManager = new AuthManager();
});
