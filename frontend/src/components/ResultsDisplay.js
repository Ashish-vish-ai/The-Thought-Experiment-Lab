import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, Wrench } from "lucide-react";
import TypewriterText from "./TypewriterText";
import FollowUpResult from "./FollowUpResult";

const categoryConfig = {
  "Quick & fun": { bg: "var(--cat-quick-bg)", border: "var(--cat-quick-border)", text: "var(--cat-quick-text)", icon: Sparkles },
  Deep: { bg: "var(--cat-deep-bg)", border: "var(--cat-deep-border)", text: "var(--cat-deep-text)", icon: BookOpen },
  Practical: { bg: "var(--cat-practical-bg)", border: "var(--cat-practical-border)", text: "var(--cat-practical-text)", icon: Wrench },
};

function getLensCategory(lensName, lenses) {
  const lens = lenses.find((l) => l.name.toLowerCase() === lensName.toLowerCase());
  return lens?.category || "Practical";
}

export default function ResultsDisplay({ experiment, followUps }) {
  const [visibleFrames, setVisibleFrames] = useState(0);
  const [showSynthesis, setShowSynthesis] = useState(false);

  useEffect(() => {
    if (visibleFrames < experiment.frames.length) {
      const timer = setTimeout(() => setVisibleFrames((v) => v + 1), 400);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShowSynthesis(true), 600);
      return () => clearTimeout(timer);
    }
  }, [visibleFrames, experiment.frames.length]);

  return (
    <div className="pt-8" data-testid="results-display">
      {/* Dilemma reminder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-10"
      >
        <span
          className="text-xs uppercase tracking-[0.2em] font-medium block mb-2"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
        >
          Your dilemma
        </span>
        <p
          className="text-xl leading-relaxed"
          style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", color: "var(--text-primary)" }}
          data-testid="results-dilemma"
        >
          "{experiment.dilemma}"
        </p>
      </motion.div>

      {/* Thread of insights */}
      <div className="relative">
        {/* Thread line */}
        <div
          className="absolute left-[15px] top-0 bottom-0 w-px"
          style={{ backgroundColor: "var(--accent-border)" }}
        />

        <div className="space-y-0">
          {experiment.frames.map((frame, idx) => {
            if (idx >= visibleFrames) return null;
            const category = getLensCategory(frame.name, experiment.lenses);
            const cat = categoryConfig[category] || categoryConfig.Practical;
            const CatIcon = cat.icon;

            return (
              <motion.div
                key={frame.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="relative pl-12 pb-10"
                data-testid={`result-frame-${frame.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              >
                {/* Thread node */}
                <div
                  className="absolute left-[7px] top-1 w-[17px] h-[17px] rounded-full flex items-center justify-center z-10"
                  style={{ backgroundColor: cat.bg, border: `2px solid ${cat.border}` }}
                >
                  <CatIcon size={9} style={{ color: cat.text }} />
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <h3
                      className="text-xl sm:text-2xl tracking-tight"
                      style={{ fontFamily: "var(--font-heading)", fontWeight: 500 }}
                    >
                      {frame.name}
                    </h3>
                    <span
                      className="text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: cat.bg,
                        color: cat.text,
                        border: `1px solid ${cat.border}`,
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {category}
                    </span>
                  </div>
                  <div
                    className="text-base leading-relaxed"
                    style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
                  >
                    <TypewriterText text={frame.insight} speed={12} delay={idx * 200} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Synthesis block */}
      {showSynthesis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="rounded-xl p-8 sm:p-12 mt-4 relative overflow-hidden"
          style={{
            backgroundImage: `url(https://static.prod-images.emergentagent.com/jobs/3ece4255-5225-4b01-943d-927b4db876e3/images/0f95b67dc02a771ed515df148c38a143fb00079a4d3d9aed4453003b839bd9a3.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          data-testid="synthesis-block"
        >
          <div
            className="absolute inset-0 rounded-xl"
            style={{ backgroundColor: "rgba(17, 17, 16, 0.8)" }}
          />
          <div className="relative z-10">
            <span
              className="text-xs uppercase tracking-[0.25em] font-medium block mb-4"
              style={{ color: "var(--text-inverse-secondary)", fontFamily: "var(--font-body)" }}
            >
              Synthesis
            </span>
            <p
              className="text-lg sm:text-xl leading-relaxed"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--text-inverse)",
                fontWeight: 300,
              }}
            >
              <TypewriterText text={experiment.synthesis} speed={15} delay={300} />
            </p>
          </div>
        </motion.div>
      )}

      {/* Follow-up results */}
      {followUps.length > 0 && (
        <div className="mt-10 space-y-6" data-testid="followup-results">
          {followUps.map((fu, idx) => (
            <FollowUpResult key={fu.id || idx} followUp={fu} lenses={experiment.lenses} />
          ))}
        </div>
      )}
    </div>
  );
}
