import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Sparkles, BookOpen, Wrench } from "lucide-react";
import FollowUpResult from "./FollowUpResult";
import TypewriterText from "./TypewriterText";

const categoryConfig = {
  "Quick & fun": { bg: "var(--cat-quick-bg)", border: "var(--cat-quick-border)", text: "var(--cat-quick-text)", icon: Sparkles },
  Deep: { bg: "var(--cat-deep-bg)", border: "var(--cat-deep-border)", text: "var(--cat-deep-text)", icon: BookOpen },
  Practical: { bg: "var(--cat-practical-bg)", border: "var(--cat-practical-border)", text: "var(--cat-practical-text)", icon: Wrench },
};

function getLensCategory(lensName, lenses) {
  const lens = lenses.find((item) => item.name.toLowerCase() === lensName.toLowerCase());
  return lens?.category || "Practical";
}

export default function ResultsDisplay({ experiment, followUps }) {
  const [visibleFrames, setVisibleFrames] = useState(0);
  const [showSynthesis, setShowSynthesis] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setVisibleFrames(0);
    setShowSynthesis(false);
    setShowAll(false);
  }, [experiment.id]);

  useEffect(() => {
    if (showAll) {
      setVisibleFrames(experiment.frames?.length || 0);
      setShowSynthesis(Boolean(experiment.synthesis));
      return undefined;
    }

    if (!experiment.frames?.length) {
      setShowSynthesis(Boolean(experiment.synthesis));
      return undefined;
    }

    if (visibleFrames < experiment.frames.length) {
      const timer = setTimeout(() => setVisibleFrames((value) => value + 1), 400);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => setShowSynthesis(true), 600);
    return () => clearTimeout(timer);
  }, [visibleFrames, experiment.frames, experiment.synthesis, showAll]);

  return (
    <div className="pt-8" data-testid="results-display">
      {/* Dilemma quote — compact */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-7">
        <span
          className="text-xs uppercase tracking-[0.2em] font-medium block mb-1.5"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
        >
          Your dilemma
        </span>
        <p
          className="text-base leading-relaxed"
          style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", color: "var(--text-primary)", opacity: 0.8 }}
          data-testid="results-dilemma"
        >
          "{experiment.dilemma}"
        </p>
      </motion.div>

      {experiment.status === "safety_hold" ? (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-7 sm:p-9"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid rgba(175, 82, 52, 0.22)",
            boxShadow: "0 18px 45px rgba(28, 26, 25, 0.08)",
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(175, 82, 52, 0.1)", color: "#AF5234" }}
            >
              <ShieldAlert size={18} />
            </div>
            <div>
              <span className="section-eyebrow" style={{ marginBottom: "0.4rem" }}>
                Safety pause
              </span>
              <h3 className="text-2xl" style={{ fontFamily: "var(--font-heading)", fontWeight: 500 }}>
                {experiment.safety?.title || "This sounds like it needs more than a thought exercise."}
              </h3>
            </div>
          </div>

          <p className="text-base leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
            {experiment.safety?.message ||
              "The lab should slow down here instead of turning a crisis into another abstract thought exercise."}
          </p>

          {experiment.safety?.steps?.length > 0 && (
            <div className="space-y-3 mb-6">
              {experiment.safety.steps.map((step, index) => (
                <div key={step} className="safety-step">
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          )}

          {experiment.safety?.resources?.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {experiment.safety.resources.map((resource) => (
                <div key={resource.name} className="resource-panel">
                  <h4>{resource.name}</h4>
                  <p>{resource.detail}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        <>
          {/* Central insight block */}
          <div className="mb-7 clarity-summary-card">
            <div className="results-summary-header">
              <span className="section-eyebrow">What this is really about</span>
              {!showAll && (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="results-scan-toggle"
                  data-testid="show-all-results-btn"
                >
                  Show all
                </button>
              )}
            </div>
            <p>{experiment.summary || experiment.synthesis}</p>
          </div>

          {/* Lens perspectives — vertical stack */}
          <div className="space-y-3">
            {experiment.frames.map((frame, idx) => {
              if (idx >= visibleFrames) return null;

              const category = getLensCategory(frame.name, experiment.lenses);
              const cat = categoryConfig[category] || categoryConfig.Practical;

              return (
                <motion.div
                  key={frame.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="result-frame-card"
                  data-testid={`result-frame-${frame.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <h3
                      className="text-lg sm:text-xl tracking-tight"
                      style={{ fontFamily: "var(--font-heading)", fontWeight: 500 }}
                    >
                      {frame.name}
                    </h3>
                    <span
                      className="text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
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
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
                  >
                    <TypewriterText text={frame.insight} speed={12} delay={idx * 200} showAll={showAll} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Synthesis — grounding, soft */}
          {showSynthesis && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="synthesis-block rounded-xl p-6 sm:p-8 mt-6"
              data-testid="synthesis-block"
            >
              <span
                className="text-xs uppercase tracking-[0.25em] font-medium block mb-4"
                style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
              >
                What may be keeping it stuck
              </span>
              <p
                className="text-lg sm:text-xl leading-relaxed"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--text-primary)",
                  fontWeight: 300,
                }}
              >
                <TypewriterText text={experiment.synthesis} speed={15} delay={300} showAll={showAll} />
              </p>
            </motion.div>
          )}
        </>
      )}

      {followUps.length > 0 && (
        <div className="mt-10 space-y-6" data-testid="followup-results">
          {followUps.map((followUp, idx) => (
            <FollowUpResult key={followUp.id || idx} followUp={followUp} showAll={showAll} />
          ))}
        </div>
      )}
    </div>
  );
}
