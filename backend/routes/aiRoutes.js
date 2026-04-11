const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  chat, summarize, generateQuiz, assignmentHint,
  studyPlan, studySchedule, focusSession, quizXP,
  enhanceNote, explainMaterial, semanticSearch
} = require('../controllers/aiController');

router.post('/chat', protect, chat);
router.post('/summarize', protect, summarize);
router.post('/quiz', protect, generateQuiz);
router.post('/assignment-hint', protect, assignmentHint);
router.post('/study-plan', protect, studyPlan);
router.post('/study-schedule', protect, studySchedule);
router.post('/focus-session', protect, focusSession);
router.post('/quiz-xp', protect, quizXP);
router.post('/enhance-note', protect, enhanceNote);
router.post('/explain-material', protect, explainMaterial);
router.post('/semantic-search', protect, semanticSearch);

module.exports = router;
