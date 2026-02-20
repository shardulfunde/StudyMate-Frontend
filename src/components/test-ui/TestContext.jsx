import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  analyzeTestAxios,
  analyzeTheoryTestAxios,
  generateTestAxios,
  generateTheoryTestAxios
} from '../../services/api';
import { useToast } from '../../context/ToastContext';

const TestContext = createContext(null);

const DEFAULT_CONFIG = {
  testType: 'mcq',
  mode: 'random',
  numberOfQuestions: 10,
  difficulty: 'medium',
  language: 'English',
  query: ''
};

const DEFAULT_SCORE = {
  correct: 0,
  total: 0,
  percent: 0,
  awardedMarks: 0,
  totalMarks: 0
};

function getCorrectAnswerIndex(question) {
  const answer = Number(question?.correct_answer);
  if (!Number.isFinite(answer)) return -1;
  if (answer >= 0 && answer < (question?.options || []).length) return answer;
  if (answer > 0 && answer <= (question?.options || []).length) return answer - 1;
  return -1;
}

function getInitialTimer(questionCount) {
  return Math.max(5, Number(questionCount) || 10) * 60;
}

function resolveQuestions(testResult, testType) {
  if (!testResult) return [];
  if (testType === 'theory') return testResult?.theory_test?.questions || [];
  return testResult?.questions || [];
}

function isAnsweredValue(value, testType) {
  if (testType === 'theory') {
    return typeof value === 'string' && value.trim().length > 0;
  }
  return value !== undefined;
}

