import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import './StudentDealsSurvey.css';

const QUESTIONS = [
  {
    id: 'interest',
    num: 1,
    label: 'Would you use discount coupons for nearby shops available through Studymate?',
    options: ['Yes', 'Maybe', 'No'],
  },
  {
    id: 'spending',
    num: 2,
    label: 'On average, how much do you spend per order (especially for food & beverages)?',
    options: ['Under ₹100', '₹100–₹200', '₹200–₹400', '₹400+'],
  },
  {
    id: 'frequency',
    num: 3,
    label: 'How often do you buy food, beverages, or other items from nearby shops?',
    options: ['Daily', '2–3 times/week', 'Once a week', 'Rarely'],
  },
  {
    id: 'category_preference',
    num: 4,
    label: 'Where would you like to see discounts?',
    multi: true,
    options: [
      'Food (meals, snacks)',
      'Beverages (coffee, juice, etc.)',
      'Desserts',
      'Stationery',
      'Other services',
    ],
  },
  {
    id: 'decision_driver',
    num: 5,
    label: 'What matters most when choosing a place to buy from?',
    options: ['Price/discount', 'Quality/taste', 'Convenience (distance or delivery)', 'Popularity/brand'],
  },
  {
    id: 'offer_preference',
    num: 6,
    label: 'What kind of offer would attract you the most?',
    options: ['5–10% discount', '10–20% discount', 'Flat ₹50–₹100 off', 'Combo deals'],
  },
  {
    id: 'ordering_preference',
    num: 7,
    label: 'How do you usually prefer to get your food or items?',
    options: ['Delivery', 'Takeaway', 'Dine-in', 'No preference'],
  },
  {
    id: 'delivery_flexibility',
    num: 8,
    label: 'If a place offers a good discount but limited or no delivery, would you still consider using the coupon?',
    options: ['Yes', 'Maybe', 'No'],
  },
  {
    id: 'usage_intent',
    num: 9,
    label: 'If you regularly save ₹50–₹100 using coupons, how often would you use this feature?',
    options: ['Almost every time', 'Sometimes', 'Rarely'],
  },
];

const REQUIRED_FIELDS = QUESTIONS.map((q) => q.id);

