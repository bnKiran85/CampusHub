const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const modelName = 'gemini-1.5-flash';
const User = require('../models/User');


// Helper to clean and parse AI JSON responses
const parseAIResponse = (text) => {
  try {
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (err) {
    console.error('Failed to parse AI JSON:', err);
    console.log('Original Text:', text);
    
    // Robust fallback regex
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        console.error('Regex JSON parse attempt failed');
      }
    }

    return { 
      title: 'AI Insight', 
      summary: 'Analysis complete. I had some trouble with the format, but I processed your request.', 
      points: ['Response formatted as plain text'],
      examples: [],
      error: true
    };
  }
};

// Common Generation Config for JSON
const JSON_CONFIG = {
  generationConfig: {
    responseMimeType: "application/json",
  }
};

// System Instruction for CampusHub Tutor
const SYSTEM_PROMPT = `You are "CampusHub AI", a highly intelligent and encouraging academic tutor.
Your goal is to help college students understand complex concepts, organize their studies, and excel academically.
Always provide structured, clear, and visually organized responses.
Avoid academic jargon unless explaining it simply.
ALWAYS return your response as a VALID JSON object matching the requested schema.`;

// @desc    General Academic Chat
// @route   POST /api/ai/chat
const chat = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required' });

  try {
    console.log('🤖 AI Chat: Processing message...');
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing from environment variables.');
    }

    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `${SYSTEM_PROMPT}
Task: Answer this student's question: "${message}"

Required JSON schema:
{
  "title": "string",
  "summary": "string",
  "points": "string[]",
  "examples": "string[]",
  "tip": "string"
}`;

    console.log(`Requesting Gemini with prompt length: ${prompt.length}`);
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      ...JSON_CONFIG
    });
    
    const text = result.response.text();
    console.log('✅ AI Chat: Response received');
    res.json(parseAIResponse(text));
  } catch (err) {
    console.error('❌ AI Chat Error:', err.message);
    if (err.stack) console.error(err.stack);
    res.status(500).json({ 
      message: 'AI Chat service error', 
      error: err.message,
      suggestion: 'Check if GEMINI_API_KEY is valid and not rate-limited.' 
    });
  }
};

// @desc    Enhance Student Notes
// @route   POST /api/ai/enhance-note
const enhanceNote = async (req, res) => {
  const { text, title } = req.body;
  if (!text) return res.status(400).json({ message: 'Text is required' });

  try {
    console.log(`🤖 AI Enhance: Processing note "${title || 'Untitled'}"`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `${SYSTEM_PROMPT}
Task: Enhance these rough notes${title ? ` about "${title}"` : ''}. 

Rough Notes: "${text}"

Required JSON schema:
{
  "title": "string",
  "summary": "string",
  "points": "string[]",
  "examples": "string[]",
  "sections": [{"heading": "string", "content": "string"}]
}`;

    console.log(`Requesting Gemini with prompt length: ${prompt.length}`);
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      ...JSON_CONFIG
    });
    console.log('✅ AI Enhance: Response received');
    res.json(parseAIResponse(result.response.text()));
  } catch (err) {
    console.error('❌ AI Enhance Error:', err.message);
    if (err.stack) console.error(err.stack);
    res.status(500).json({ message: 'Note enhancement failed', error: err.message });
  }
};

// @desc    Generate Quiz from content
// @route   POST /api/ai/quiz
const generateQuiz = async (req, res) => {
  const { topic, difficulty = 'medium', count = 5 } = req.body;
  if (!topic) return res.status(400).json({ message: 'Topic/Content is required' });

  try {
    console.log(`🤖 AI Quiz: Generating ${count} questions on "${topic}"`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `${SYSTEM_PROMPT}
Task: Generate exactly ${count} MCQs about "${topic}" at ${difficulty} level.

Required JSON schema:
{
  "title": "string",
  "summary": "string",
  "questions": [
    {
      "question": "string",
      "options": "string[] (4 options)",
      "correctIndex": "number (0-3)",
      "explanation": "string"
    }
  ],
  "points": "string[]"
}`;

    console.log(`Requesting Gemini with prompt length: ${prompt.length}`);
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      ...JSON_CONFIG
    });
    console.log('✅ AI Quiz: Response received');
    res.json(parseAIResponse(result.response.text()));
  } catch (err) {
    console.error('❌ AI Quiz Error:', err.message);
    if (err.stack) console.error(err.stack);
    res.status(500).json({ message: 'Quiz generation failed', error: err.message });
  }
};

