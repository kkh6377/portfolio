exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ answer: "Method Not Allowed" })
    };
  }

  try {
    const { message } = JSON.parse(event.body || "{}");

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ answer: "질문이 비어 있습니다." })
      };
    }

    const portfolioInfo = `
이름: Gyeong Han / 곽경한
직무/소개: 몰입형 디지털 경험을 만드는 데 관심이 있는 대학생 개발자입니다.
관심 분야: 게임 개발, VR/XR 시뮬레이션, Unreal Engine, Unity, Roblox, 3D/인터랙티브 콘텐츠, 웹 포트폴리오 제작

기술 스택:
- Unreal Engine 5
- Unity
- C#
- Python
- Java
- Blender
- Roblox Studio / Luau
- HTML
- CSS
- JavaScript
- Framer
- Netlify
- Gemini API 기반 AI 챗봇

대표 프로젝트:
1. EscapeRoom: Desert & Space Theme Project
- Unreal Engine 5 기반 퍼즐 어드벤처/방탈출 프로젝트입니다.
- 사막 고대 사원과 미래형 우주 정거장이라는 두 가지 테마의 공간을 구현했습니다.
- Blueprints, 라인트레이스/레이캐스팅 기반 상호작용, 모듈형 퍼즐 시스템, 레벨 디자인, 동적 조명, 파티클 효과를 활용했습니다.
- 기간: 2025년 9월 2일 ~ 2025년 12월 18일, 약 15주

2. VR Drive Simulator: Case Study Content
- Unity 기반 VR 운전면허 시험 시뮬레이터입니다.
- 실제 운전 연습 전 안전한 가상 환경에서 차량 조작과 교통 규칙을 연습할 수 있도록 설계했습니다.
- Unity XR Interaction Toolkit, 차량 물리, 조향/마찰/관성 처리, 실시간 교통 위반 판정 시스템을 구현했습니다.
- 기간: 2025년 10월 18일 ~ 2025년 12월 17일, 약 16주

3. HI-five: Idol Music Video Production
- Unreal Engine 5로 제작한 가상 아이돌 뮤직비디오 프로젝트입니다.
- Sequencer, 모션 캡처 애니메이션, 실시간 레이 트레이싱, 무대 조명 연출을 활용했습니다.
- Control Rig와 카메라 컷을 조정해 음악 리듬에 맞는 실시간 시네마틱을 구성했습니다.

4. Project: Powerful Shooting
- Roblox 기반 멀티플레이어 좀비 서바이벌 슈팅 게임입니다.
- 수류탄과 섬광탄 같은 전술 장비를 포함합니다.
- 5스테이지마다 보스 라운드가 등장하는 라운드 기반 난이도 상승 시스템을 구현했습니다.
- Roblox Studio의 Luau 스크립팅으로 체력, 무기 데미지, 좀비 AI, 멀티플레이어 동기화 로직을 구성했습니다.

페이지 구성:
- Home: 대표 프로젝트, 사용 기술, 작업 방식, FAQ
- Work: 프로젝트 목록 및 상세 페이지
- About: 자기소개, 개발/디자인 철학, Blender Gallery
- Contact: 이름, 이메일, 메시지를 입력하는 문의 페이지

연락 방법:
- Contact 페이지에서 이름, 이메일, 메시지를 입력해 문의할 수 있습니다.
- 사이트에는 Book a Call, Send a Text 버튼이 있습니다.
- 소셜 링크: GitHub, Instagram, YouTube, Google Meet
`;

    const prompt = `
너는 곽경한의 포트폴리오 웹사이트에 탑재된 AI 비서다.
아래 포트폴리오 정보만 바탕으로 한국어로 답변한다.
정보에 없는 내용은 추측하지 말고 "포트폴리오에 없는 정보입니다."라고 답한다.
답변은 짧고 명확하게 작성한다.

[포트폴리오 정보]
${portfolioInfo}

[사용자 질문]
${message}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500
          }
        })
      }
    );

    const data = await response.json();

    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      data.error?.message ||
      "답변을 생성하지 못했습니다.";

    return {
      statusCode: 200,
      body: JSON.stringify({ answer })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        answer: "서버에서 문제가 발생했습니다."
      })
    };
  }
};