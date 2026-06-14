(function () {
  if (document.querySelector(".ai-chat-launcher")) return;

  const suggestions = [
    "대표 프로젝트를 알려줘",
    "사용 가능한 기술 스택은?",
    "채용 담당자 관점에서 요약해줘",
    "VR 프로젝트 설명해줘",
    "연락 방법 알려줘"
  ];

  const aiIcon = `
    <svg class="ai-symbol" viewBox="0 0 128 128" aria-hidden="true">
      <rect x="4" y="4" width="120" height="120" rx="30" fill="#191919" />
      <path
        d="M29 60c0-14 8-25 21-28 4-13 17-20 31-17 9 2 16 8 20 16 16-4 30 7 32 23 13 3 21 14 20 28"
        fill="none"
        stroke="url(#aiChatGradient)"
        stroke-width="7"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M24 75h11c5 19 23 31 50 31 32 0 56-17 63-43h10"
        fill="none"
        stroke="url(#aiChatGradient)"
        stroke-width="7"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M43 94l-8 24 25-8"
        fill="none"
        stroke="url(#aiChatGradient)"
        stroke-width="7"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M50 35c-8 8-7 19 2 25"
        fill="none"
        stroke="url(#aiChatGradient)"
        stroke-width="7"
        stroke-linecap="round"
      />
      <path
        d="M83 20c-9 7-11 20-4 30"
        fill="none"
        stroke="url(#aiChatGradient)"
        stroke-width="7"
        stroke-linecap="round"
      />
      <path
        d="M100 41c10 2 17 9 20 19"
        fill="none"
        stroke="url(#aiChatGradient)"
        stroke-width="7"
        stroke-linecap="round"
      />
      <circle cx="55" cy="74" r="5.5" fill="url(#aiChatGradient)" />
      <circle cx="75" cy="74" r="5.5" fill="url(#aiChatGradient)" />
      <circle cx="95" cy="74" r="5.5" fill="url(#aiChatGradient)" />
      <defs>
        <linearGradient id="aiChatGradient" x1="26" y1="18" x2="112" y2="107" gradientUnits="userSpaceOnUse">
          <stop stop-color="#8CFF91" />
          <stop offset="1" stop-color="#57F4D4" />
        </linearGradient>
      </defs>
    </svg>
  `;

  const launcher = document.createElement("button");
  launcher.className = "ai-chat-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-label", "AI chat 열기");
  launcher.innerHTML = `
    <span class="ai-launcher-icon">${aiIcon}</span>
    <span class="ai-launcher-label">AI chat</span>
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

    <div class="ai-chat-suggestions">
      ${suggestions.map((text) => `<button type="button">${text}</button>`).join("")}
    </div>

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
  const suggestionButtons = chat.querySelectorAll(".ai-chat-suggestions button");

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

  suggestionButtons.forEach((suggestionButton) => {
    suggestionButton.addEventListener("click", () => {
      sendMessage(suggestionButton.textContent);
    });
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
        <div class="ai-bot-avatar">${aiIcon}</div>
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
      <div class="ai-bot-avatar thinking">${aiIcon}</div>
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