// @desc    Explain Materials (PDF/Word/etc extracted text)
// @route   POST /api/ai/explain-material
const explainMaterial = async (req, res) => {
  const { content, title, type = 'document' } = req.body;
  if (!content) return res.status(400).json({ message: 'Content is required' });

  try {
    console.log(`🤖 AI Explain: Analyzing ${type} "${title}"`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `${SYSTEM_PROMPT}
Task: Analyze this ${type} titled "${title}" and break it down for a student.
Content: "${content.substring(0, 10000)}"

Required JSON schema:
{
  "title": "string",
  "summary": "string",
  "points": "string[]",
  "examples": "string[]",
  "difficultyLevel": "string",
  "examFocus": "string[]"
}`;

    console.log(`Requesting Gemini with prompt length: ${prompt.length}`);
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      ...JSON_CONFIG
    });
    console.log('✅ AI Explain: Response received');
    res.json(parseAIResponse(result.response.text()));
  } catch (err) {
    console.error('❌ AI Explain Error:', err.message);
    if (err.stack) console.error(err.stack);
    res.status(500).json({ message: 'AI explanation failed', error: err.message });
  }
};

// @desc    Summarize notes
// @route   POST /api/ai/summarize
const summarize = async (req, res) => {
  const { text, title } = req.body;
  if (!text) return res.status(400).json({ message: 'Text is required' });

  try {
    console.log(`🤖 AI Summarize: Processing "${title || 'Untitled'}"`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `${SYSTEM_PROMPT}
Task: Summarize these notes${title ? ` about "${title}"` : ''}.
Notes: "${text}"

Required JSON schema:
{
  "title": "string",
  "summary": "string",
  "points": "string[]",
  "examples": "string[]",
  "tip": "string"
}`;
    console.log(`Requesting Gemini with prompt length: ${prompt.length}`);
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      ...JSON_CONFIG
    });
    console.log('✅ AI Summarize: Response received');
    res.json(parseAIResponse(result.response.text()));
  } catch (err) {
    console.error('❌ AI Summarize Error:', err.message);
    if (err.stack) console.error(err.stack);
    res.status(500).json({ message: 'Summarization failed', error: err.message });
  }
};

// @desc    Semantic search across content
// @route   POST /api/ai/semantic-search
const semanticSearch = async (req, res) => {
  const { query, notes = [], materials = [] } = req.body;
  if (!query) return res.status(400).json({ message: 'Query is required' });

  try {
    console.log('🤖 AI Search: Processing query...');
    const model = genAI.getGenerativeModel({ model: modelName });
    const contentList = [
      ...notes.map(n => ({ id: n._id, type: 'Note', title: n.title })),
      ...materials.map(m => ({ id: m._id, type: 'Material', title: m.title }))
    ];

    const prompt = `${SYSTEM_PROMPT}
Task: Identify the best matching content for the query: "${query}".
Content List: ${JSON.stringify(contentList)}

Required JSON schema:
{
  "title": "string",
  "summary": "string",
  "points": "string[]",
  "recommendedIds": "string[]"
}`;

    console.log(`Requesting Gemini with prompt length: ${prompt.length}`);
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      ...JSON_CONFIG
    });
    console.log('✅ AI Search: Response received');
    res.json(parseAIResponse(result.response.text()));
  } catch (err) {
    console.error('❌ AI Search Error:', err.message);
    if (err.stack) console.error(err.stack);
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
};

// @desc    Generate hints for assignments
// @route   POST /api/ai/assignment-hint
const assignmentHint = async (req, res) => {
  const { title, description, subject } = req.body;
  if (!title) return res.status(400).json({ message: 'Assignment title is required' });

  try {
    console.log(`🤖 AI Hint: Generating hint for "${title}"`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `${SYSTEM_PROMPT}
Task: Provide a hint for this assignment: "${title}" (${subject}).
Description: ${description}

Required JSON schema:
{
  "title": "string",
  "summary": "string",
  "points": "string[]",
  "examples": "string[]",
  "tip": "string"
}`;
    console.log(`Requesting Gemini with prompt length: ${prompt.length}`);
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      ...JSON_CONFIG
    });
    console.log('✅ AI Hint: Response received');
    res.json(parseAIResponse(result.response.text()));
  } catch (err) {
    console.error('❌ AI Hint Error:', err.message);
    if (err.stack) console.error(err.stack);
    res.status(500).json({ message: 'Hint failure', error: err.message });
  }
};

// @desc    Generate a study schedule
// @route   POST /api/ai/study-schedule
const studySchedule = async (req, res) => {
  const { assignments, studyHoursPerDay = 4 } = req.body;
  try {
    console.log('🤖 AI Schedule: Generating weekly plan...');
    const model = genAI.getGenerativeModel({ model: modelName });
    const list = assignments?.map(a => `- ${a.title} (${a.subject})`).join('\n');
    const prompt = `${SYSTEM_PROMPT}
Task: Create a weekly study schedule for ${studyHoursPerDay} hours/day.
Assignments: ${list}

Required JSON schema:
{
  "title": "string",
  "summary": "string",
  "points": "string[]",
  "schedule": "object (Days as keys, arrays of tasks as values)"
}`;
    console.log(`Requesting Gemini with prompt length: ${prompt.length}`);
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      ...JSON_CONFIG
    });
    console.log('✅ AI Schedule: Response received');
    res.json(parseAIResponse(result.response.text()));
  } catch (err) {
    console.error('❌ AI Schedule Error:', err.message);
    if (err.stack) console.error(err.stack);
    res.status(500).json({ message: 'Schedule failure', error: err.message });
  }
};

