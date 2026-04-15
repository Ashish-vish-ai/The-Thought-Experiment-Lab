import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const thinkingPhrases = [
  "Examining your dilemma from multiple angles...",
  "Applying philosophical frameworks...",
  "Finding the tension points...",
  "Crafting concrete insights...",
  "Synthesizing perspectives...",
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
      {/* Animated lens dots */}
      <div className="flex gap-3 mb-10">
        {lenses.map((lens, idx) => (
          <motion.div
            key={lens.name}
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "var(--text-primary)" }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: idx * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Thinking phrase */}
      <motion.p
        key={phraseIdx}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4 }}
        className="text-base text-center"
        style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
        data-testid="loading-phrase"
      >
        {thinkingPhrases[phraseIdx]}
      </motion.p>

      {/* Selected lenses list */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {lenses.map((lens, idx) => (
          <motion.span
            key={lens.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
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
