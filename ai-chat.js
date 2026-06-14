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
    <svg class="ai-symbol" viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="18" fill="#191919" />
      <path
        d="M18 33c0-10 6-18 15-20 8-2 17 2 21 10 6 2 10 7 10 14 0 10-9 18-21 18H31l-13 6 3-12c-4-4-6-9-6-16Z"
        fill="none"
        stroke="#67f5b5"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M30 13c-4 5-4 12 1 17"
        fill="none"
        stroke="#67f5b5"
        stroke-width="4"
        stroke-linecap="round"
      />
      <path
        d="M43 18c5 2 8 6 9 11"
        fill="none"
        stroke="#67f5b5"
        stroke-width="4"
        stroke-linecap="round"
      />
      <circle cx="29" cy="37" r="2.8" fill="#67f5b5" />
      <circle cx="39" cy="37" r="2.8" fill="#67f5b5" />
      <circle cx="49" cy="37" r="2.8" fill="#67f5b5" />
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