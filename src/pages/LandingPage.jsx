import React from 'react';
import BackgroundPlus from '../components/ui/BackgroundPlus';
import NavHeader from '../components/ui/NavHeader';
import Shuffle from '../components/ui/Shuffle';
import BounceCards from '../components/ui/BounceCards';
import Waves from '../components/ui/Waves';
import './LandingPage.css';

const featureCards = [
  {
    tag: 'Organized Access',
    title: 'Structured notes and PYQs',
    description:
      'Browse resources by program, year, and subject so you reach the right material quickly.',
    icon: '📁'
  },
  {
    tag: 'AI Assistant',
    title: 'CogniMate support in context',
    description:
      'Ask study questions inside the platform and get guided answers while you review course content.',
    icon: '🤖'
  },
  {
    tag: 'Practice Loop',
    title: 'AI-generated tests and analysis',
    description:
      'Generate tests from resources, submit answers, and get explanations with focused improvement guidance.',
    icon: '📊'
  },
  {
    tag: 'Institution Ready',
    title: 'Role-aware admin workflows',
    description:
      'Manage structure, resource uploads, and role assignment with permission-aware controls.',
    icon: '🏢'
  }
];

const featureCardImages = [
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80'
];

const workflowSteps = [
  {
    step: '01',
    label: 'Discover',
    title: 'Find the exact subject resources',
    text: 'Navigate through program, year, and subject to access notes and previous papers without clutter.'
  },
  {
    step: '02',
    label: 'Practice',
    title: 'Generate tests from your content',
    text: 'Use random or relevant modes, set difficulty, and practice with a guided test experience.'
  },
  {
    step: '03',
    label: 'Improve',
    title: 'Review outcomes and focus areas',
    text: 'Check scores, explanations, and next-step recommendations to improve your preparation cycle.'
  }
];

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#workflow' },
  { label: 'GitHub', href: 'https://github.com/shardulfunde/StudyMate-AI' },
  { label: 'Sign In', href: '#signin' },
];

const bounceImages = [
  'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=500&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=80',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&q=80'
];

const bounceTransforms = [
  'rotate(5deg) translate(-150px)',
  'rotate(0deg) translate(-75px)',
  'rotate(-5deg)',
  'rotate(5deg) translate(75px)',
  'rotate(-5deg) translate(150px)'
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
  const handleNavClick = (item) => {
    if (item.href === '#signin') {
      onGoogleSignIn();
    }
  };

  return (
    <div className="landing-page">
      <Waves
        lineColor="rgba(37, 99, 235, 0.28)"
        backgroundColor="transparent"
        waveAmpX={24}
        waveAmpY={14}
        xGap={16}
        yGap={34}
        className="landing-wave-bg"
      />

      {/* Scrolling plus pattern background */}
      <BackgroundPlus
        plusSize={60}
        plusColor="rgba(251, 58, 93, 0.18)"
        backgroundColor="#f8fafc"
        fade={true}
        className="landing-bg-pattern"
      />

      {/* Animated pill navbar */}
      <NavHeader
        items={navItems}
        onItemClick={handleNavClick}
      />

      <main className="landing-main">
        {/* ── HERO ── */}
        <section className="landing-hero landing-shell" id="signin">
          <div className="landing-hero-copy">
            <div className="kicker-wrapper">
              <span className="landing-kicker">✨ AI-Powered Study Workspace</span>
            </div>

            <Shuffle
              text="StudyMate"
              tag="h1"
              className="hero-shuffle-title"
              textAlign="left"
              shuffleDirection="right"
              duration={0.4}
              animationMode="evenodd"
              shuffleTimes={1}
              ease="power3.out"
              stagger={0.04}
              threshold={0.05}
              triggerOnce={true}
              triggerOnHover={true}
              respectReducedMotion={true}
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#0f172a',
                fontFamily: "'Inter', system-ui, sans-serif"
              }}
            />

            <p className="hero-subtitle">
              Learn with structure.<br />
              <span className="text-gradient">Practice with confidence.</span>
            </p>

            <p className="landing-lead">
              Notes, previous year papers, AI guidance, and test analysis — one focused learning flow for college students.
            </p>

            <div className="landing-hero-actions">
              <SignInButton
                onGoogleSignIn={onGoogleSignIn}
                isSigningIn={isSigningIn}
              />
              <span className="landing-secondary-note">App Coming Soon</span>
            </div>

            <p className="landing-hero-note">
              Built for real study workflows: discover, practice, and improve in one place.
            </p>

            {authError && <p className="landing-error">{authError}</p>}
          </div>

          <aside className="landing-hero-panel" aria-label="StudyMate preview cards">
            <BounceCards
              className="landing-bounce-cards"
              images={bounceImages}
              containerWidth={500}
              containerHeight={280}
              animationDelay={0.8}
              animationStagger={0.08}
              easeType="elastic.out(1, 0.5)"
              transformStyles={bounceTransforms}
              enableHover
            />
            <div className="landing-preview-caption glass-card">
              <span>StudyMate flow</span>
              <strong>Discover. Practice. Improve.</strong>
            </div>
          </aside>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="landing-section landing-shell">
          <div className="landing-section-head">
            <p className="section-subtitle">Core capabilities</p>
            <h2>Built for daily academic execution</h2>
          </div>
          <div className="landing-feature-grid">
            {featureCards.map((card, index) => (
              <article key={card.title} className="landing-feature-card glass-card">
                <div className="landing-feature-image-wrap">
                  <img
                    src={featureCardImages[index]}
                    alt=""
                    className="landing-feature-image"
                    loading="lazy"
                  />
                  <span className="landing-feature-icon">{card.icon}</span>
                </div>
                <div className="landing-feature-content">
                  <span className="landing-feature-tag">{card.tag}</span>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── WORKFLOW ── */}
        <section id="workflow" className="landing-section landing-shell">
          <div className="landing-section-head">
            <p className="section-subtitle">How it works</p>
            <h2>A simple, repeatable learning cycle</h2>
          </div>
          <div className="landing-step-grid">
            {workflowSteps.map((item) => (
              <article key={item.step} className="landing-step-card glass-card">
                <div className="step-indicator">
                  <span className="step-number">{item.step}</span>
                  <span className="step-label-text">{item.label}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="landing-cta landing-shell">
          <div className="cta-content">
            <Shuffle
              text="Start your StudyMate workspace"
              tag="h2"
              className="cta-shuffle"
              textAlign="center"
              shuffleDirection="right"
              duration={0.3}
              animationMode="evenodd"
              shuffleTimes={1}
              ease="power3.out"
              stagger={0.02}
              threshold={0.2}
              triggerOnce={true}
              triggerOnHover={true}
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#ffffff',
                fontFamily: "'Inter', system-ui, sans-serif"
              }}
            />
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

      {/* ── FOOTER ── */}
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
