import { useState, useEffect } from 'react';
import './Onboarding.css';

export default function Onboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      const seen = localStorage.getItem('sm_onboard_seen');
      if (!seen) setOpen(true);
    } catch (e) {
      setOpen(true);
    }
  }, []);

  const steps = [
    { title: 'Welcome to StudyMate', text: 'Quickly browse notes, papers and assignments from the sidebar.' },
    { title: 'CogniMate', text: 'Use CogniMate for AI-powered answers and explanations.' },
    { title: 'Upload & Share', text: 'Contribute resources via the Upload button on subject pages.' },
  ];

  const close = (persist = true) => {
    if (persist) localStorage.setItem('sm_onboard_seen', '1');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="onboard-overlay" role="dialog" aria-modal="true">
      <div className="onboard-card">
        <h2>{steps[step].title}</h2>
        <p>{steps[step].text}</p>
        <div className="onboard-controls">
          <button type="button" className="btn-link" onClick={() => { setStep((s) => Math.max(0, s - 1)); }} disabled={step === 0}>Back</button>
          <div>
            <button type="button" className="btn-secondary" onClick={() => close(true)}>Skip</button>
            {step < steps.length - 1 ? (
              <button type="button" className="btn-primary" onClick={() => setStep((s) => s + 1)}>Next</button>
            ) : (
              <button type="button" className="btn-primary" onClick={() => close(true)}>Get Started</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
