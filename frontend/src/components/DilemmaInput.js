import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function DilemmaInput({ onSubmit }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [text]);

  const handleSubmit = () => {
    if (text.trim().length > 10) {
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

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
        className="text-base mb-6"
        style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
        data-testid="hero-subtitle"
      >
        Describe a dilemma, decision, or idea you're wrestling with. Honest is better than polished.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.33 }}
        className="text-sm mb-12 max-w-2xl"
        style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
      >
        Your session is stored without an account so you can finish the thought cycle. If this is an emergency or
        something life-threatening, do not use the lab as your only support.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="relative"
      >
        <div
          className="pb-6 mb-8"
          style={{ borderBottom: "1px solid var(--accent-border)" }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="I'm torn between staying at my stable job or taking a risky leap into something I'm passionate about..."
            className="editorial-textarea"
            rows={3}
            data-testid="dilemma-textarea"
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isValid ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <span
            className="text-xs tracking-wide"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
          >
            {isValid ? "Press Cmd+Enter or click to continue" : "Keep writing until the real tension shows up..."}
          </span>

          <motion.button
            onClick={handleSubmit}
            disabled={!isValid}
            className="group flex items-center gap-3 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isValid ? "var(--text-primary)" : "transparent",
              color: isValid ? "var(--bg-main)" : "var(--text-secondary)",
              fontFamily: "var(--font-body)",
              border: isValid ? "none" : "1px solid var(--accent-border)",
            }}
            whileHover={isValid ? { scale: 1.02 } : {}}
            whileTap={isValid ? { scale: 0.98 } : {}}
            data-testid="continue-to-lenses-btn"
          >
            Choose lenses
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
