const mongoose = require('mongoose');

const ResumeHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fullName: {
    type: String
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  postAppliedFor: {
    type: String
  },
  modelType: {
    type: String,
    enum: ['gemini', 'gpt4', 'deepseek', 'llama'],
    default: 'gemini'
  },
  aiScore: {
    type: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ResumeHistory', ResumeHistorySchema);
