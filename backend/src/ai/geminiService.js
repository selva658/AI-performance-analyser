const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager, FileState } = require("@google/generative-ai/server");
const path = require("path");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_KEY);

const MAX_PROCESSING_POLLS = 20; // ~40s at 2s intervals
const UPLOAD_TIMEOUT_MS = 45000;
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function withRetry(fn, attempts = 2) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const status = error?.status || error?.response?.status;
      if (!RETRYABLE_STATUS.has(status) || i === attempts - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw lastError;
}

function cleanJson(text) {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

async function uploadVideoToGemini(filePath, mimeType) {
  const { file } = await withTimeout(
    fileManager.uploadFile(filePath, {
      mimeType,
      displayName: path.basename(filePath),
    }),
    UPLOAD_TIMEOUT_MS,
    "Timed out uploading the video to Gemini",
  );

  let uploadedFile = file;
  let polls = 0;
  while (uploadedFile.state === FileState.PROCESSING) {
    if (++polls > MAX_PROCESSING_POLLS) {
      throw new Error("Timed out waiting for Gemini to process the video");
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
    uploadedFile = await fileManager.getFile(uploadedFile.name);
  }

  if (uploadedFile.state === FileState.FAILED) {
    throw new Error("Gemini failed to process the uploaded video");
  }

  return uploadedFile;
}

const REPORT_SCHEMA = `{
  "strengths": ["string"],
  "weaknesses": ["string"],
  "posture_analysis": "string",
  "recommendations": ["string"],
  "injury_risk": "string",
  "risk_level": "low | medium | high",
  "metrics": {
    "overall_score": number,
    "speed": number,
    "stamina": number,
    "technique": number,
    "consistency": number,
    "balance": number
  }
}`;

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

// Text-only fallback used when the video pipeline (upload/processing) fails or
// times out, so a flaky network path doesn't leave the user with nothing.
async function analyzeStatsOnly(player) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  const prompt = `
You are an elite sports performance AI. Video analysis was not available for
this request, so base your assessment only on the player's reported stats and
coach notes below.

Return ONLY valid JSON.
Do not return markdown.
Do not return explanations.
Do not wrap inside \`\`\`.

Player Context:
${JSON.stringify(player)}

IMPORTANT:
You MUST return this exact schema:

${REPORT_SCHEMA}

Rules for metrics:
- All metric values must be between 0 and 100
- Metrics must be realistic estimates grounded in the player context
- Return numeric values only
`;

  const result = await withRetry(() => model.generateContent(prompt));
  const report = JSON.parse(cleanJson(result.response.text()));
  report.analysis_mode = "stats_only";
  return report;
}

async function analyzeVideo(player, videoFile) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  const uploadedFile = await uploadVideoToGemini(videoFile.path, videoFile.mimetype);

  const prompt = `
You are an elite sports biomechanics AI.

Watch the attached training video and analyze the player's movement,
technique, posture and effort. Combine what you observe in the video
with the player context below.

Return ONLY valid JSON.
Do not return markdown.
Do not return explanations.
Do not wrap inside \`\`\`.

Player Context:
${JSON.stringify(player)}

IMPORTANT:
You MUST return this exact schema:

${REPORT_SCHEMA}

Rules for metrics:
- All metric values must be between 0 and 100
- Metrics must be grounded in what is visible in the video plus the player context
- Return numeric values only
`;

  const result = await withRetry(() =>
    model.generateContent([
      { text: prompt },
      {
        fileData: {
          fileUri: uploadedFile.uri,
          mimeType: uploadedFile.mimeType,
        },
      },
    ]),
  );

  const report = JSON.parse(cleanJson(result.response.text()));
  report.analysis_mode = "video";
  return report;
}

// Runs the video pipeline first; on any failure (upload hang, processing
// timeout, transient API error) falls back to a stats-only report instead of
// surfacing an error, since the video path is the least reliable leg here.
async function analyzeVideoWithFallback(player, videoFile) {
  try {
    return await analyzeVideo(player, videoFile);
  } catch (error) {
    console.error("Video analysis failed, falling back to stats-only:", error.message);
    return analyzeStatsOnly(player);
  }
}

module.exports = { analyzePlayer, analyzeVideo, analyzeStatsOnly, analyzeVideoWithFallback };