function FeatureExplanation() {
  return (
    <div className="survey-feature-box">
      <h3>How Student Deals Works</h3>
      <p>
        Studymate is building a new Student Deals feature, and we are actively speaking with
        restaurants, cafes, shops, and other local businesses to bring meaningful student discounts.
      </p>
      <p>
        Your survey response helps us show real student demand, which makes it easier to onboard
        more partner shops and unlock better offers.
      </p>
      <p>
        You will generate coupons inside Studymate and redeem them while ordering or paying.
        The discount is applied by the shop at purchase time. Delivery may be available for some
        shops, while others may support takeaway or in-store visits only.
      </p>
      <div className="survey-feature-note">
        <strong>Important:</strong> Coupon generation happens in Studymate, but discount
        redemption happens at the shop.
      </div>
    </div>
  );
}
function PillOption({ value, selected, multi, onSelect }) {
  return (
    <label className={`survey-pill ${multi ? 'multi' : ''} ${selected ? 'selected' : ''}`}>
      <input
        type={multi ? 'checkbox' : 'radio'}
        checked={selected}
        onChange={() => onSelect(value)}
      />
      <span className="pill-check" />
      {value}
    </label>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function StudentDealsSurvey() {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const checkStatus = async () => {
      try {
        const status = await api.get('/survey/student-deals/status');
        if (!mounted) return;
        if (status?.submitted) {
          setSubmitted(true);
          setAlreadySubmitted(true);
        }
      } catch {
        if (!mounted) return;
      } finally {
        if (mounted) setCheckingStatus(false);
      }
    };

    checkStatus();

    return () => {
      mounted = false;
    };
  }, []);

  const answeredCount = useMemo(() => {
    let count = 0;
    for (const field of REQUIRED_FIELDS) {
      const val = answers[field];
      if (Array.isArray(val) ? val.length > 0 : Boolean(val)) count++;
    }
    return count;
  }, [answers]);

  const canSubmit = answeredCount === REQUIRED_FIELDS.length;
  const progressPct = Math.round((answeredCount / REQUIRED_FIELDS.length) * 100);

  if (checkingStatus) {
    return (
      <div className="survey-page">
        <motion.div
          className="survey-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div className="survey-progress">Checking your submission status...</div>
        </motion.div>
      </div>
    );
  }

  const handleSingleSelect = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setError('');
  };

  const handleMultiSelect = (questionId, value) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [questionId]: next };
    });
    setError('');
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError('');

    const payload = {
      ...answers,
      open_feedback: answers.open_feedback?.trim() || null,
    };

    try {
      await api.post('/survey/student-deals', payload);
      setSubmitted(true);
      setAlreadySubmitted(false);
    } catch (err) {
      if (err?.status === 409) {
        setSubmitted(true);
        setAlreadySubmitted(true);
        setError('');
      } else {
        setError(typeof err?.message === 'string' ? err.message : 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="survey-page">
      <motion.div
        className="survey-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              className="survey-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="survey-success-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              >
                <CheckIcon />
              </motion.div>
              <h2>{alreadySubmitted ? "You've already submitted the response." : 'Thank You! 🎉'}</h2>
              <p>
                {alreadySubmitted
                  ? "We've already recorded your response for this survey."
                  : "Your response has been recorded. We'll use your feedback to build the best deals experience for students."}
              </p>
            </motion.div>
          ) : (
            <motion.div key="form" exit={{ opacity: 0 }}>
              {/* Header */}
              <div className="survey-header">
                <h1>Studymate Student Deals Survey</h1>
                <p>Help us bring useful discounts for you</p>
              </div>

              {/* Feature Explanation */}
              <FeatureExplanation />

              {/* Progress */}
              <div className="survey-progress">
                {answeredCount} of {REQUIRED_FIELDS.length} answered
              </div>
              <div className="survey-progress-bar">
                <div className="survey-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>

              {/* Questions */}
              {QUESTIONS.map((q, idx) => (
                <motion.div
                  key={q.id}
                  className="survey-question"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * idx, duration: 0.25 }}
                >
                  <div className="survey-question-label">
                    <span className="q-num">{q.num}</span>
                    {q.label}
                  </div>
                  <div className="survey-options">
                    {q.options.map((opt) => {
                      const isSelected = q.multi
                        ? (answers[q.id] || []).includes(opt)
                        : answers[q.id] === opt;

                      return (
                        <PillOption
                          key={opt}
                          value={opt}
                          selected={isSelected}
                          multi={q.multi}
                          onSelect={(val) =>
                            q.multi
                              ? handleMultiSelect(q.id, val)
                              : handleSingleSelect(q.id, val)
                          }
                        />
                      );
                    })}
                  </div>
                </motion.div>
              ))}

              {/* Q10 — Open Feedback */}
              <motion.div
                className="survey-question"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * QUESTIONS.length, duration: 0.25 }}
              >
                <div className="survey-question-label">
                  <span className="q-num">10</span>
                  What would make you actually use such a feature regularly?{' '}
                  <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.82rem' }}>(Optional)</span>
                </div>
                <textarea
                  className="survey-textarea"
                  placeholder="Share your thoughts..."
                  maxLength={1000}
                  value={answers.open_feedback || ''}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, open_feedback: e.target.value }))
                  }
                />
              </motion.div>

              {/* Error */}
              {error && <div className="survey-error">{error}</div>}

              {/* Submit */}
              <button
                className="survey-submit"
                disabled={!canSubmit || submitting}
                onClick={handleSubmit}
              >
                {submitting ? 'Submitting…' : canSubmit ? 'Submit Response' : `Answer all ${REQUIRED_FIELDS.length} questions to submit`}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

