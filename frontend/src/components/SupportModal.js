import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { SUPPORT_URL } from "@/constants";

export default function SupportModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="support-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-modal-title"
        >
          <motion.div
            className="support-modal"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--accent-border)",
              fontFamily: "var(--font-body)",
            }}
          >
            <div className="flex items-start justify-between mb-5">
              <h2
                id="support-modal-title"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 400,
                  fontSize: "1.6rem",
                  lineHeight: 1.1,
                  color: "var(--text-primary)",
                }}
              >
                Keeping the lab free
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex-shrink-0 ml-4 transition-opacity hover:opacity-60"
                style={{ color: "var(--text-secondary)", marginTop: "0.15rem" }}
              >
                <X size={18} />
              </button>
            </div>

            <p
              className="text-sm leading-relaxed mb-8"
              style={{ color: "var(--text-secondary)" }}
            >
              Thought Experiment Lab is free to use. Each reflection costs a little to run. If this
              helped you see something more clearly, you can support keeping it available.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="site-pill-button site-pill-button--solid"
                onClick={onClose}
              >
                Support the lab
              </a>
              <button
                onClick={onClose}
                className="site-pill-button site-pill-button--ghost"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
