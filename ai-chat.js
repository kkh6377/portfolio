(function () {
  if (document.querySelector(".ai-chat-launcher")) return;

  const launcher = document.createElement("button");
  launcher.className = "ai-chat-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Ask Portfolio 열기");
  launcher.innerHTML = `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="aiIconGradient" x1="10" y1="54" x2="54" y2="10" gradientUnits="userSpaceOnUse">
          <stop stop-color="#1D4ED8" />
          <stop offset="0.45" stop-color="#38BDF8" />
          <stop offset="1" stop-color="#8B5CF6" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill="#ffffff" />
      <path
        d="M32 12c6 0 10 4 10 10 0 4-2 7-5 9 4 1 8 5 8 10 0 6-5 11-12 11-5 0-9-3-11-7-2 2-5 3-8 3-6 0-10-4-10-10 0-5 3-9 8-10-2-2-4-5-4-9 0-6 5-10 11-10 5 0 9 3 11 7 1-2 2-4 2-4Z"
        fill="url(#aiIconGradient)"
        opacity="0.95"
      />
      <circle cx="24" cy="31" r="3" fill="#ffffff" />
      <circle cx="39" cy="31" r="3" fill="#ffffff" />
      <path d="M27 40c3 3 9 3 12 0" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
    </svg>
  `;
  document.body.appendChild(launcher);

  const chat = document.createElement("div");
  chat.className = "ai-chat-window";
  chat.innerHTML = `
    <div class="ai-chat-header">
      <h3>Ask Portfolio</h3>
      <button class="ai-chat-close" type="button" aria-label="AI 채팅 닫기">×</button>
    </div>

    <div class="ai-chat-messages" id="aiChatMessages"></div>

    <form class="ai-chat-form">
      <input type="text" placeholder="How else can I help?" autocomplete="off" />
      <button type="submit" aria-label="질문 보내기">↑</button>
    </form>
  `;
  document.body.appendChild(chat);

  const messages = chat.querySelector("#aiChatMessages");
  const form = chat.querySelector(".ai-chat-form");
  const input = form.querySelector("input");
  const closeButton = chat.querySelector(".ai-chat-close");

  addMessage(
    "bot",
    "안녕하세요. 이 포트폴리오의 프로젝트, 기술 스택, 연락 방법에 대해 답변할 수 있어요."
  );

  launcher.addEventListener("click", () => {
    chat.classList.toggle("open");
  });

  closeButton.addEventListener("click", () => {
    chat.classList.remove("open");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    sendMessage(text);
  });

  function addMessage(role, text) {
    const row = document.createElement("div");
    row.className = `ai-message-row ${role}`;

    if (role === "bot") {
      row.innerHTML = `
        <div class="ai-bot-avatar"></div>
        <div class="ai-message bot"></div>
      `;
      row.querySelector(".ai-message").textContent = text;
    } else {
      row.innerHTML = `<div class="ai-message user"></div>`;
      row.querySelector(".ai-message").textContent = text;
    }

    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    return row;
  }

  function addThinkingMessage() {
    const row = document.createElement("div");
    row.className = "ai-message-row bot ai-thinking-row";
    row.innerHTML = `
      <div class="ai-bot-avatar thinking"></div>
      <div class="ai-message bot ai-thinking-message">
        <span>생각하는 중</span>
        <span class="ai-thinking-dots">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </div>
    `;
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    return row;
  }

  async function sendMessage(text) {
    addMessage("user", text);

    const loadingRow = addThinkingMessage();

    try {
      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();

      loadingRow.remove();
      addMessage("bot", data.answer || "답변을 가져오지 못했습니다.");
    } catch (error) {
      loadingRow.remove();
      addMessage("bot", "AI 연결 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  }
})();