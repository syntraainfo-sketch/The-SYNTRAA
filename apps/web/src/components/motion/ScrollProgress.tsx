"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 240, damping: 40 });

  return (
    <motion.div
      aria-hidden
      className="fixed left-0 right-0 top-0 z-55 h-[2px] origin-left bg-[linear-gradient(90deg,rgba(11,11,15,0),rgba(11,11,15,0.6),rgba(11,11,15,0))]"
      style={{ scaleX }}
    />
  );
}

