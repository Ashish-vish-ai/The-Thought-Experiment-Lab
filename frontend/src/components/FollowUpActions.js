import { useMemo, useState } from "react";
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

export default function FollowUpActions({
  experiment,
  followUps,
  onFollowUp,
  onResolve,
  loading,
  resolutionLoading,
  resolutionFeedback,
  onBackToLenses,
  onStartOver,
}) {
  const [showExploreOptions, setShowExploreOptions] = useState(false);

  const followUpLimit = experiment?.limits?.follow_up_cap ?? 4;
  const followUpsRemaining = Math.max(followUpLimit - followUps.length, 0);
  const isResolved = useMemo(
    () => Boolean(experiment?.ended_at && experiment?.resolution_action),
    [experiment?.ended_at, experiment?.resolution_action],
  );
  const canExploreMore = !loading && !isResolved && followUpsRemaining > 0 && experiment?.status !== "safety_hold";

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
            <button onClick={onBackToLenses} className="site-pill-button site-pill-button--ghost">
              Return to lenses
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
          Continue exploring
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
            <h3>The clearest next step should be obvious.</h3>
            <p>
              If you already see the trade-off, let the lab turn that perspective into a recommendation. If you still
              need more texture, open the secondary actions below.
            </p>
            {followUpsRemaining <= 0 && (
              <p>You have used the follow-up limit for this session, so the next meaningful move is to close it or start fresh.</p>
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
            Explore further
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
                  <span className="section-eyebrow">Secondary moves</span>
                  <p className="explore-panel-copy">
                    Use these only if the main recommendation still feels too thin. You have {followUpsRemaining}{" "}
                    follow-up {followUpsRemaining === 1 ? "move" : "moves"} left in this session.
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
                        Go deeper on {frame.name}
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
                      Hear the counter-argument
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
              Thinking through the next angle...
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
                    ? "You marked this session as clear enough to close."
                    : "You marked this session as something to sit with."}
                </h3>
                <p>
                  {resolutionFeedback === "clarity"
                    ? "That matters. The point of the lab is not endless exploration. It is to help you reach a steadier place."
                    : "Not every thought needs an instant verdict. Sometimes clarity means knowing you can pause without forcing a conclusion."}
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                  <button onClick={onStartOver} className="site-pill-button site-pill-button--solid">
                    Start a new reflection
                  </button>
                  <button onClick={onBackToLenses} className="site-pill-button site-pill-button--ghost">
                    Revisit the lenses
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="section-eyebrow">Close the session</span>
                <h3>When the thought has given you what it needed to give, end it on purpose.</h3>
                <p>
                  Keep this separate from the exploration buttons. It should feel like a calm exit, not another layer of decision fatigue.
                </p>
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
    </div>
  );
}