// XP Reward Handlers
const focusSession = async (req, res) => {
  const { duration } = req.body;
  try {
    const xpAwarded = Math.round(duration * 2);
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, 
      { $inc: { xp: xpAwarded } },
      { new: true }
    );
    res.json({ 
      message: 'XP awarded!', 
      xpAwarded, 
      totalXp: updatedUser.xp,
      title: 'Focus Complete' 
    });
  } catch (err) {

    console.error('❌ XP Error:', err.message);
    if (err.stack) console.error(err.stack);
    res.status(500).json({ message: 'XP error' });
  }
};

const quizXP = async (req, res) => {
  const { score, total } = req.body;
  try {
    const xpAwarded = Math.round((score / total) * 30) + 5;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, 
      { $inc: { xp: xpAwarded } },
      { new: true }
    );
    res.json({ 
      message: 'XP awarded!', 
      xpAwarded,
      totalXp: updatedUser.xp 
    });
  } catch (err) {

    console.error('❌ XP Error:', err.message);
    if (err.stack) console.error(err.stack);
    res.status(500).json({ message: 'XP error' });
  }
};

// @desc    Generate a general study plan/strategy
// @route   POST /api/ai/study-plan
const studyPlan = async (req, res) => {
  const { assignments, userName } = req.body;
  try {
    console.log('🤖 AI Plan: Generating strategy...');
    const model = genAI.getGenerativeModel({ model: modelName });
    const list = assignments?.map(a => `- ${a.title} (${a.subject})`).join('\n');
    const prompt = `${SYSTEM_PROMPT}
Task: Create a high-level study strategy for ${userName || 'the student'}.
Assignments: ${list}

Required JSON schema:
{
  "title": "string",
  "summary": "string",
  "points": "string[]",
  "examples": "string[]",
  "tip": "string"
}`;
    console.log(`Requesting Gemini with prompt length: ${prompt.length}`);
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      ...JSON_CONFIG
    });
    console.log('✅ AI Plan: Response received');
    res.json(parseAIResponse(result.response.text()));
  } catch (err) {
    console.error('❌ AI Plan Error:', err.message);
    if (err.stack) console.error(err.stack);
    res.status(500).json({ message: 'Plan generation failed', error: err.message });
  }
};

// @desc    Generate a complete performance report
// @route   POST /api/ai/report
const generateReport = async (req, res) => {
  const { subject } = req.body;
  if (!subject) return res.status(400).json({ message: 'Subject is required' });

  try {

    const Note = require('../models/Note');
    const Assignment = require('../models/Assignment');
    const AIReport = require('../models/AIReport');

    // 1. Fetch User Data
    const user = await User.findById(req.user._id);
    const noteCount = await Note.countDocuments({ user: req.user._id });
    const assignmentCount = await Assignment.countDocuments({ user: req.user._id });
    const completedAssignments = await Assignment.countDocuments({ user: req.user._id, completed: true });

    // 2. Prepare Data Snapshot for AI
    const dataSnapshot = {
      xp: user.xp || 0,
      streak: user.streak || 0,
      noteCount,
      assignmentCount,
      completedAssignments,
      course: user.course || 'General'
    };

    console.log(`🤖 AI Report: Generating for ${user.name} on ${subject}`);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `${SYSTEM_PROMPT}
Task: Generate a comprehensive, professional academic performance report for a student.
Student Metadata: ${JSON.stringify(dataSnapshot)}
Subject of Focus: "${subject}"

The report should be encouraging but honest. Analyze their activity:
- High note count suggests good documentation habits.
- XP and streak show consistency.
- Completed assignments vs total shows reliability.

Required JSON schema:
{
  "summary": "string (2-3 sentences)",
  "strengths": "string[]",
  "weaknesses": "string[]",
  "recommendations": "string[]",
  "study_plan": [
    { "day": "string", "tasks": "string[]" }
  ],
  "performance_score": "number (0-100)"
}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      ...JSON_CONFIG
    });

    const aiData = parseAIResponse(result.response.text());

    // 3. Save to History
    const newReport = await AIReport.create({
      user: req.user._id,
      subject,
      summary: aiData.summary,
      strengths: aiData.strengths,
      weaknesses: aiData.weaknesses,
      recommendations: aiData.recommendations,
      studyPlan: aiData.study_plan,
      performanceScore: aiData.performance_score,
      dataSnapshot
    });

    res.status(201).json(newReport);
  } catch (err) {
    console.error('❌ AI Report Error:', err.message);
    res.status(500).json({ 
      message: 'Report generation failed', 
      error: err.message,
      suggestion: 'Ensure your data (notes/assignments) is available for analysis.'
    });
  }
};

// @desc    Get report history
// @route   GET /api/ai/reports
const getReports = async (req, res) => {
  try {
    const AIReport = require('../models/AIReport');
    const reports = await AIReport.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
};

module.exports = { 
  chat, enhanceNote, generateQuiz, explainMaterial, 
  studyPlan, focusSession, quizXP, summarize,
  semanticSearch, assignmentHint, studySchedule,
  generateReport, getReports
};

