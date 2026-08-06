const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  chat, summarize, generateQuiz, assignmentHint,
  studyPlan, studySchedule, focusSession, quizXP,
  enhanceNote, explainMaterial, semanticSearch,
  generateReport, getReports
} = require('../controllers/aiController');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

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
router.post('/report', protect, generateReport);
router.get('/reports', protect, getReports);
router.post('/upload-pdf', protect, upload.single('document'), require('../controllers/aiController').uploadAndExplainPdf);

module.exports = router;

