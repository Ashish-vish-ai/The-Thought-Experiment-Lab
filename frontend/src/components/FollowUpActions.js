import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Compass,
  Layers,
  PauseCircle,
  Swords,
} from "lucide-react";
import { SUPPORT_URL } from "@/constants";
import SupportModal from "./SupportModal";

export default function FollowUpActions({
  experiment,
  followUps,
  onFollowUp,
  onResolve,
  loading,
  resolutionLoading,
  resolutionFeedback,
  onBackToLenses,
  onBackToInput,
  onStartOver,
}) {
  const [showExploreOptions, setShowExploreOptions] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [hasShownSupportModal, setHasShownSupportModal] = useState(false);

  const followUpLimit = experiment?.limits?.follow_up_cap ?? 4;
  const followUpsRemaining = Math.max(followUpLimit - followUps.length, 0);
  const isResolved = useMemo(
    () => Boolean(experiment?.ended_at && experiment?.resolution_action),
    [experiment?.ended_at, experiment?.resolution_action],
  );
  const canExploreMore = !loading && !isResolved && followUpsRemaining > 0 && experiment?.status !== "safety_hold";

  useEffect(() => {
    if (hasShownSupportModal || isResolved || followUps.length < 3) return;
    const timer = setTimeout(() => {
      setShowSupportModal(true);
      setHasShownSupportModal(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [followUps.length, hasShownSupportModal, isResolved]);

  const handleDeeper = (lensName) => {
    setShowExploreOptions(false);
    onFollowUp("deeper", lensName);
  };

  if (experiment?.status === "safety_hold") {
    return (
      <div className="mt-10 mb-8">
        <div className="closure-card">
          <span className="section-eyebrow">Pause here</span>
          <h3>Use direct support first.</h3>
          <p>
            When something sounds dangerous, the best next step is not another lens. It is a real person, a crisis
            line, or emergency help.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={onStartOver} className="site-pill-button site-pill-button--solid">
              Start a different reflection
            </button>
            <button onClick={onBackToInput} className="site-pill-button site-pill-button--ghost">
              Edit the thought
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 mb-8" data-testid="followup-actions">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <span
          className="text-xs uppercase tracking-[0.2em] font-medium block mb-5"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
        >
          What would help now?
        </span>

        <div className="results-action-card">
          <motion.button
            onClick={() => onFollowUp("decide")}
            disabled={loading || isResolved || followUpsRemaining <= 0}
            className="site-pill-button site-pill-button--solid"
            style={{ fontFamily: "var(--font-body)" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="help-decide-primary-btn"
          >
            <Compass size={15} />
            Help me decide
          </motion.button>

          <div className="results-action-copy">
            <h3>If you're ready to decide, let the lab help.</h3>
            <p>
              Use this when you've seen enough to want a clear direction. If you need another view first, try the
              other options below.
            </p>
            {followUpsRemaining <= 0 && (
              <p>You've reached the follow-up limit for this session. The next move is to close it or start fresh.</p>
            )}
          </div>
        </div>

        <div className="mt-5">
          <motion.button
            onClick={() => canExploreMore && setShowExploreOptions((prev) => !prev)}
            disabled={!canExploreMore}
            className="followup-btn flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium disabled:opacity-40"
            style={{ fontFamily: "var(--font-body)" }}
            whileHover={canExploreMore ? { scale: 1.02 } : {}}
            whileTap={canExploreMore ? { scale: 0.98 } : {}}
            data-testid="explore-further-btn"
          >
            <Layers size={15} />
            Try another angle
            <ChevronDown size={14} className={`transition-transform ${showExploreOptions ? "rotate-180" : ""}`} />
          </motion.button>

          <AnimatePresence>
            {showExploreOptions && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="explore-panel"
              >
                <div>
                  <span className="section-eyebrow">Other ways to look at it</span>
                  <p className="explore-panel-copy">
                    Each one adds one more angle. You have {followUpsRemaining} left in this session.
                  </p>
                </div>

                <div className="grid gap-3">
                  {experiment.frames.map((frame) => (
                    <button
                      key={frame.name}
                      onClick={() => handleDeeper(frame.name)}
                      className="explore-option"
                      data-testid={`deeper-lens-${frame.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                    >
                      <span>
                        <Layers size={14} />
                        See this through {frame.name}
                      </span>
                      <ArrowLeft size={14} className="rotate-180" />
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setShowExploreOptions(false);
                      onFollowUp("counter");
                    }}
                    className="explore-option"
                    data-testid="counter-argument-btn"
                  >
                    <span>
                      <Swords size={14} />
                      Show the strongest counter-view
                    </span>
                    <ArrowLeft size={14} className="rotate-180" />
                  </button>

                  <button onClick={onBackToLenses} className="explore-option" data-testid="rerun-different-lenses-btn">
                    <span>
                      <ArrowLeft size={14} />
                      Try different lenses
                    </span>
                    <ArrowLeft size={14} className="rotate-180" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex items-center gap-3">
            <div className="flex gap-1">
              <div className="loading-dot w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--text-secondary)" }} />
              <div className="loading-dot w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--text-secondary)" }} />
              <div className="loading-dot w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--text-secondary)" }} />
            </div>
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
              data-testid="followup-loading"
            >
              Making this easier to see...
            </span>
          </motion.div>
        )}

        <div className="mt-10 pt-7" style={{ borderTop: "1px solid var(--accent-border)" }}>
          <div className="closure-card">
            {isResolved ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  {resolutionFeedback === "clarity" ? (
                    <CheckCircle2 size={18} style={{ color: "var(--cat-quick-text)" }} />
                  ) : (
                    <PauseCircle size={18} style={{ color: "var(--cat-practical-text)" }} />
                  )}
                  <span className="section-eyebrow">Thought cycle updated</span>
                </div>
                <h3>
                  {resolutionFeedback === "clarity"
                    ? "Good. You got somewhere."
                    : "Sometimes sitting with it is the answer."}
                </h3>
                <p>
                  {resolutionFeedback === "clarity"
                    ? "The lab is here to help you reach a clearer place, not to keep the loop going."
                    : "Not every thought needs an instant verdict. Pausing without forcing a conclusion is its own kind of clarity."}
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                  <button onClick={onStartOver} className="site-pill-button site-pill-button--solid">
                    Start a new reflection
                  </button>
                  <button onClick={onBackToLenses} className="site-pill-button site-pill-button--ghost">
                    Revisit the lenses
                  </button>
                </div>
                <div
                  className="mt-7 pt-6"
                  style={{ borderTop: "1px solid var(--accent-border)" }}
                >
                  <p
                    className="text-xs leading-relaxed mb-3"
                    style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", opacity: 0.7 }}
                  >
                    Thought Experiment Lab is free to use. If it helped you see something more clearly, you can support keeping it running.
                  </p>
                  <a
                    href={SUPPORT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium transition-opacity hover:opacity-70"
                    style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
                  >
                    Support the lab →
                  </a>
                </div>
              </>
            ) : (
              <>
                <span className="section-eyebrow">Close the session</span>
                <h3>Ready to close this thought?</h3>
                <p>Ending a session on purpose is part of the process.</p>
                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    onClick={() => onResolve("clarity")}
                    disabled={resolutionLoading}
                    className="site-pill-button site-pill-button--solid"
                    data-testid="resolve-clarity-btn"
                  >
                    <CheckCircle2 size={16} />
                    I got clarity
                  </button>
                  <button
                    onClick={() => onResolve("sit_with_it")}
                    disabled={resolutionLoading}
                    className="site-pill-button site-pill-button--ghost"
                    data-testid="resolve-sit-with-it-btn"
                  >
                    <PauseCircle size={16} />
                    I want to sit with this
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
    </div>
  );
}
