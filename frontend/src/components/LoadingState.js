import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const thinkingPhrases = [
  "Finding the shape of your thought…",
  "Choosing useful lenses…",
  "Looking through the lenses…",
  "Turning the loop into a clearer frame…",
];

export default function LoadingState({ lenses }) {
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % thinkingPhrases.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-24 sm:pt-32 flex flex-col items-center" data-testid="loading-state">
      {/* Breathing circle */}
      <motion.div
        className="mb-10 rounded-full"
        style={{
          width: "2.75rem",
          height: "2.75rem",
          backgroundColor: "var(--accent-border)",
        }}
        animate={{
          scale: [1, 1.22, 1],
          opacity: [0.35, 0.85, 0.35],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Thinking phrase */}
      <AnimatePresence mode="wait">
        <motion.p
          key={phraseIdx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4 }}
          className="text-base text-center mb-8"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
          data-testid="loading-phrase"
        >
          {thinkingPhrases[phraseIdx]}
        </motion.p>
      </AnimatePresence>

      {/* Selected lens chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {lenses.map((lens, idx) => (
          <motion.span
            key={lens.name}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + idx * 0.1, duration: 0.35 }}
            className="text-xs px-3 py-1 rounded-full"
            style={{
              backgroundColor: "var(--cat-deep-bg)",
              color: "var(--cat-deep-text)",
              fontFamily: "var(--font-body)",
              border: "1px solid var(--cat-deep-border)",
            }}
          >
            {lens.name}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
