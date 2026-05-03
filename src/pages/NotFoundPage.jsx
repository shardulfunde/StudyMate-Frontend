import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './NotFoundPage.css';

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.43, 0.13, 0.23, 0.96], delayChildren: 0.1, staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] } }
};

const numberVariants = {
  hidden: (dir) => ({ opacity: 0, x: dir * 40, y: 15, rotate: dir * 5 }),
  visible: { opacity: 0.7, x: 0, y: 0, rotate: 0, transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] } }
};

const ghostVariants = {
  hidden: { scale: 0.8, opacity: 0, y: 15, rotate: -5 },
  visible: {
    scale: 1, opacity: 1, y: 0, rotate: 0,
    transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }
  },
  floating: {
    y: [-5, 5],
    transition: { y: { duration: 2, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' } }
  }
};

export default function NotFoundPage() {
  return (
    <div className="notfound-page">
      <AnimatePresence mode="wait">
        <motion.div
          className="notfound-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div className="notfound-numbers">
            <motion.span className="notfound-digit" variants={numberVariants} custom={-1}>4</motion.span>
            <motion.div variants={ghostVariants} animate={['visible', 'floating']} whileHover={{ scale: 1.1, y: -10 }}>
              <img
                src="https://xubohuah.github.io/xubohua.top/Group.png"
                alt="Ghost"
                className="notfound-ghost"
                draggable="false"
              />
            </motion.div>
            <motion.span className="notfound-digit" variants={numberVariants} custom={1}>4</motion.span>
          </div>

          <motion.h1 className="notfound-title" variants={itemVariants}>
            Boo! Page missing!
          </motion.h1>

          <motion.p className="notfound-desc" variants={itemVariants}>
            Whoops! This page must be a ghost — it's not here!
          </motion.p>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}>
            <Link to="/" className="notfound-btn">Find shelter</Link>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
