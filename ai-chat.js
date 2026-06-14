(function () {
  if (document.querySelector(".ai-chat-launcher")) return;

  const suggestions = [
    "대표 프로젝트를 알려줘",
    "사용 가능한 기술 스택은?",
    "채용 담당자 관점에서 요약해줘",
    "연락 방법 알려줘"
  ];

  const robotIcon = `
    <svg class="ai-robot-icon" viewBox="0 0 64 64" aria-hidden="true">
      <rect x="14" y="22" width="36" height="24" rx="12" fill="currentColor" />
      <circle cx="25" cy="34" r="4" fill="#101820" />
      <circle cx="39" cy="34" r="4" fill="#101820" />
      <path d="M29 40c2 2 4 2 6 0" fill="none" stroke="#101820" stroke-width="3" stroke-linecap="round" />
      <path d="M24 18l-3-6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
      <path d="M40 18l3-6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
      <circle cx="20" cy="10" r="2" fill="currentColor" />
      <circle cx="44" cy="10" r="2" fill="currentColor" />
    </svg>
  `;

  const launcher = document.createElement("button");
  launcher.className = "ai-chat-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Ask Portfolio 열기");
  launcher.innerHTML = `
    <span class="ai-launcher-icon">${robotIcon}</span>
    <span class="ai-launcher-text">Ask Portfolio</span>
  `;
  document.body.appendChild(launcher);

  const chat = document.createElement("div");
  chat.className = "ai-chat-window";
  chat.innerHTML = `
    <div class="ai-chat-header">
      <button class="ai-chat-close" type="button" aria-label="AI 채팅 닫기">‹</button>
      <div>
        <h3>Ask Portfolio</h3>
        <p>포트폴리오에 대해 질문해보세요.</p>
      </div>
    </div>

    <div class="ai-chat-messages" id="aiChatMessages"></div>

    <div class="ai-chat-suggestions">
      ${suggestions.map((text) => `<button type="button">${text}</button>`).join("")}
    </div>

    <form class="ai-chat-form">
      <input type="text" placeholder="Ask a question..." autocomplete="off" />
      <button type="submit" aria-label="질문 보내기">→</button>
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
    const message = document.createElement("div");
    message.className = `ai-message ${role}`;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  }

  function addThinkingMessage() {
    const message = document.createElement("div");
    message.className = "ai-message bot ai-thinking-message";
    message.innerHTML = `
      <span class="ai-thinking-robot">
        <span class="ai-thinking-eye"></span>
        <span class="ai-thinking-eye"></span>
      </span>
      <span class="ai-thinking-text">생각하는 중</span>
      <span class="ai-thinking-dots">
        <span></span>
        <span></span>
        <span></span>
      </span>
    `;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
    return message;
  }

  async function sendMessage(text) {
    addMessage("user", text);

    const loadingMessage = addThinkingMessage();

    try {
      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();

      loadingMessage.className = "ai-message bot";
      loadingMessage.textContent =
        data.answer || "답변을 가져오지 못했습니다.";
    } catch (error) {
      loadingMessage.className = "ai-message bot";
      loadingMessage.textContent =
        "AI 연결 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
    }
  }
})();