export function TestProvider({ children, scopeId, scopeTarget = 'resource' }) {
  const { showToast } = useToast();
  const [testConfig, setTestConfig] = useState(DEFAULT_CONFIG);
  const [activeTestType, setActiveTestType] = useState(DEFAULT_CONFIG.testType);
  const [testResult, setTestResult] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionMotionKey, setQuestionMotionKey] = useState(0);
  const [questionMotionDirection, setQuestionMotionDirection] = useState('next');
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(DEFAULT_SCORE);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [analysis, setAnalysis] = useState({
    data: null,
    loading: false,
    error: '',
    visible: false
  });
  const [ui, setUi] = useState({
    submitWarning: '',
    confirmOpen: false,
    sidebarOpenMobile: false,
    startError: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const isTheoryTest = activeTestType === 'theory';
  const questions = useMemo(() => resolveQuestions(testResult, activeTestType), [testResult, activeTestType]);
  const totalQuestions = questions.length;
  const answeredMap = useMemo(
    () => questions.reduce((acc, _, index) => ({ ...acc, [index]: isAnsweredValue(answers[index], activeTestType) }), {}),
    [answers, questions, activeTestType]
  );
  const answeredCount = useMemo(
    () => Object.values(answeredMap).reduce((count, value) => (value ? count + 1 : count), 0),
    [answeredMap]
  );
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;
  const unansweredIndexes = useMemo(
    () => questions.reduce((list, _, index) => (!answeredMap[index] ? [...list, index] : list), []),
    [answeredMap, questions]
  );

  const resetTestState = useCallback(() => {
    setTestConfig(DEFAULT_CONFIG);
    setActiveTestType(DEFAULT_CONFIG.testType);
    setTestResult(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setQuestionMotionKey(0);
    setQuestionMotionDirection('next');
    setSubmitted(false);
    setScore(DEFAULT_SCORE);
    setTimerSeconds(0);
    setAnalysis({ data: null, loading: false, error: '', visible: false });
    setUi({ submitWarning: '', confirmOpen: false, sidebarOpenMobile: false, startError: '' });
    setIsGenerating(false);
  }, []);

  useEffect(() => {
    if (!testResult || submitted) return undefined;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [submitted, testResult]);

  useEffect(() => {
    if (!testResult || submitted || timerSeconds !== 0) return;

    setUi((prev) => ({
      ...prev,
      confirmOpen: true,
      submitWarning: 'Timer finished. Submit now to view score and analysis.'
    }));
  }, [submitted, testResult, timerSeconds]);

  const startTest = useCallback(async () => {
    if (!scopeId) {
      setUi((prev) => ({ ...prev, startError: 'Missing scope id. Unable to generate test.' }));
      return false;
    }

    if (testConfig.mode === 'relevant' && !testConfig.query.trim()) {
      setUi((prev) => ({ ...prev, startError: 'Please enter a query for relevant mode.' }));
      return false;
    }

    const scopeType = `${testConfig.mode}_${scopeTarget}`;
    const requestedType = testConfig.testType === 'theory' ? 'theory' : 'mcq';
    const payload = {
      scope_type: scopeType,
      scope_id: String(scopeId),
      number_of_questions: Number(testConfig.numberOfQuestions) || 10,
      difficulty: testConfig.difficulty,
      language: testConfig.language
    };

    if (scopeType.startsWith('relevant')) {
      payload.query = testConfig.query.trim();
    }

    setIsGenerating(true);
    setUi((prev) => ({ ...prev, startError: '', submitWarning: '' }));
    setAnalysis({ data: null, loading: false, error: '', visible: false });

    try {
      const generated = requestedType === 'theory'
        ? await generateTheoryTestAxios(payload)
        : await generateTestAxios(payload);

      const generatedQuestions = resolveQuestions(generated, requestedType);

      setActiveTestType(requestedType);
      setTestResult(generated);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setQuestionMotionKey(0);
      setQuestionMotionDirection('next');
      setSubmitted(false);
      setScore(DEFAULT_SCORE);
      setTimerSeconds(getInitialTimer(generatedQuestions.length));
      showToast('Test generated successfully', 'success');
      return true;
    } catch (error) {
      const message = error?.detail?.detail || error?.message || 'Failed to generate test';
      setUi((prev) => ({ ...prev, startError: message }));
      showToast(message, 'error');
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, [scopeId, scopeTarget, testConfig, showToast]);

  const setAnswer = useCallback((questionIndex, value) => {
    if (submitted) return;

    if (isTheoryTest) {
      setAnswers((prev) => ({ ...prev, [questionIndex]: String(value ?? '') }));
    } else {
      setAnswers((prev) => ({ ...prev, [questionIndex]: Number(value) }));
    }

    setUi((prev) => ({ ...prev, submitWarning: '' }));
  }, [submitted, isTheoryTest]);

  const moveToQuestion = useCallback((index, direction = 'next') => {
    setQuestionMotionDirection(direction);
    setCurrentQuestionIndex(index);
    setQuestionMotionKey((prev) => prev + 1);
  }, []);

  const nextQuestion = useCallback(() => {
    const nextIndex = Math.min(currentQuestionIndex + 1, Math.max(0, totalQuestions - 1));
    moveToQuestion(nextIndex, 'next');
  }, [currentQuestionIndex, totalQuestions, moveToQuestion]);

  const prevQuestion = useCallback(() => {
    const prevIndex = Math.max(currentQuestionIndex - 1, 0);
    moveToQuestion(prevIndex, 'prev');
  }, [currentQuestionIndex, moveToQuestion]);

  const jumpToQuestion = useCallback((index) => {
    const direction = index < currentQuestionIndex ? 'prev' : 'next';
    moveToQuestion(index, direction);
    setUi((prev) => ({ ...prev, sidebarOpenMobile: false }));
  }, [currentQuestionIndex, moveToQuestion]);

  const requestSubmit = useCallback(() => {
    if (!allAnswered) {
      const firstUnanswered = unansweredIndexes[0] ?? 0;
      moveToQuestion(firstUnanswered, 'next');
      setUi((prev) => ({
        ...prev,
        submitWarning: `Please answer all questions before submitting. ${unansweredIndexes.length} remaining.`
      }));
      return;
    }
    setUi((prev) => ({ ...prev, submitWarning: '', confirmOpen: true }));
  }, [allAnswered, unansweredIndexes, moveToQuestion]);

  const closeConfirm = useCallback(() => {
    setUi((prev) => ({ ...prev, confirmOpen: false }));
  }, []);

  const buildMcqStudentAnswers = useCallback(() => {
    return questions.map((_, index) => ({
      question_index: index,
      selected_option: Number(answers[index] ?? 0)
    }));
  }, [answers, questions]);

  const buildTheoryStudentAnswers = useCallback(() => {
    return questions.map((_, index) => ({
      question_index: index,
      student_answer: String(answers[index] ?? '').trim()
    }));
  }, [answers, questions]);

  const updateTheoryScoreFromAnalysis = useCallback((theoryAnalysis) => {
    const awardedMarks = (theoryAnalysis?.question_evaluations || []).reduce(
      (sum, item) => sum + (Number(item?.marks_awarded) || 0),
      0
    );
    const totalMarks = questions.reduce((sum, question) => sum + (Number(question?.marks) || 0), 0);
    const percent = totalMarks ? Math.round((awardedMarks / totalMarks) * 100) : 0;

    setScore((prev) => ({
      ...prev,
      awardedMarks,
      totalMarks,
      percent
    }));
  }, [questions]);

  const confirmSubmit = useCallback(() => {
    if (!questions.length) return;

    if (isTheoryTest) {
      const totalMarks = questions.reduce((sum, question) => sum + (Number(question?.marks) || 0), 0);
      setScore({
        correct: 0,
        total: questions.length,
        percent: 0,
        awardedMarks: 0,
        totalMarks
      });
    } else {
      let correct = 0;
      questions.forEach((question, index) => {
        const selected = answers[index];
        const correctIndex = getCorrectAnswerIndex(question);
        if (selected === correctIndex) {
          correct += 1;
        }
      });
      const percent = questions.length ? Math.round((correct / questions.length) * 100) : 0;
      setScore({
        correct,
        total: questions.length,
        percent,
        awardedMarks: 0,
        totalMarks: 0
      });
    }

    setSubmitted(true);
    setUi((prev) => ({ ...prev, confirmOpen: false, submitWarning: '' }));
  }, [answers, isTheoryTest, questions]);

  const showAnalysis = useCallback(async () => {
    if (!submitted || !testResult) return;
    if (analysis.loading) return;

    if (analysis.visible) {
      setAnalysis((prev) => ({ ...prev, visible: false }));
      return;
    }

    if (analysis.data) {
      setAnalysis((prev) => ({ ...prev, visible: true }));
      return;
    }

    setAnalysis((prev) => ({ ...prev, visible: true, loading: true, error: '' }));

    try {
      const response = isTheoryTest
        ? await analyzeTheoryTestAxios({
            theory_test: testResult,
            student_answer: buildTheoryStudentAnswers()
          })
        : await analyzeTestAxios({
            test: testResult,
            student_answer: buildMcqStudentAnswers()
          });

      setAnalysis({ data: response, loading: false, error: '', visible: true });

      if (isTheoryTest) {
        updateTheoryScoreFromAnalysis(response);
      }
    } catch (error) {
      const message = error?.detail?.detail || error?.message || 'Failed to load analysis';
      setAnalysis({ data: null, loading: false, error: message, visible: true });
      showToast(message, 'error');
    }
  }, [
    analysis.data,
    analysis.loading,
    analysis.visible,
    buildMcqStudentAnswers,
    buildTheoryStudentAnswers,
    isTheoryTest,
    showToast,
    submitted,
    testResult,
    updateTheoryScoreFromAnalysis
  ]);

  const toggleSidebarMobile = useCallback(() => {
    setUi((prev) => ({ ...prev, sidebarOpenMobile: !prev.sidebarOpenMobile }));
  }, []);

  const isAiBusy = isGenerating || analysis.loading;

  const value = {
    testConfig,
    setTestConfig,
    activeTestType,
    isTheoryTest,
    testResult,
    questions,
    answers,
    answeredMap,
    currentQuestionIndex,
    questionMotionKey,
    questionMotionDirection,
    submitted,
    score,
    timerSeconds,
    analysis,
    ui,
    isGenerating,
    isAiBusy,
    answeredCount,
    totalQuestions,
    allAnswered,
    startTest,
    setAnswer,
    nextQuestion,
    prevQuestion,
    jumpToQuestion,
    requestSubmit,
    closeConfirm,
    confirmSubmit,
    showAnalysis,
    resetTestState,
    toggleSidebarMobile,
    setUi,
    getCorrectAnswerIndex
  };

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
}

export function useTestContext() {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error('useTestContext must be used within TestProvider');
  }
  return context;
}
