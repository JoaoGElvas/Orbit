// Classe principal da aplicação Orbit
class OrbitApp {
  constructor() {
    this.tasks = {
      daily: [],
      weekly: [],
    };
    this.stats = {};
    this.currentTab = "daily";
    this.editingTask = null;

    this.init();
  }

  async init() {
    // Verificar autenticação primeiro
    if (!window.authManager || !(await window.authManager.checkAuth())) {
      return;
    }

    this.setupEventListeners();
    this.initTimer();
    this.initTabs();
    this.initModal();
    this.loadUserData();
    this.loadTasks();
    this.loadStats();
  }

  setupEventListeners() {
    console.log("App: Configurando event listeners...");

    // Logout
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        window.authManager.logout();
      });
      console.log("App: Logout button configurado");
    } else {
      console.warn("App: Logout button não encontrado");
    }

    // Adicionar tarefas
    const addDailyBtn = document.getElementById("add-daily-task");
    if (addDailyBtn) {
      addDailyBtn.addEventListener("click", () => {
        console.log("App: Adicionando tarefa diária");
        this.addTask("daily");
      });
      console.log("App: Botão adicionar tarefa diária configurado");
    } else {
      console.warn("App: Botão adicionar tarefa diária não encontrado");
    }

    const addWeeklyBtn = document.getElementById("add-weekly-task");
    if (addWeeklyBtn) {
      addWeeklyBtn.addEventListener("click", () => {
        console.log("App: Adicionando tarefa semanal");
        this.addTask("weekly");
      });
      console.log("App: Botão adicionar tarefa semanal configurado");
    } else {
      console.warn("App: Botão adicionar tarefa semanal não encontrado");
    }

    // Enter nos inputs de tarefa
    document
      .getElementById("daily-task-input")
      ?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.addTask("daily");
      });

    document
      .getElementById("weekly-task-input")
      ?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.addTask("weekly");
      });
  }

  initTimer() {
    this.timer = new PomodoroTimer();
  }

  initTabs() {
    const tabButtons = document.querySelectorAll(".mission-tabs .tab-btn");

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tabName = button.dataset.tab;
        this.switchTab(tabName);
      });
    });
  }

  initModal() {
    const modal = document.getElementById("edit-task-modal");
    const closeBtn = modal?.querySelector(".modal-close");
    const cancelBtn = document.getElementById("cancel-task-edit");
    const saveBtn = document.getElementById("save-task-edit");

    closeBtn?.addEventListener("click", () => this.closeModal());
    cancelBtn?.addEventListener("click", () => this.closeModal());
    saveBtn?.addEventListener("click", () => this.saveTaskEdit());

    // Fechar modal clicando fora
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) this.closeModal();
    });
  }

  switchTab(tabName) {
    // Atualizar botões
    document.querySelectorAll(".mission-tabs .tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

    // Atualizar containers
    document.querySelectorAll(".tasks-container").forEach((container) => {
      container.classList.remove("active");
    });
    document.getElementById(`${tabName}-tasks`).classList.add("active");

    this.currentTab = tabName;

    // Carregar dados específicos da aba
    if (tabName === "history") {
      this.loadHistory();
    }
  }

  loadUserData() {
    const user = window.authManager.user;
    if (user) {
      document.getElementById(
        "commander-name"
      ).textContent = `Comandante ${user.username}`;
    }
  }

  async loadTasks() {
    try {
      // Carregar tarefas diárias
      const dailyResponse = await fetch(
        "/api/tasks?type=daily&completed=false",
        {
          headers: window.authManager.getAuthHeaders(),
        }
      );

      if (dailyResponse.ok) {
        this.tasks.daily = await dailyResponse.json();
        this.renderTasks("daily");
      }

      // Carregar tarefas semanais
      const weeklyResponse = await fetch(
        "/api/tasks?type=weekly&completed=false",
        {
          headers: window.authManager.getAuthHeaders(),
        }
      );

      if (weeklyResponse.ok) {
        this.tasks.weekly = await weeklyResponse.json();
        this.renderTasks("weekly");
      }
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      this.showNotification("Erro ao carregar tarefas", "error");
    }
  }

  async loadStats() {
    try {
      const response = await fetch("/api/users/stats", {
        headers: window.authManager.getAuthHeaders(),
      });

      if (response.ok) {
        this.stats = await response.json();
        this.updateStatsDisplay();
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  }

  updateStatsDisplay() {
    if (!this.stats) return;

    // Header stats
    document.getElementById("focus-points").textContent =
      this.stats.focus_points || 0;
    document.getElementById("current-streak").textContent =
      this.stats.current_streak || 0;

    // Sidebar stats
    document.getElementById("total-focus-points").textContent =
      this.stats.focus_points || 0;
    document.getElementById("streak-current").textContent =
      this.stats.current_streak || 0;
    document.getElementById("streak-best").textContent =
      this.stats.best_streak || 0;
    document.getElementById("total-completed").textContent =
      this.stats.total_tasks_completed || 0;
  }

  renderTasks(type) {
    const container = document.getElementById(`${type}-tasks-list`);
    if (!container) return;

    container.innerHTML = "";

    this.tasks[type].forEach((task) => {
      const taskElement = this.createTaskElement(task, type);
      container.appendChild(taskElement);
    });

    // Tornar a lista ordenável
    this.makeSortable(container, type);
  }

  createTaskElement(task, type) {
    const taskDiv = document.createElement("div");
    taskDiv.className = `task-item ${task.completed ? "completed" : ""}`;
    taskDiv.dataset.taskId = task.id;
    taskDiv.draggable = true;

    const priorityClass = `priority-${task.priority}`;
    const priorityText =
      {
        low: "Baixa",
        normal: "Normal",
        critical: "Crítica",
      }[task.priority] || "Normal";

    taskDiv.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${
              task.completed ? "checked" : ""
            }>
            <div class="task-content">
                <div class="task-title">${this.escapeHtml(task.title)}</div>
                ${
                  task.description
                    ? `<div class="task-description">${this.escapeHtml(
                        task.description
                      )}</div>`
                    : ""
                }
                <div class="task-meta">
                    <span class="priority-badge ${priorityClass}">${priorityText}</span>
                    <span class="task-type">${
                      type === "daily" ? "Diária" : "Semanal"
                    }</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="task-action-btn edit-btn" title="Editar">✏️</button>
                <button class="task-action-btn delete-btn" title="Excluir">🗑️</button>
            </div>
        `;

    // Event listeners
    const checkbox = taskDiv.querySelector(".task-checkbox");
    checkbox.addEventListener("change", () => this.toggleTask(task.id, type));

    const editBtn = taskDiv.querySelector(".edit-btn");
    editBtn.addEventListener("click", () => this.editTask(task));

    const deleteBtn = taskDiv.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => this.deleteTask(task.id, type));

    return taskDiv;
  }

  makeSortable(container, type) {
    let draggedElement = null;

    container.addEventListener("dragstart", (e) => {
      draggedElement = e.target;
      e.target.classList.add("dragging");
    });

    container.addEventListener("dragend", (e) => {
      e.target.classList.remove("dragging");
      this.updateTaskOrder(type);
    });

    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      const afterElement = this.getDragAfterElement(container, e.clientY);
      if (afterElement == null) {
        container.appendChild(draggedElement);
      } else {
        container.insertBefore(draggedElement, afterElement);
      }
    });
  }

  getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll(".task-item:not(.dragging)"),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  async updateTaskOrder(type) {
    const container = document.getElementById(`${type}-tasks-list`);
    const taskElements = container.querySelectorAll(".task-item");
    const taskIds = Array.from(taskElements).map((el) =>
      parseInt(el.dataset.taskId)
    );

    try {
      await fetch("/api/tasks/reorder", {
        method: "PATCH",
        headers: window.authManager.getAuthHeaders(),
        body: JSON.stringify({ taskIds }),
      });
    } catch (error) {
      console.error("Erro ao reordenar tarefas:", error);
    }
  }

  async addTask(type) {
    const titleInput = document.getElementById(`${type}-task-input`);
    const descriptionInput = document.getElementById(
      `${type}-task-description`
    );
    const prioritySelect = document.getElementById(`${type}-priority-select`);

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const priority = prioritySelect.value;

    if (!title) {
      this.showNotification("Digite o título da missão", "error");
      return;
    }

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: window.authManager.getAuthHeaders(),
        body: JSON.stringify({
          title,
          description,
          priority,
          type,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        this.showNotification(result.message, "success");

        // Limpar formulário
        titleInput.value = "";
        descriptionInput.value = "";
        prioritySelect.value = "normal";

        // Recarregar tarefas
        this.loadTasks();
      } else {
        const error = await response.json();
        this.showNotification(error.message, "error");
      }
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
      this.showNotification("Erro ao adicionar missão", "error");
    }
  }

  async toggleTask(taskId, type) {
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "PATCH",
        headers: window.authManager.getAuthHeaders(),
      });

      if (response.ok) {
        const result = await response.json();
        this.showNotification(result.message, "success");

        // Remover da lista atual e recarregar
        this.tasks[type] = this.tasks[type].filter(
          (task) => task.id !== taskId
        );
        this.renderTasks(type);

        // Atualizar estatísticas
        this.loadStats();
      } else {
        const error = await response.json();
        this.showNotification(error.message, "error");
      }
    } catch (error) {
      console.error("Erro ao completar tarefa:", error);
      this.showNotification("Erro ao completar missão", "error");
    }
  }

  editTask(task) {
    this.editingTask = task;

    document.getElementById("edit-task-title").value = task.title;
    document.getElementById("edit-task-description").value =
      task.description || "";
    document.getElementById("edit-task-priority").value = task.priority;

    document.getElementById("edit-task-modal").classList.add("active");
  }

  async saveTaskEdit() {
    if (!this.editingTask) return;

    const title = document.getElementById("edit-task-title").value.trim();
    const description = document
      .getElementById("edit-task-description")
      .value.trim();
    const priority = document.getElementById("edit-task-priority").value;

    if (!title) {
      this.showNotification("Digite o título da missão", "error");
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${this.editingTask.id}`, {
        method: "PUT",
        headers: window.authManager.getAuthHeaders(),
        body: JSON.stringify({
          title,
          description,
          priority,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        this.showNotification(result.message, "success");
        this.closeModal();
        this.loadTasks();
      } else {
        const error = await response.json();
        this.showNotification(error.message, "error");
      }
    } catch (error) {
      console.error("Erro ao editar tarefa:", error);
      this.showNotification("Erro ao editar missão", "error");
    }
  }

  async deleteTask(taskId, type) {
    if (!confirm("Tem certeza que deseja excluir esta missão?")) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: window.authManager.getAuthHeaders(),
      });

      if (response.ok) {
        const result = await response.json();
        this.showNotification(result.message, "success");

        // Remover da lista e re-renderizar
        this.tasks[type] = this.tasks[type].filter(
          (task) => task.id !== taskId
        );
        this.renderTasks(type);
      } else {
        const error = await response.json();
        this.showNotification(error.message, "error");
      }
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      this.showNotification("Erro ao excluir missão", "error");
    }
  }

  async loadHistory() {
    try {
      const response = await fetch("/api/tasks/history", {
        headers: window.authManager.getAuthHeaders(),
      });

      if (response.ok) {
        const history = await response.json();
        this.renderHistory(history);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  }

  renderHistory(history) {
    const container = document.getElementById("history-tasks-list");
    if (!container) return;

    container.innerHTML = "";

    if (history.length === 0) {
      container.innerHTML =
        '<p class="no-history">Nenhuma missão completada ainda. Comece sua jornada espacial!</p>';
      return;
    }

    history.forEach((task) => {
      const taskDiv = document.createElement("div");
      taskDiv.className = "task-item completed";

      const priorityClass = `priority-${task.priority}`;
      const priorityText =
        {
          low: "Baixa",
          normal: "Normal",
          critical: "Crítica",
        }[task.priority] || "Normal";

      const completedDate = new Date(task.completed_at).toLocaleDateString(
        "pt-BR"
      );

      taskDiv.innerHTML = `
                <div class="task-content">
                    <div class="task-title">${this.escapeHtml(
                      task.task_title
                    )}</div>
                    ${
                      task.task_description
                        ? `<div class="task-description">${this.escapeHtml(
                            task.task_description
                          )}</div>`
                        : ""
                    }
                    <div class="task-meta">
                        <span class="priority-badge ${priorityClass}">${priorityText}</span>
                        <span class="task-type">${
                          task.type === "daily" ? "Diária" : "Semanal"
                        }</span>
                        <span class="completed-date">Concluída em ${completedDate}</span>
                        <span class="focus-points">+${
                          task.focus_points_earned || 1
                        } pontos</span>
                    </div>
                </div>
            `;

      container.appendChild(taskDiv);
    });
  }

  closeModal() {
    document.getElementById("edit-task-modal").classList.remove("active");
    this.editingTask = null;
  }

  showNotification(message, type) {
    // Criar elemento de notificação
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Estilo da notificação
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 5px;
            color: white;
            font-family: var(--font-main);
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

    // Cor baseada no tipo
    switch (type) {
      case "success":
        notification.style.background = "rgba(0, 255, 136, 0.9)";
        notification.style.border = "1px solid var(--neon-green)";
        break;
      case "error":
        notification.style.background = "rgba(255, 136, 0, 0.9)";
        notification.style.border = "1px solid var(--neon-orange)";
        break;
      case "info":
        notification.style.background = "rgba(0, 255, 255, 0.9)";
        notification.style.border = "1px solid var(--neon-cyan)";
        break;
    }

    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Remover após 4 segundos
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 4000);
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}
