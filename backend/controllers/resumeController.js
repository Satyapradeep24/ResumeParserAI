const mongoose = require('mongoose');
const ResumeHistory = require("../models/ResumeHistory");
const AiScore = require('../models/AiScoreSchema');
const AuditLog = require("../models/AuditLog");

const {
  extractTextFromResume,
  parseResumeWithGemini,
  parseResumeWithGPT4,
  parseResumeWithDeepSeek,
  parseResumeWithLlama,
  parseResumeWithNvidiaLlama
} = require("../services/resumeParser");

const aiScoring = require("../services/aiScoring");
const {
  getGeminiResumeScore,
  getGPT4ResumeScore,
  getDeepSeekResumeScore,
  getLlamaResumeScore
} = aiScoring;
const checkPositionMatch = aiScoring.checkPositionMatch;

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Rate limiting
const RATE_LIMIT = 12;
const BATCH_SIZE = 4;
const BATCH_DELAY = Math.floor(60000 / (RATE_LIMIT / BATCH_SIZE));

function calculateTotalExperience(experience) {
  let totalMonths = 0;
  if (!experience || !Array.isArray(experience) || experience.length === 0) {
    return { years: 0, months: 0, formatted: '0 years 0 months' };
  }
  experience.forEach(exp => {
    if (!exp || !exp.duration) return;
    const duration = exp.duration.toLowerCase();
    const yearsMatch = duration.match(/(\d+)\s*(?:year|yr|y)/);
    const monthsMatch = duration.match(/(\d+)\s*(?:month|mo|m)/);
    if (yearsMatch) totalMonths += parseInt(yearsMatch[1]) * 12;
    if (monthsMatch) totalMonths += parseInt(monthsMatch[1]);
    if (duration.includes('present') || duration.includes('current')) {
      const startYearMatch = duration.match(/(\d{4})/);
      if (startYearMatch) {
        const startYear = parseInt(startYearMatch[1]);
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        totalMonths += (currentYear - startYear) * 12 + currentMonth;
      }
    }
  });
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return {
    years,
    months,
    formatted: `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`
  };
}

async function logAudit({ userId, action, modelType, fileName, ip }) {
  const log = new AuditLog({
    userId,
    action,
    modelType,
    fileName,
    ip,
    timestamp: new Date()
  });
  await log.save();
}

async function processBatch(files, startIndex, results, errors, modelType, jobDescription, userId, ip) {
  const batch = files.slice(startIndex, startIndex + BATCH_SIZE);
  const batchPromises = batch.map(async (file) => {
    try {
      const extractedText = await extractTextFromResume(file.path);
      let parsedResume;

      switch (modelType) {
        case 'gpt4': parsedResume = await parseResumeWithGPT4(extractedText); break;
        case 'deepseek': parsedResume = await parseResumeWithDeepSeek(extractedText); break;
        case 'llama': parsedResume = await parseResumeWithLlama(extractedText); break;
        case 'nvidia': parsedResume = await parseResumeWithNvidiaLlama(extractedText); break;
        default: parsedResume = await parseResumeWithGemini(extractedText);
      }

      const totalExperience = calculateTotalExperience(parsedResume.experience);
      const aiScore = await (modelType === 'gpt4' ? getGPT4ResumeScore :
                              modelType === 'deepseek' ? getDeepSeekResumeScore :
                              modelType === 'llama' ? getLlamaResumeScore :
                              getGeminiResumeScore)(extractedText, jobDescription);
      const positionMatch = checkPositionMatch(parsedResume.postAppliedFor || '', jobDescription || '');

      const result = {
        fileName: file.originalname,
        ...parsedResume,
        totalExperience: totalExperience.formatted,
        aiScore: aiScore.aiScore,
        modelType,
        positionMatch: positionMatch || aiScore.positionMatch
      };
      results.push(result);

      await new ResumeHistory({
        userId,
        fileName: result.fileName,
        fullName: result.fullName || '',
        email: result.email || '',
        phone: result.phone || '',
        postAppliedFor: result.postAppliedFor || '',
        modelType,
        aiScore: aiScore.aiScore
      }).save();

      await new AiScore({
        userId,
        fileName: result.fileName,
        postAppliedFor: result.postAppliedFor || '',
        modelType,
        aiScore: aiScore.aiScore,
        positionMatch: result.positionMatch,
        matchReasons: aiScore.matchReasons || [],
        mismatchReasons: aiScore.mismatchReasons || [],
        jobDescription
      }).save();

      await logAudit({
        userId,
        action: 'resume_parsed',
        modelType,
        fileName: result.fileName,
        ip
      });

    } catch (error) {
      errors.push({ fileName: file.originalname, error: error.message || "Failed to parse resume" });
    } finally {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }
  });

  await Promise.all(batchPromises);
}

exports.batchUploadResumes = async (req, res) => {
  try {
    const modelType = req.body.modelType || 'gemini';
    const jobDescription = req.body.jobDescription || '';
    const userId = req.user?.id;
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection.remoteAddress;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const results = [], errors = [], totalFiles = req.files.length;

    for (let i = 0; i < totalFiles; i += BATCH_SIZE) {
      await processBatch(req.files, i, results, errors, modelType, jobDescription, userId, ip);
      if (errors.length > 0) break;
      if (i + BATCH_SIZE < totalFiles) await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
    }

    if (errors.length > 0) return res.status(400).json({ error: "Some resumes failed", errors });
    res.status(200).json({ results });
  } catch (err) {
    console.error("Batch upload error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.aiScoreResumes = async (req, res) => {
  try {
    const modelType = req.body.modelType || 'gemini';
    const jobDescription = req.body.jobDescription || '';
    const userId = req.user?.id;
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection.remoteAddress;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const results = [], errors = [], totalFiles = req.files.length;

    for (let i = 0; i < totalFiles; i += BATCH_SIZE) {
      await processBatch(req.files, i, results, errors, modelType, jobDescription, userId, ip);
      if (errors.length > 0) break;
    }

    if (errors.length > 0) return res.status(400).json({ error: "Some resumes failed", errors });
    res.status(200).json(results);
  } catch (err) {
    console.error("AI scoring error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.generateCoverLetter = async (req, res) => {
  try {
    const file = req.file;
    const { jobDescription, tone = 'formal' } = req.body;
    const userId = req.user?.id;
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection.remoteAddress;

    if (!file || !jobDescription) {
      return res.status(400).json({ error: "Resume file and job description are required" });
    }

    const resumeText = await extractTextFromResume(file.path);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    });

    const prompt = `
      You are an AI cover letter writer.
      Using this resume:
      """
      ${resumeText}
      """
      And this job description:
      """
      ${jobDescription}
      """
      Write a personalized cover letter in ${tone} tone. Highlight key strengths, keep it concise and job-specific. Return only the letter content.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const coverLetter = response.text().trim();

    await logAudit({
      userId,
      action: 'cover_letter_generated',
      modelType: 'gemini',
      fileName: file.originalname,
      ip
    });

    res.json({ coverLetter });

  } catch (error) {
    const message = error.message?.toLowerCase().includes("quota") || error.message?.toLowerCase().includes("overloaded")
      ? "Model is currently overloaded. Please try again later."
      : "Failed to generate cover letter";

    console.error("Error generating cover letter:", error.message);
    res.status(500).json({ error: message });
  }
};
