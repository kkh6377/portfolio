(function () {
  if (document.querySelector(".ai-chat-button")) return;

  const suggestions = [
    "대표 프로젝트를 알려줘",
    "사용 가능한 기술 스택은?",
    "채용 담당자 관점에서 요약해줘",
    "연락 방법 알려줘"
  ];

  const button = document.createElement("button");
  button.className = "ai-chat-button";
  button.type = "button";
  button.setAttribute("aria-label", "AI Portfolio Assistant 열기");
  button.innerHTML = `
    <svg viewBox="0 0 128 128" aria-hidden="true">
      <path
        d="M64 13C34 13 10 34 10 60c0 16 8 30 22 39l-6 20 23-9c5 1 10 2 15 2 30 0 54-21 54-49S94 13 64 13Z"
        fill="#ffffff"
        stroke="#101936"
        stroke-width="8"
        stroke-linejoin="round"
      />
      <rect
        x="37"
        y="46"
        width="54"
        height="35"
        rx="11"
        fill="#ffffff"
        stroke="#101936"
        stroke-width="7"
      />
      <rect x="25" y="51" width="13" height="25" rx="6" fill="#101936" />
      <rect x="90" y="51" width="13" height="25" rx="6" fill="#101936" />
      <line x1="31" y1="47" x2="31" y2="36" stroke="#101936" stroke-width="5" stroke-linecap="round" />
      <line x1="97" y1="47" x2="97" y2="36" stroke="#101936" stroke-width="5" stroke-linecap="round" />
      <rect x="47" y="56" width="9" height="16" rx="5" fill="#101936" />
      <rect x="72" y="56" width="9" height="16" rx="5" fill="#101936" />
      <path d="M57 75c3 4 11 4 14 0" fill="none" stroke="#101936" stroke-width="5" stroke-linecap="round" />
    </svg>
  `;
  document.body.appendChild(button);

  const chat = document.createElement("div");
  chat.className = "ai-chat-window";
  chat.innerHTML = `
    <div class="ai-chat-header">
      <h3>AI Portfolio Assistant</h3>
      <p>포트폴리오에 대해 질문해보세요.</p>
    </div>

    <div class="ai-chat-messages" id="aiChatMessages">
      <div class="ai-message bot">
        안녕하세요. 이 포트폴리오의 프로젝트, 기술 스택, 연락 방법에 대해 답변할 수 있어요.
      </div>
    </div>

    <div class="ai-chat-suggestions">
      ${suggestions.map((text) => `<button type="button">${text}</button>`).join("")}
    </div>

    <form class="ai-chat-form">
      <input type="text" placeholder="질문을 입력하세요" autocomplete="off" />
      <button type="submit">전송</button>
    </form>
  `;
  document.body.appendChild(chat);

  const messages = chat.querySelector("#aiChatMessages");
  const form = chat.querySelector(".ai-chat-form");
  const input = form.querySelector("input");
  const suggestionButtons = chat.querySelectorAll(".ai-chat-suggestions button");

  button.addEventListener("click", () => {
    chat.classList.toggle("open");
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

  async function sendMessage(text) {
    addMessage("user", text);

    const loadingMessage = document.createElement("div");
    loadingMessage.className = "ai-message bot";
    loadingMessage.textContent = "답변을 작성하고 있어요...";
    messages.appendChild(loadingMessage);
    messages.scrollTop = messages.scrollHeight;

    try {
      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();

      loadingMessage.textContent =
        data.answer || "답변을 가져오지 못했습니다.";
    } catch (error) {
      loadingMessage.textContent =
        "AI 연결 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
    }
  }
})();