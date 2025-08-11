// Classe para gerenciar o Timer Pomodoro
class PomodoroTimer {
  constructor() {
    this.duration = 25 * 60; // 25 minutos em segundos
    this.timeLeft = this.duration;
    this.isRunning = false;
    this.intervalId = null;

    this.minutesDisplay = document.getElementById("timer-minutes");
    this.secondsDisplay = document.getElementById("timer-seconds");
    this.statusText = document.getElementById("timer-status-text");
    this.startBtn = document.getElementById("timer-start");
    this.pauseBtn = document.getElementById("timer-pause");
    this.resetBtn = document.getElementById("timer-reset");

    this.init();
  }

  init() {
    this.updateDisplay();
    // Aguardar um pequeno delay para garantir que os elementos estão disponíveis
    setTimeout(() => {
      this.setupEventListeners();
    }, 100);
  }

  setupEventListeners() {
    console.log("Timer: Configurando event listeners...");

    if (this.startBtn) {
      this.startBtn.addEventListener("click", () => {
        console.log("Timer: Botão start clicado");
        this.start();
      });
      console.log("Timer: Event listener do botão start configurado");
    } else {
      console.warn("Timer: Botão start não encontrado");
    }

    if (this.pauseBtn) {
      this.pauseBtn.addEventListener("click", () => {
        console.log("Timer: Botão pause clicado");
        this.pause();
      });
      console.log("Timer: Event listener do botão pause configurado");
    } else {
      console.warn("Timer: Botão pause não encontrado");
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener("click", () => {
        console.log("Timer: Botão reset clicado");
        this.reset();
      });
      console.log("Timer: Event listener do botão reset configurado");
    } else {
      console.warn("Timer: Botão reset não encontrado");
    }
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startBtn.style.display = "none";
    this.pauseBtn.style.display = "inline-block";
    this.statusText.textContent = "Navegando pelo hiperespaço...";

    this.intervalId = setInterval(() => {
      this.timeLeft--;
      this.updateDisplay();

      if (this.timeLeft <= 0) {
        this.complete();
      }
    }, 1000);
  }

  pause() {
    if (!this.isRunning) return;

    this.isRunning = false;
    clearInterval(this.intervalId);
    this.startBtn.style.display = "inline-block";
    this.pauseBtn.style.display = "none";
    this.statusText.textContent = "Navegação pausada";
  }

  reset() {
    this.isRunning = false;
    clearInterval(this.intervalId);
    this.timeLeft = this.duration;
    this.updateDisplay();
    this.startBtn.style.display = "inline-block";
    this.pauseBtn.style.display = "none";
    this.statusText.textContent = "Pronto para foco";
  }

  complete() {
    this.isRunning = false;
    clearInterval(this.intervalId);
    this.timeLeft = 0;
    this.updateDisplay();
    this.startBtn.style.display = "inline-block";
    this.pauseBtn.style.display = "none";
    this.statusText.textContent = "Sessão de foco completa!";

    // Efeito visual de conclusão
    this.showCompletionEffect();

    // Tocar som ou mostrar notificação (se permitido)
    this.showNotification();
  }

  updateDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;

    if (this.minutesDisplay) {
      this.minutesDisplay.textContent = minutes.toString().padStart(2, "0");
    }

    if (this.secondsDisplay) {
      this.secondsDisplay.textContent = seconds.toString().padStart(2, "0");
    }

    // Atualizar cor baseada no tempo restante
    const timerDisplay = document.querySelector(".timer-display");
    if (timerDisplay) {
      if (this.timeLeft <= 60 && this.isRunning) {
        // Último minuto
        timerDisplay.style.color = "var(--neon-orange)";
        timerDisplay.style.textShadow = "0 0 10px var(--neon-orange)";
      } else if (this.timeLeft <= 300 && this.isRunning) {
        // Últimos 5 minutos
        timerDisplay.style.color = "var(--neon-yellow)";
        timerDisplay.style.textShadow = "0 0 10px var(--neon-yellow)";
      } else {
        timerDisplay.style.color = "var(--neon-cyan)";
        timerDisplay.style.textShadow = "0 0 10px var(--neon-cyan)";
      }
    }
  }

  showCompletionEffect() {
    const timerDisplay = document.querySelector(".timer-display");
    if (timerDisplay) {
      timerDisplay.style.color = "var(--neon-green)";
      timerDisplay.style.textShadow = "0 0 20px var(--neon-green)";
      timerDisplay.style.animation = "pulse 0.5s ease-in-out 3";

      setTimeout(() => {
        timerDisplay.style.animation = "";
      }, 1500);
    }
  }

  showNotification() {
    // Verificar se as notificações são suportadas
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Orbit - Sessão de Foco Completa!", {
          body: "Parabéns! Você completou uma sessão de 25 minutos de foco.",
          icon: "/assets/orbit-icon.png", // Você pode adicionar um ícone depois
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("Orbit - Sessão de Foco Completa!", {
              body: "Parabéns! Você completou uma sessão de 25 minutos de foco.",
              icon: "/assets/orbit-icon.png",
            });
          }
        });
      }
    }

    // Fallback: mostrar alerta no estilo da aplicação
    if (window.app && window.app.showNotification) {
      window.app.showNotification("Sessão de foco completa! 🚀", "success");
    }
  }

  // Método para definir um tempo customizado (para testes ou preferências)
  setDuration(minutes) {
    this.duration = minutes * 60;
    if (!this.isRunning) {
      this.timeLeft = this.duration;
      this.updateDisplay();
    }
  }

  // Getter para o tempo restante em minutos
  get remainingMinutes() {
    return Math.floor(this.timeLeft / 60);
  }

  // Getter para verificar se está rodando
  get running() {
    return this.isRunning;
  }
}

// Exportar para uso global
window.PomodoroTimer = PomodoroTimer;
