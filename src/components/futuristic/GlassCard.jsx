import { motion } from 'framer-motion';

export default function GlassCard({
  as: Component = motion.div,
  className = '',
  children,
  hover = true,
  ...props
}) {
  const hoverMotion = hover
    ? { y: -6, boxShadow: '0 24px 44px rgba(15,23,42,0.16)' }
    : undefined;

  return (
    <Component
      className={[
        'relative overflow-hidden rounded-2xl border border-white/30 bg-white/65 backdrop-blur-xl',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(130deg,rgba(37,99,235,0.16),transparent_45%,rgba(6,182,212,0.15))]',
        'shadow-[0_12px_28px_rgba(15,23,42,0.1)]',
        className
      ].join(' ')}
      whileHover={hoverMotion}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </Component>
  );
}
