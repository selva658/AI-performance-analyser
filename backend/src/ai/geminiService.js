const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

async function analyzePlayer(player) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });

 const prompt = `
    You are a sports analyst.

    IMPORTANT RULES:
    - Return ONLY valid JSON
    - No markdown
    - No code block
    - No explanation

    Schema:
    {
    "strengths": [],
    "weaknesses": [],
    "recommendations": [],
    "risk_level": ""
    }

    Player:
    Name: ${player.name}
    Age: ${player.age}
    Speed: ${player.speed}
    Stamina: ${player.stamina}
    Passing: ${player.passing}
    Attendance: ${player.attendance}
    `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function analyzeVideo(player, pose) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });

  const prompt = `
You are an elite sports biomechanics analyst.

Analyze player movement using stats and pose metrics.

Player:
Name: ${player.name}
Age: ${player.age}
Speed: ${player.speed}
Stamina: ${player.stamina}
Coach Notes: ${player.notes}

Pose Metrics:
Knee Angle: ${pose.kneeAngle}
Balance Score: ${pose.balanceScore}
Spine Tilt: ${pose.spineTilt}

Return JSON only:

{
  "strengths": [],
  "weaknesses": [],
  "posture_analysis": "",
  "recommendations": [],
  "injury_risk": ""
}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = { analyzePlayer, analyzeVideo };