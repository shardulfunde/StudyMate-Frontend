import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from './GlassCard';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: 'easeOut',
      staggerChildren: 0.12,
      delayChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.42, ease: 'easeOut' }
  }
};

const pulseWords = ['INSIGHT', 'PRECISION', 'MOMENTUM'];

export default function HeroSection() {
  const { scrollY } = useScroll();
  const yOrb = useTransform(scrollY, [0, 400], [0, 44]);
  const yGrid = useTransform(scrollY, [0, 400], [0, -16]);
  const [activeWord, setActiveWord] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveWord((prev) => (prev + 1) % pulseWords.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const stats = useMemo(
    () => [
      { label: 'Adaptive Tests', value: 'AI-Tuned' },
      { label: 'Learning Path', value: 'Personalized' },
      { label: 'Feedback Loop', value: 'Real-Time' }
    ],
    []
  );

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-20 md:px-8">
      <motion.div
        style={{ y: yOrb }}
        className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.26),transparent_68%)]"
      />
      <motion.div
        style={{ y: yOrb }}
        className="pointer-events-none absolute -right-16 top-28 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.28),transparent_68%)]"
      />
      <motion.div
        style={{ y: yGrid }}
        className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(37,99,235,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.08)_1px,transparent_1px)] [background-size:26px_26px]"
      />

      <motion.div
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="relative z-10 mx-auto max-w-6xl"
      >
        <GlassCard className="px-6 py-8 md:px-9 md:py-10">
          <motion.div variants={itemVariants} className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/85 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            StudyMate Intelligence Layer
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="max-w-4xl text-balance text-4xl font-black leading-[1.05] text-slate-900 [font-family:Orbitron,Space_Grotesk,sans-serif] md:text-6xl"
          >
            Futuristic Learning,
            <br />
            Human-Centered Focus.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-5 max-w-3xl text-pretty text-base leading-7 text-slate-600 md:text-lg"
          >
            StudyMate blends structured preparation with intelligent motion-driven experiences.
            The familiar flow stays intact, while every interaction feels sharper, calmer, and more alive.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/notes"
              className="group inline-flex items-center rounded-xl border border-blue-700 bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              Enter Workspace
              <span className="ml-2 transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Link>
            <Link
              to="/cognimate"
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white"
            >
              Explore AI Assistant
            </Link>

            <div className="ml-1 inline-flex items-center rounded-full border border-cyan-200/80 bg-cyan-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
              <AnimatePresence mode="wait">
                <motion.span
                  key={pulseWords[activeWord]}
                  initial={{ opacity: 0, y: 6, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -6, filter: 'blur(6px)' }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {pulseWords[activeWord]}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>
        </GlassCard>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.45 }}
          className="mt-6 grid gap-4 md:grid-cols-3"
        >
          {stats.map((item) => (
            <motion.div key={item.label} variants={itemVariants}>
              <GlassCard hover className="px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-xl font-extrabold text-slate-800">{item.value}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
