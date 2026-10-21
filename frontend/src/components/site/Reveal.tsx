import { motion } from "motion/react";

interface Props {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

// Discreet entrance on scroll; MotionConfig reducedMotion="user" (App.tsx) disables it when asked.
export function Reveal({ children, delay = 0, className }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
