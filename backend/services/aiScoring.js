const { GoogleGenerativeAI } = require("@google/generative-ai");

// 🔐 Hardcoded Gemini API Key
const GEMINI_API_KEY = "AIzaSyDxmd5YOHouIDpEcf2ygbEAZzlps4RENwQ";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const cleanAIResponse = (text) => {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return text;
  return jsonMatch[0]
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();
};

const checkPositionMatch = (resumePosition, jobDescription) => {
  if (!resumePosition || !jobDescription) return false;
  const resumeKeywords = resumePosition.toLowerCase().split(/[\s,\/]+/);
  const jobKeywords = jobDescription.toLowerCase().split(/[\s,\/]+/);
  return jobKeywords.some(kw => resumeKeywords.includes(kw));
};

exports.getGeminiResumeScore = async (resumeText, jobDescription) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192
      }
    });

    const prompt = `
      You are a resume evaluator. Analyze how well this resume matches the position 
      the candidate is applying for. Consider these aspects:
      
      1. Position Match: Is the resume clearly targeting the given position?
      2. Relevant Experience: Does it show related work history?
      3. Education: Appropriate degrees/certifications for the role
      4. Skills: Required technical/professional capabilities
      5. Overall Alignment: General suitability for the position.

      Position Being Applied For: """${jobDescription}"""
      Resume Content: """${resumeText}"""

      **Response Format (Strict JSON):**
      {
        "aiScore": number (0-100),
        "positionMatch": boolean,
        "matchReasons": ["3-5 key reasons it's a good fit"],
        "mismatchReasons": ["3-5 key gaps if not matching"]
      }

      Rules:
      1. Score should reflect position alignment, not general quality
      2. Give specific examples from resume content
      3. Focus on role-specific requirements
      4. Never return empty arrays
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanText = cleanAIResponse(text);
    const parsed = JSON.parse(cleanText);

    if (!parsed.matchReasons?.length || !parsed.mismatchReasons?.length) {
      throw new Error("Gemini response missing required reasons arrays");
    }

    return {
      aiScore: parsed.aiScore || 0,
      positionMatch: parsed.positionMatch || false,
      matchReasons: parsed.matchReasons,
      mismatchReasons: parsed.mismatchReasons
    };
  } catch (error) {
    console.error("❌ Gemini AI Scoring Error:", error);
    throw new Error("Failed to generate AI resume score with Gemini");
  }
};

exports.checkPositionMatch = checkPositionMatch;
