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
- About
- Work
- Contact

기술 스택:
- HTML
- CSS
- JavaScript
- Framer 기반 디자인 export
- Netlify 배포

프로젝트:
- 포트폴리오 웹사이트
  설명: 개인 소개, 작업물, 연락 정보를 보여주는 웹사이트입니다.

연락:
- Contact 페이지를 통해 확인할 수 있습니다.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
너는 곽경한의 포트폴리오 웹사이트에 탑재된 AI 비서다.
아래 포트폴리오 정보만 바탕으로 한국어로 답변한다.
정보에 없는 내용은 추측하지 말고 "포트폴리오에 없는 정보입니다."라고 답한다.
답변은 짧고 명확하게 작성한다.

[포트폴리오 정보]
${portfolioInfo}
`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        answer:
          data.choices?.[0]?.message?.content ||
          "답변을 생성하지 못했습니다."
      })
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