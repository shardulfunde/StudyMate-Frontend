import { motion } from 'framer-motion';
import './ShapeLandingHero.css';

function ElegantShape({
  className = '',
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  color = 'rgba(37, 99, 235, 0.16)'
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 }
      }}
      className={`elegant-shape ${className}`.trim()}
    >
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="elegant-shape-inner"
        style={{ width, height, '--shape-color': color }}
      />
    </motion.div>
  );
}

export function StudyMateShapesBackground({ className = '' }) {
  return (
    <div className={`studymate-shapes-bg ${className}`.trim()} aria-hidden="true">
      <div className="studymate-shapes-glow" />
      <div className="studymate-shapes-field">
        <ElegantShape
          delay={0.3}
          width={620}
          height={140}
          rotate={12}
          color="rgba(37, 99, 235, 0.28)"
          className="shape-one"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={118}
          rotate={-15}
          color="rgba(251, 58, 93, 0.24)"
          className="shape-two"
        />
        <ElegantShape
          delay={0.4}
          width={310}
          height={82}
          rotate={-8}
          color="rgba(34, 197, 94, 0.18)"
          className="shape-three"
        />
        <ElegantShape
          delay={0.6}
          width={220}
          height={64}
          rotate={20}
          color="rgba(147, 197, 253, 0.28)"
          className="shape-four"
        />
        <ElegantShape
          delay={0.7}
          width={170}
          height={44}
          rotate={-25}
          color="rgba(251, 58, 93, 0.2)"
          className="shape-five"
        />
      </div>
      <div className="studymate-shapes-vignette" />
    </div>
  );
}

export function HeroGeometric({ badge = 'StudyMate', title1 = 'Learn with Structure', title2 = 'Practice with Confidence' }) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1]
      }
    })
  };

  return (
    <div className="hero-geometric">
      <StudyMateShapesBackground />
      <div className="hero-geometric-content">
        <motion.div
          custom={0}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="hero-geometric-badge"
        >
          <span className="hero-geometric-dot" />
          <span>{badge}</span>
        </motion.div>
        <motion.h1 custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
          <span>{title1}</span>
          <span>{title2}</span>
        </motion.h1>
        <motion.p custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
          Notes, PYQs, AI practice, and focused review in one StudyMate workspace.
        </motion.p>
      </div>
    </div>
  );
}
