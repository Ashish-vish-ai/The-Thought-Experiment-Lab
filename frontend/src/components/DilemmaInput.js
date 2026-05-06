import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function DilemmaInput({ onSubmit, loading = false }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current && !loading) {
      textareaRef.current.focus();
    }
  }, [loading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [text]);

  const handleSubmit = () => {
    if (!loading && text.trim().length > 10) {
      onSubmit(text.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const isValid = text.trim().length > 10;

  return (
    <div className="pt-16 sm:pt-24 md:pt-32">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.1] mb-4"
        style={{ fontFamily: "var(--font-heading)", fontWeight: 400 }}
        data-testid="hero-heading"
      >
        What's on your mind?
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <p
          className="text-base mb-3"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
          data-testid="hero-subtitle"
        >
          Describe a dilemma, decision, or idea you're wrestling with. Honest is better than polished.
        </p>
        <p
          className="text-xs mb-10"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", opacity: 0.6, letterSpacing: "0.03em" }}
        >
          No account needed · Sessions are saved anonymously
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.32 }}
        className="relative"
      >
        <div
          className="pb-6 mb-8"
          style={{ borderBottom: "1px solid var(--accent-border)" }}
        >
          <motion.div
            animate={{ opacity: loading ? 0.42 : 1 }}
            transition={{ duration: 0.4 }}
          >
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="I'm torn between staying at my stable job or taking a risky leap into something I'm passionate about..."
              className="editorial-textarea"
              rows={3}
              disabled={loading}
              data-testid="dilemma-textarea"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loading || isValid ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.span
                key="reading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2 text-xs"
                style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
              >
                <span
                  className="loading-dot inline-block w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "var(--text-secondary)" }}
                />
                Reading your thought…
              </motion.span>
            ) : (
              <motion.span
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="text-xs tracking-wide"
                style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
              >
                {isValid
                  ? "Press Ctrl+Enter or Cmd+Enter, or click Continue."
                  : "Keep writing until the problem feels clear enough to name."}
              </motion.span>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="group flex items-center gap-3 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isValid && !loading ? "var(--text-primary)" : "transparent",
              color: isValid && !loading ? "var(--bg-main)" : "var(--text-secondary)",
              fontFamily: "var(--font-body)",
              border: isValid && !loading ? "none" : "1px solid var(--accent-border)",
            }}
            whileHover={isValid ? { scale: 1.02 } : {}}
            whileTap={isValid ? { scale: 0.98 } : {}}
            data-testid="continue-to-lenses-btn"
          >
            {loading ? "Checking..." : "Continue"}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
