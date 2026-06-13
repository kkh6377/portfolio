exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const { message } = JSON.parse(event.body || "{}");

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Message is required" })
      };
    }

    const portfolioInfo = `
이름: 곽경한
포트폴리오 목적: 개인 포트폴리오 웹사이트
페이지 구성:
- Home
- Work
- About
- Contact

기술 스택:
- HTML
- CSS
- JavaScript
- Framer 기반 디자인
- Netlify 배포
- Gemini API 기반 AI 챗봇

프로젝트:
- 포트폴리오 웹사이트
  설명: 개인 소개, 작업물, 연락 정보를 보여주는 웹사이트입니다.

연락:
- Contact 페이지를 통해 확인할 수 있습니다.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: `
너는 곽경한의 포트폴리오 웹사이트에 탑재된 AI 비서다.
아래 포트폴리오 정보만 바탕으로 한국어로 답변한다.
정보에 없는 내용은 추측하지 말고 "포트폴리오에 없는 정보입니다."라고 답한다.
답변은 짧고 명확하게 작성한다.

[포트폴리오 정보]
${portfolioInfo}
`
              }
            ]
          },
          contents: [
            {
              parts: [
                {
                  text: message
                }
              ]
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

    if (!response.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: data.error?.message || "Gemini API error",
          answer: "AI 응답 생성 중 문제가 발생했습니다."
        })
      };
    }

    const answer =
      data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim() || "답변을 생성하지 못했습니다.";

    return {
      statusCode: 200,
      body: JSON.stringify({ answer })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server error",
        answer: "서버에서 문제가 발생했습니다."
      })
    };
  }
};