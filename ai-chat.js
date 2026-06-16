(function () {
  if (document.querySelector(".ai-chat-launcher")) return;

  const suggestions = [
    "대표 프로젝트를 알려줘",
    "사용 가능한 기술 스택은?",
    "채용 담당자 관점에서 요약해줘",
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
      <div>
        <h3>Ask Portfolio</h3>
        <p>프로젝트 설명, 기술 스택, 관련 페이지 이동까지 도와드려요.</p>
      </div>
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
    if (savedConversation.notice) addNotice(savedConversation.notice);
  } else {
    addMessage("bot", "안녕하세요. 이 포트폴리오의 프로젝트, 기술 스택, 연락 방법에 대해 답변할 수 있어요.");
  }

  window.setTimeout(scrollToSavedTarget, 450);

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

  function getHashFromPath(path) {
    if (!path.includes("#")) return "";
    return decodeURIComponent(path.split("#")[1] || "");
  }

  function getNavigationTarget(question) {
    const text = question.toLowerCase().replace(/\s+/g, "");

    if (text.includes("깃허브") || text.includes("github")) {
      return {
        type: "external",
        url: "https://github.com/kkh6377",
        label: "GitHub"
      };
    }

    if (text.includes("블렌더") || text.includes("blender") || text.includes("갤러리") || text.includes("gallery")) {
      return {
        type: "internal",
        path: "/about",
        scrollTarget: "blender",
        label: "Blender Gallery"
      };
    }

    if (
      text.includes("사용가능한기술스택") ||
      text.includes("기술스택") ||
      text.includes("사용기술") ||
      text.includes("스택") ||
      text.includes("skill")
    ) {
      return {
        type: "internal",
        path: "/#clients",
        scrollTarget: "clients",
        label: "기술 스택 영역"
      };
    }

    if (
      text.includes("대표프로젝트") ||
      text.includes("대표작") ||
      text.includes("프로젝트알려줘") ||
      text.includes("프로젝트보여줘")
    ) {
      return {
        type: "internal",
        path: "/work#all",
        scrollTarget: "projects",
        label: "대표 프로젝트 영역"
      };
    }

    if (text.includes("연락") || text.includes("문의") || text.includes("contact") || text.includes("이메일") || text.includes("메일")) {
      return {
        type: "internal",
        path: "/contact",
        scrollTarget: "contact",
        label: "Contact 페이지"
      };
    }

    if (text.includes("vr") || text.includes("운전") || text.includes("시뮬레이터") || text.includes("drive")) {
      return {
        type: "internal",
        path: "/work/vr",
        scrollTarget: "projectDetail",
        label: "VR Drive Simulator 페이지"
      };
    }

    if (text.includes("escaperoom") || text.includes("escape") || text.includes("방탈출") || text.includes("사막") || text.includes("우주")) {
      return {
        type: "internal",
        path: "/work/escaperoom-desert-space-theme-project",
        scrollTarget: "projectDetail",
        label: "EscapeRoom 프로젝트 페이지"
      };
    }

    if (text.includes("hi-five") || text.includes("hifive") || text.includes("아이돌") || text.includes("뮤직비디오")) {
      return {
        type: "internal",
        path: "/work/rivian",
        scrollTarget: "projectDetail",
        label: "HI-five 프로젝트 페이지"
      };
    }

    if (text.includes("shooting") || text.includes("roblox") || text.includes("좀비") || text.includes("슈팅")) {
      return {
        type: "internal",
        path: "/work/nothing",
        scrollTarget: "projectDetail",
        label: "Powerful Shooting 프로젝트 페이지"
      };
    }

    if (text.includes("about") || text.includes("소개") || text.includes("자기소개") || text.includes("개발자")) {
      return {
        type: "internal",
        path: "/about",
        scrollTarget: "about",
        label: "About 페이지"
      };
    }

    return null;
  }

  function saveConversation(question, answer, notice) {
    sessionStorage.setItem("aiChatLastConversation", JSON.stringify({
      question,
      answer,
      notice
    }));
  }

  function moveToRelatedPage(question, answer) {
    const target = getNavigationTarget(question);
    if (!target) return;

    if (target.type === "external") {
      addNotice(`${target.label} 링크로 이동할게요.`);
      window.setTimeout(() => {
        window.location.href = target.url;
      }, 1200);
      return;
    }

    const hash = getHashFromPath(target.path);
    const targetPathOnly = target.path.split("#")[0] || "/";
    const currentPath = normalizePath(window.location.pathname);
    const nextPath = normalizePath(targetPathOnly);

    addNotice(`${target.label}로 이동할게요.`);

    if (target.scrollTarget) {
      sessionStorage.setItem("aiChatScrollTarget", target.scrollTarget);
    }

    if (hash) {
      sessionStorage.setItem("aiChatScrollHash", hash);
    }

    window.setTimeout(() => {
      if (currentPath === nextPath) {
        if (hash) {
          window.history.replaceState(null, "", target.path);
        }

        scrollToSavedTarget();
        addNotice(`${target.label}을 강조했어요.`);
        return;
      }

      saveConversation(question, answer, `${target.label}로 이동했어요. 관련 영역을 강조해둘게요.`);
      window.location.href = target.path;
    }, 1200);
  }

  function getScrollConfig(target, hash) {
    const configs = {
      blender: {
        hashes: ["blender", "gallery"],
        keywords: ["a small look into my blender gallery", "blender gallery", "blender"]
      },
      clients: {
        hashes: ["clients"],
        keywords: ["clients", "c#", "python", "unity", "unreal engine", "blender", "javascript"]
      },
      projects: {
        hashes: ["all", "work", "projects"],
        keywords: ["escaperoom", "vr drive simulator", "hi-five", "powerful shooting"]
      },
      contact: {
        hashes: ["contact"],
        keywords: ["contact", "book a call", "send a text", "email", "message"]
      },
      about: {
        hashes: ["about"],
        keywords: ["about", "i am", "developer", "blender"]
      },
      projectDetail: {
        hashes: [],
        keywords: ["read time", "client", "industry", "duration", "start", "end"]
      }
    };

    const config = configs[target] || {
      hashes: [],
      keywords: []
    };

    if (hash && !config.hashes.includes(hash)) {
      config.hashes.unshift(hash);
    }

    return config;
  }

  function scrollToSavedTarget() {
    const target = sessionStorage.getItem("aiChatScrollTarget");
    const hash = sessionStorage.getItem("aiChatScrollHash") || window.location.hash.replace("#", "");

    if (!target && !hash) return;

    sessionStorage.removeItem("aiChatScrollTarget");
    sessionStorage.removeItem("aiChatScrollHash");

    const config = getScrollConfig(target, hash);

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;

      const element =
        findElementByHashes(config.hashes) ||
        findSectionByKeywords(config.keywords, target);

      if (element) {
        const highlightTarget = getHighlightTarget(element, target);

        highlightTarget.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

        window.setTimeout(() => {
          highlightElement(highlightTarget);
        }, 450);

        window.clearInterval(timer);
        return;
      }

      if (attempts > 28) {
        window.clearInterval(timer);
      }
    }, 250);
  }

  function safeSelectorValue(value) {
    return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  function isInsideChat(element) {
    return Boolean(element.closest(".ai-chat-window, .ai-chat-launcher"));
  }

  function isVisibleElement(element) {
    if (!element || element === document.body || element === document.documentElement) return false;
    if (isInsideChat(element)) return false;

    const rect = element.getBoundingClientRect();
    return rect.width > 12 && rect.height > 12;
  }

  function getUsableElement(element) {
    if (!element) return null;

    if (isVisibleElement(element)) return element;

    const children = Array.from(element.querySelectorAll("*"));
    const visibleChild = children.find(isVisibleElement);
    if (visibleChild) return visibleChild;

    let next = element.nextElementSibling;
    while (next) {
      if (isVisibleElement(next)) return next;
      next = next.nextElementSibling;
    }

    let parent = element.parentElement;
    while (parent && parent !== document.body) {
      if (isVisibleElement(parent)) return parent;
      parent = parent.parentElement;
    }

    return null;
  }

  function findElementByHashes(hashes) {
    for (const rawHash of hashes) {
      if (!rawHash) continue;

      const hash = rawHash.replace(/^#/, "");
      const escapedHash = safeSelectorValue(hash);

      const direct =
        document.getElementById(hash) ||
        document.querySelector(`[name="${escapedHash}"]`);

      const usableDirect = getUsableElement(direct);
      if (usableDirect) return usableDirect;

      const attributeMatch = findElementByAttributeText(hash);
      if (attributeMatch) return attributeMatch;
    }

    return null;
  }

  function findElementByAttributeText(keyword) {
    const normalizedKeyword = keyword.toLowerCase();
    const attributes = ["id", "name", "aria-label", "data-framer-name", "data-testid"];

    const elements = Array.from(document.querySelectorAll("*"));

    for (const element of elements) {
      if (isInsideChat(element)) continue;

      const hasMatch = attributes.some((attribute) => {
        const value = element.getAttribute(attribute);
        return value && value.toLowerCase().includes(normalizedKeyword);
      });

      if (hasMatch) {
        const usable = getUsableElement(element);
        if (usable) return usable;
      }
    }

    return null;
  }

  function countKeywordMatches(text, keywords) {
    return keywords.reduce((score, keyword) => {
      return text.includes(keyword.toLowerCase()) ? score + 1 : score;
    }, 0);
  }

  function getElementText(element) {
    return (element.innerText || element.textContent || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function findSectionByKeywords(keywords, target) {
    if (!keywords.length) return null;

    const candidates = new Map();
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const text = node.textContent.toLowerCase().replace(/\s+/g, " ").trim();
          if (!text) return NodeFilter.FILTER_REJECT;

          const hasKeyword = keywords.some((keyword) => text.includes(keyword.toLowerCase()));
          return hasKeyword ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
      }
    );

    let current = walker.nextNode();

    while (current) {
      const baseElement = current.parentElement;

      if (baseElement && !isInsideChat(baseElement)) {
        const section = getHighlightTarget(baseElement, target);
        const sectionText = getElementText(section);
        const score = countKeywordMatches(sectionText, keywords);
        const rect = section.getBoundingClientRect();
        const area = Math.round(rect.width * rect.height);

        if (score > 0 && rect.width > 100 && rect.height > 40) {
          const existing = candidates.get(section);

          if (!existing || score > existing.score || area > existing.area) {
            candidates.set(section, {
              element: section,
              score,
              area
            });
          }
        }
      }

      current = walker.nextNode();
    }

    const sorted = Array.from(candidates.values()).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.area - a.area;
    });

    return sorted[0] ? sorted[0].element : null;
  }

  function getHighlightTarget(element, target) {
    let highlightTarget = getUsableElement(element) || element;

    const maxHeightByTarget = {
      projects: window.innerHeight * 2.3,
      clients: window.innerHeight * 1.8,
      blender: window.innerHeight * 1.8,
      contact: window.innerHeight * 1.6,
      projectDetail: window.innerHeight * 1.7
    };

    const maxHeight = maxHeightByTarget[target] || window.innerHeight * 1.6;
    const minHeight = target === "projects" ? 150 : 80;

    for (let i = 0; i < 7; i += 1) {
      const parent = highlightTarget.parentElement;

      if (!parent || parent === document.body || parent === document.documentElement) break;
      if (isInsideChat(parent)) break;

      const rect = parent.getBoundingClientRect();
      const currentRect = highlightTarget.getBoundingClientRect();

      const parentIsUseful =
        rect.width > 260 &&
        rect.height >= minHeight &&
        rect.height <= maxHeight;

      const currentIsTooSmall =
        currentRect.width < 260 ||
        currentRect.height < minHeight;

      if (parentIsUseful || currentIsTooSmall) {
        highlightTarget = parent;
      }
    }

    return highlightTarget;
  }

  function highlightElement(element) {
    if (!element) return;

    element.classList.add("ai-scroll-highlight");

    window.setTimeout(() => {
      element.classList.remove("ai-scroll-highlight");
    }, 2800);
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

  function addNotice(text) {
    const row = document.createElement("div");
    row.className = "ai-notice-row";
    row.innerHTML = `<div class="ai-notice"></div>`;
    row.querySelector(".ai-notice").textContent = text;
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
        <span class="ai-thinking-dots"><span></span><span></span><span></span></span>
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