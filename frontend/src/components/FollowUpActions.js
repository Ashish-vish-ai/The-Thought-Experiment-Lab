import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Swords, Compass, ChevronDown, ArrowLeft } from "lucide-react";

export default function FollowUpActions({ experiment, followUps, onFollowUp, loading, onBackToLenses }) {
  const [showLensSelect, setShowLensSelect] = useState(false);

  const handleDeeper = (lensName) => {
    setShowLensSelect(false);
    onFollowUp("deeper", lensName);
  };

  return (
    <div className="mt-10 mb-8" data-testid="followup-actions">
      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <span
          className="text-xs uppercase tracking-[0.2em] font-medium block mb-5"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
        >
          Continue exploring
        </span>

        <div className="flex flex-wrap gap-3">
          {/* Go deeper */}
          <div className="relative">
            <motion.button
              onClick={() => setShowLensSelect(!showLensSelect)}
              disabled={loading}
              className="followup-btn flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium disabled:opacity-40"
              style={{ fontFamily: "var(--font-body)" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-testid="go-deeper-btn"
            >
              <Layers size={15} />
              Go deeper on one lens
              <ChevronDown size={14} className={`transition-transform ${showLensSelect ? "rotate-180" : ""}`} />
            </motion.button>

            <AnimatePresence>
              {showLensSelect && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 z-50 rounded-lg overflow-hidden shadow-lg"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    border: "1px solid var(--accent-border)",
                    minWidth: "220px",
                  }}
                  data-testid="lens-dropdown"
                >
                  {experiment.frames.map((frame) => (
                    <button
                      key={frame.name}
                      onClick={() => handleDeeper(frame.name)}
                      className="w-full text-left px-4 py-3 text-sm transition-colors hover:bg-stone-50"
                      style={{ fontFamily: "var(--font-body)", color: "var(--text-primary)" }}
                      data-testid={`deeper-lens-${frame.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                    >
                      {frame.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Counter-argument */}
          <motion.button
            onClick={() => onFollowUp("counter")}
            disabled={loading}
            className="followup-btn flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium disabled:opacity-40"
            style={{ fontFamily: "var(--font-body)" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="counter-argument-btn"
          >
            <Swords size={15} />
            The counter-argument
          </motion.button>

          {/* Help me decide */}
          <motion.button
            onClick={() => onFollowUp("decide")}
            disabled={loading}
            className="followup-btn flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium disabled:opacity-40"
            style={{ fontFamily: "var(--font-body)" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="help-decide-btn"
          >
            <Compass size={15} />
            Help me decide
          </motion.button>
        </div>

        {/* Loading state */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex items-center gap-3"
          >
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
              Thinking deeper...
            </span>
          </motion.div>
        )}

        {/* Re-run with different lenses */}
        <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--accent-border)" }}>
          <motion.button
            onClick={onBackToLenses}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] transition-colors"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
            whileHover={{ x: -3 }}
            data-testid="rerun-different-lenses-btn"
          >
            <ArrowLeft size={14} />
            Try different lenses
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
