(function () {
  if (document.querySelector(".ai-chat-launcher")) return;

  const suggestions = [
    "대표 프로젝트를 알려줘",
    "사용 가능한 기술 스택은?",
    "블렌더 갤러리를 보고싶어",
    "깃허브 링크를 구경하고싶어",
    "연락 방법 알려줘"
  ];

  function createAiIcon(idSuffix) {
    const gradientId = `aiCloudGradient-${idSuffix}`;
    const softGradientId = `aiCloudSoftGradient-${idSuffix}`;

    return `
      <svg class="ai-symbol" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id="${gradientId}" x1="18" y1="82" x2="82" y2="18" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5B7CFF" />
            <stop offset="0.35" stop-color="#33D6FF" />
            <stop offset="0.68" stop-color="#76FFB2" />
            <stop offset="1" stop-color="#B16CFF" />
          </linearGradient>
          <radialGradient id="${softGradientId}" cx="35%" cy="30%" r="70%">
            <stop stop-color="#8CFFB5" stop-opacity="0.42" />
            <stop offset="0.55" stop-color="#38BDF8" stop-opacity="0.16" />
            <stop offset="1" stop-color="#8B5CF6" stop-opacity="0" />
          </radialGradient>
        </defs>
        <path d="M26 67C15 67 8 59 8 49c0-9 6-16 15-18C27 17 39 9 53 11c11 2 20 10 24 21 10 2 17 10 17 20 0 12-9 21-22 21H38L20 84l5-17Z" fill="url(#${softGradientId})" />
        <path d="M26 67C15 67 8 59 8 49c0-9 6-16 15-18C27 17 39 9 53 11c11 2 20 10 24 21 10 2 17 10 17 20 0 12-9 21-22 21H38L20 84l5-17Z" fill="none" stroke="url(#${gradientId})" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M33 47c3-9 11-15 21-15 9 0 17 5 21 13" fill="none" stroke="url(#${gradientId})" stroke-width="5" stroke-linecap="round" />
        <path d="M38 60c6 6 18 6 24 0" fill="none" stroke="url(#${gradientId})" stroke-width="5" stroke-linecap="round" />
        <circle class="ai-cloud-dot" cx="36" cy="54" r="4.2" fill="url(#${gradientId})" />
        <circle class="ai-cloud-dot" cx="50" cy="54" r="4.2" fill="url(#${gradientId})" />
        <circle class="ai-cloud-dot" cx="64" cy="54" r="4.2" fill="url(#${gradientId})" />
      </svg>
    `;
  }

  const launcher = document.createElement("button");
  launcher.className = "ai-chat-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-label", "AI chat 열기");
  launcher.innerHTML = `
    <span class="ai-launcher-icon">${createAiIcon("launcher")}</span>
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

  const savedConversation = getSavedConversation();

  if (savedConversation) {
    chat.classList.add("open");
    addMessage("user", savedConversation.question);
    addMessage("bot", savedConversation.answer);
  } else {
    addMessage("bot", "안녕하세요. 이 포트폴리오의 프로젝트, 기술 스택, 연락 방법에 대해 답변할 수 있어요.");
  }

  scrollToSavedTarget();

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

  function getSavedConversation() {
    try {
      const raw = sessionStorage.getItem("aiChatLastConversation");
      if (!raw) return null;
      sessionStorage.removeItem("aiChatLastConversation");
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function normalizePath(path) {
    if (!path) return "/";
    return path.replace(/\/$/, "") || "/";
  }

  function getNavigationTarget(question) {
    const text = question.toLowerCase().replace(/\s+/g, "");

    if (text.includes("깃허브") || text.includes("github")) {
      return {
        type: "external",
        url: "https://github.com/kkh6377"
      };
    }

    if (text.includes("블렌더") || text.includes("blender") || text.includes("갤러리") || text.includes("gallery")) {
      return {
        type: "internal",
        path: "/about",
        scrollTarget: "blender"
      };
    }

    if (text.includes("사용가능한기술스택") || text.includes("기술스택") || text.includes("사용기술") || text.includes("스택") || text.includes("skill")) {
      return {
        type: "internal",
        path: "/#clients",
        scrollTarget: "clients"
      };
    }

    if (text.includes("대표프로젝트") || text.includes("대표작") || text.includes("프로젝트알려줘") || text.includes("프로젝트보여줘")) {
      return {
        type: "internal",
        path: "/work#all",
        scrollTarget: "projects"
      };
    }

    if (text.includes("연락") || text.includes("문의") || text.includes("contact") || text.includes("이메일") || text.includes("메일")) {
      return {
        type: "internal",
        path: "/contact"
      };
    }

    if (text.includes("vr") || text.includes("운전") || text.includes("시뮬레이터") || text.includes("drive")) {
      return {
        type: "internal",
        path: "/work/vr"
      };
    }

    if (text.includes("escaperoom") || text.includes("escape") || text.includes("방탈출") || text.includes("사막") || text.includes("우주")) {
      return {
        type: "internal",
        path: "/work/escaperoom-desert-space-theme-project"
      };
    }

    if (text.includes("hi-five") || text.includes("hifive") || text.includes("아이돌") || text.includes("뮤직비디오")) {
      return {
        type: "internal",
        path: "/work/rivian"
      };
    }

    if (text.includes("shooting") || text.includes("roblox") || text.includes("좀비") || text.includes("슈팅")) {
      return {
        type: "internal",
        path: "/work/nothing"
      };
    }

    if (text.includes("about") || text.includes("소개") || text.includes("자기소개") || text.includes("개발자")) {
      return {
        type: "internal",
        path: "/about"
      };
    }

    return null;
  }

  function saveConversation(question, answer) {
    sessionStorage.setItem(
      "aiChatLastConversation",
      JSON.stringify({ question, answer })
    );
  }

  function moveToRelatedPage(question, answer) {
    const target = getNavigationTarget(question);
    if (!target) return;

    if (target.type === "external") {
      window.setTimeout(() => {
        window.location.href = target.url;
      }, 1400);
      return;
    }

    const targetPathOnly = target.path.split("#")[0] || "/";
    const currentPath = normalizePath(window.location.pathname);
    const nextPath = normalizePath(targetPathOnly);

    if (target.scrollTarget) {
      sessionStorage.setItem("aiChatScrollTarget", target.scrollTarget);
    }

    saveConversation(question, answer);

    window.setTimeout(() => {
      if (currentPath === nextPath) {
        scrollToSavedTarget();
        return;
      }

      window.location.href = target.path;
    }, 1400);
  }

  function scrollToSavedTarget() {
    const target = sessionStorage.getItem("aiChatScrollTarget");
    if (!target) return;

    sessionStorage.removeItem("aiChatScrollTarget");

    const keywordMap = {
      blender: ["a small look into my blender gallery", "blender gallery", "blender"],
      clients: ["clients"],
      projects: ["4+", "projects", "escaperoom", "vr drive simulator"]
    };

    const keywords = keywordMap[target] || [target];

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;

      const element = findElementByKeywords(keywords);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
        window.clearInterval(timer);
        return;
      }

      if (attempts > 20) {
        window.clearInterval(timer);
      }
    }, 250);
  }

  function findElementByKeywords(keywords) {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const text = node.textContent.toLowerCase().replace(/\s+/g, " ").trim();
          if (!text) return NodeFilter.FILTER_REJECT;

          const hasKeyword = keywords.some((keyword) => text.includes(keyword));
          return hasKeyword ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
      }
    );

    let current = walker.nextNode();

    while (current) {
      const element = current.parentElement;
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          return element;
        }
      }

      current = walker.nextNode();
    }

    return null;
  }

  function addMessage(role, text) {
    const row = document.createElement("div");
    row.className = `ai-message-row ${role}`;

    if (role === "bot") {
      const iconId = `bot-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      row.innerHTML = `
        <div class="ai-bot-avatar">${createAiIcon(iconId)}</div>
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
    const iconId = `thinking-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const row = document.createElement("div");
    row.className = "ai-message-row bot ai-thinking-row";
    row.innerHTML = `
      <div class="ai-bot-avatar thinking">${createAiIcon(iconId)}</div>
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();
      const answer = data.answer || "답변을 가져오지 못했습니다.";

      loadingRow.remove();
      addMessage("bot", answer);
      moveToRelatedPage(text, answer);
    } catch (error) {
      loadingRow.remove();
      addMessage("bot", "AI 연결 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  }
})();