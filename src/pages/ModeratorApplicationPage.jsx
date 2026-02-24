import { useMemo, useState } from 'react';
import { submitModeratorApplication } from '../services/api';
import { useCapabilities } from '../context/CapabilityContext';
import './ModeratorApplicationPage.css';

const INITIAL_FORM = {
  fullName: '',
  phoneNumber: '',
  branch: '',
  year: '',
  motivation: ''
};

function getErrorMessage(error) {
  if (!error) return 'Something went wrong. Please try again.';

  if (error?.status === 409) {
    return 'You already have a pending application.';
  }

  const detail = error?.detail;
  if (Array.isArray(detail)) {
    const first = detail[0];
    if (first?.msg) return first.msg;
  }

  if (typeof detail?.detail === 'string') return detail.detail;
  if (typeof detail === 'string') return detail;
  if (typeof error?.message === 'string') return error.message;
  return 'Failed to submit application.';
}

function validateForm(form) {
  const errors = {};
  const phone = form.phoneNumber.trim();
  const fullName = form.fullName.trim();
  const branch = form.branch.trim();
  const yearValue = Number(form.year);

  if (!fullName) errors.fullName = 'Full name is required.';
  if (!/^\d{10}$/.test(phone))
    errors.phoneNumber = 'Phone number must be exactly 10 digits.';
  if (!branch) errors.branch = 'Branch is required.';
  if (!Number.isInteger(yearValue) || yearValue < 1 || yearValue > 4)
    errors.year = 'Year must be between 1 and 4.';

  return errors;
}

export default function ModeratorApplicationPage() {
  const { hasAdminAccess, capabilities } = useCapabilities();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const alreadyPrivileged = useMemo(() => {
    if (hasAdminAccess) return true;
    return Boolean(capabilities?.isPlatformSuperadmin);
  }, [capabilities?.isPlatformSuperadmin, hasAdminAccess]);

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFeedback({ type: '', text: '' });
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting || alreadyPrivileged) return;

    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setFeedback({ type: '', text: '' });

    try {
      const payload = {
        full_name: form.fullName.trim(),
        phone_number: form.phoneNumber.trim(),
        branch: form.branch.trim(),
        year: Number(form.year),
        motivation: form.motivation.trim() || null
      };

      const response = await submitModeratorApplication(payload);

      setFeedback({
        type: 'success',
        text:
          response?.message ||
          'Application received. If selected, you’ll officially join the StudyMate Academic Team.'
      });

      setForm(INITIAL_FORM);
      setErrors({});
    } catch (error) {
      const message = getErrorMessage(error);
      const type = error?.status === 409 ? 'info' : 'error';
      setFeedback({ type, text: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="moderator-application-page animate-fadeInUp">
      <div className="moderator-application-card">
        <h1>Apply to Join the StudyMate Academic Team</h1>

        <p className="moderator-application-subtitle">
          A selective student leadership group shaping academic quality and structure on campus.
          Members hold an official platform role with visible recognition across StudyMate.
        </p>

        <div className="moderator-perks">
          <p>What you receive:</p>
          <ul>
            <li>Official StudyMate Academic Team badge on your profile</li>
            <li>Recognized leadership role you can list on LinkedIn</li>
            <li>Direct impact on resource quality and academic standards</li>
          </ul>
        </div>

        {alreadyPrivileged ? (
          <div className="moderator-feedback info">
            You already have elevated access. No application is required.
          </div>
        ) : (
          <form className="moderator-form" onSubmit={handleSubmit} noValidate>
            <label className="moderator-field">
              <span>Full Name</span>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                placeholder="Enter your full name"
              />
              {errors.fullName && <small className="field-error">{errors.fullName}</small>}
            </label>

            <label className="moderator-field">
              <span>Phone Number</span>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                placeholder="10-digit phone number"
                inputMode="numeric"
                maxLength={10}
              />
              {errors.phoneNumber && <small className="field-error">{errors.phoneNumber}</small>}
            </label>

            <label className="moderator-field">
              <span>Branch</span>
              <input
                type="text"
                value={form.branch}
                onChange={(e) => handleFieldChange('branch', e.target.value)}
                placeholder="Enter your branch"
              />
              {errors.branch && <small className="field-error">{errors.branch}</small>}
            </label>

            <label className="moderator-field">
              <span>Year</span>
              <input
                type="number"
                min={1}
                max={4}
                value={form.year}
                onChange={(e) => handleFieldChange('year', e.target.value)}
                placeholder="1 to 4"
              />
              {errors.year && <small className="field-error">{errors.year}</small>}
            </label>

            <label className="moderator-field">
              <span>Why do you want to join?</span>
              <textarea
                value={form.motivation}
                onChange={(e) => handleFieldChange('motivation', e.target.value)}
                rows={4}
                placeholder="Tell us why you'd be a strong fit."
              />
            </label>

            {feedback.text && (
              <div className={`moderator-feedback ${feedback.type}`}>
                {feedback.text}
              </div>
            )}

            <button
              type="submit"
              className="moderator-submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}