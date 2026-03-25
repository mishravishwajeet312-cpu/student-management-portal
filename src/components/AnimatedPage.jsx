import React from 'react';
import { motion } from 'framer-motion';

const AnimatedPage = ({ children, className }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;
