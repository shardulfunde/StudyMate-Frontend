import React from 'react';
import './LandingPage.css';

const featureCards = [
  {
    tag: 'Organized Access',
    title: 'Structured notes and PYQs',
    description:
      'Browse resources by program, year, and subject so you reach the right material quickly.'
  },
  {
    tag: 'AI Assistant',
    title: 'CogniMate support in context',
    description:
      'Ask study questions inside the platform and get guided answers while you review course content.'
  },
  {
    tag: 'Practice Loop',
    title: 'AI-generated tests and analysis',
    description:
      'Generate tests from resources, submit answers, and get explanations with focused improvement guidance.'
  },
  {
    tag: 'Institution Ready',
    title: 'Role-aware admin workflows',
    description:
      'Manage structure, resource uploads, and role assignment with permission-aware controls.'
  }
];

const workflowSteps = [
  {
    step: '01 / Discover',
    title: 'Find the exact subject resources',
    text: 'Navigate through program, year, and subject to access notes and previous papers without clutter.'
  },
  {
    step: '02 / Practice',
    title: 'Generate tests from your content',
    text: 'Use random or relevant modes, set difficulty, and practice with a guided test experience.'
  },
  {
    step: '03 / Improve',
    title: 'Review outcomes and focus areas',
    text: 'Check scores, explanations, and next-step recommendations to improve your preparation cycle.'
  }
];

function SignInButton({ onGoogleSignIn, isSigningIn, className = '' }) {
  return (
    <button
      type="button"
      className={`landing-signin-btn ${className}`.trim()}
      onClick={onGoogleSignIn}
      disabled={isSigningIn}
      aria-busy={isSigningIn}
    >
      <span className="btn-text">{isSigningIn ? 'Signing in...' : 'Sign in with Google'}</span>
      {!isSigningIn && (
        <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      )}
    </button>
  );
}

export default function LandingPage({
  onGoogleSignIn,
  isSigningIn = false,
  authError = ''
}) {
  return (
    <div className="landing-page">
      {/* Decorative background blobs */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>

      <header className="landing-topbar">
        <div className="landing-shell landing-topbar-inner">
          <a href="/" className="landing-brand">
            <span className="brand-icon">📚</span> StudyMate
          </a>
          <nav className="landing-nav" aria-label="Landing navigation">
            <a href="#features">Features</a>
            <a href="#workflow">How it works</a>
            <span className="nav-coming-soon">App Coming Soon</span>
          </nav>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero landing-shell fade-in-up">
          <div className="landing-hero-copy">
            <div className="kicker-wrapper">
              <span className="landing-kicker">✨ AI-Powered Study Workspace</span>
            </div>
            <h1>Learn with structure.<br/><span className="text-gradient">Practice with confidence.</span></h1>
            <p className="landing-lead">
              StudyMate brings notes, previous year papers, AI guidance, and test analysis into
              one focused learning flow for college students.
            </p>
            <div className="landing-hero-actions">
              <SignInButton
                onGoogleSignIn={onGoogleSignIn}
                isSigningIn={isSigningIn}
              />
              <span className="landing-secondary-note">App Coming Soon</span>
            </div>
            <p className="landing-hero-note">
              Built for real study workflows: discover resources, practice, and improve in one place.
            </p>
            {authError && <p className="landing-error">{authError}</p>}
          </div>

          <aside className="landing-hero-panel fade-in-up delay-1" aria-label="Product highlights">
            <h2>Everything in one study loop</h2>
            <ul>
              <li>
                <span className="li-icon">🔗</span>
                <span>Notes and PYQs with deep-link sharing</span>
              </li>
              <li>
                <span className="li-icon">🤖</span>
                <span>CogniMate assistant for quick guidance</span>
              </li>
              <li>
                <span className="li-icon">📊</span>
                <span>Generated tests with score and explanation</span>
              </li>
              <li>
                <span className="li-icon">🏢</span>
                <span>Role-aware management for institutions</span>
              </li>
            </ul>
          </aside>
        </section>

        <section id="features" className="landing-section landing-shell">
          <div className="landing-section-head fade-in-up">
            <p className="section-subtitle">Core capabilities</p>
            <h2>Built for daily academic execution</h2>
          </div>
          <div className="landing-feature-grid">
            {featureCards.map((card, index) => (
              <article key={card.title} className={`landing-feature-card fade-in-up delay-${(index % 3) + 1}`}>
                <div className="card-glass-effect"></div>
                <span className="landing-feature-tag">{card.tag}</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="landing-section landing-shell">
          <div className="landing-section-head fade-in-up">
            <p className="section-subtitle">How it works</p>
            <h2>A simple, repeatable learning cycle</h2>
          </div>
          <div className="landing-step-grid">
            {workflowSteps.map((item, index) => (
              <article key={item.step} className={`landing-step-card fade-in-up delay-${(index % 3) + 1}`}>
                <div className="step-indicator">
                  <span className="landing-step-label">{item.step}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-cta landing-shell fade-in-up">
          <div className="cta-content">
            <h2>Start your StudyMate workspace</h2>
            <p>Use your Google account to access your personalized learning environment.</p>
            <SignInButton
              onGoogleSignIn={onGoogleSignIn}
              isSigningIn={isSigningIn}
              className="landing-signin-btn-wide"
            />
            {authError && <p className="landing-error">{authError}</p>}
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-shell landing-footer-inner">
          <p className="footer-brand"><span className="brand-icon">📚</span> StudyMate</p>
          <div className="landing-footer-links">
            <a href="https://github.com/shardulfunde/StudyMate-AI" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://www.linkedin.com/in/shardulfunde/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <span className="landing-footer-note">App Coming Soon</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
