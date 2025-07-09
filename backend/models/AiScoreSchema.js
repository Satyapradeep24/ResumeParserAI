const mongoose = require('mongoose');

const AiScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  postAppliedFor: {
    type: String
  },
  modelType: {
    type: String,
    enum: ['gemini', 'gpt4', 'deepseek', 'llama', 'nvidia'],
    default: 'gemini'
  },
  aiScore: {
    type: Number,
    required: true
  },
  positionMatch: {
    type: Boolean,
    default: false
  },
  matchReasons: {
    type: [String]
  },
  mismatchReasons: {
    type: [String]
  },
  jobDescription: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AiScore', AiScoreSchema);
