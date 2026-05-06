import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkles, BookOpen, Wrench, X } from "lucide-react";

const LENSES = [
  { name: "Trolley problem", category: "Quick & fun", description: "Force hidden trade-offs to the surface by flipping the stakes" },
  { name: "Veil of ignorance", category: "Deep", description: "Would you choose this if you didn't know your position in the outcome?" },
  { name: "Regret minimization", category: "Practical", description: "Which choice will you regret least at 80?" },
  { name: "Pre-mortem", category: "Practical", description: "Imagine it failed — what went wrong?" },
  { name: "Double the stakes", category: "Quick & fun", description: "What if this decision affected 10x more people?" },
  { name: "Alien observer", category: "Quick & fun", description: "How would a rational outsider with zero cultural bias view this?" },
  { name: "Experience machine", category: "Deep", description: "If you could simulate the ideal outcome, would you plug in?" },
  { name: "Categorical imperative", category: "Deep", description: "What if everyone in this situation made the same choice as you?" },
  { name: "10-year test", category: "Practical", description: "Fast-forward a decade — which option built the better life?" },
  { name: "Best friend's advice", category: "Practical", description: "What would your most honest, loving friend tell you to do?" },
];

const CATEGORIES = ["All", "Quick & fun", "Deep", "Practical"];

const categoryConfig = {
  "Quick & fun": {
    bg: "var(--cat-quick-bg)",
    border: "var(--cat-quick-border)",
    text: "var(--cat-quick-text)",
    icon: Sparkles,
  },
  Deep: {
    bg: "var(--cat-deep-bg)",
    border: "var(--cat-deep-border)",
    text: "var(--cat-deep-text)",
    icon: BookOpen,
  },
  Practical: {
    bg: "var(--cat-practical-bg)",
    border: "var(--cat-practical-border)",
    text: "var(--cat-practical-text)",
    icon: Wrench,
  },
};

const describeL = (name) => LENSES.find((l) => l.name === name)?.description ?? "";

export default function LensSelector({ onRun, onBack, dilemma, suggestedLenses = [] }) {
  const hasSuggested = suggestedLenses.length > 0;
  const [mode, setMode] = useState(hasSuggested ? "suggested" : "manual");
  const [selected, setSelected] = useState(suggestedLenses);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    setSelected(suggestedLenses);
    setMode(suggestedLenses.length > 0 ? "suggested" : "manual");
  }, [suggestedLenses]);

  const toggleLens = (lens) => {
    setSelected((prev) => {
      const exists = prev.find((l) => l.name === lens.name);
      if (exists) return prev.filter((l) => l.name !== lens.name);
      if (prev.length >= 5) return prev;
      return [...prev, lens];
    });
  };

  const isSelected = (lens) => selected.some((l) => l.name === lens.name);
  const canRun = selected.length >= 2 && selected.length <= 5;
  const suggestedCanRun = suggestedLenses.length >= 2 && suggestedLenses.length <= 5;

  const filteredLenses =
    activeCategory === "All" ? LENSES : LENSES.filter((l) => l.category === activeCategory);

  const switchToManual = () => {
    setMode("manual");
  };

  const switchToSuggested = () => {
    setSelected(suggestedLenses);
    setMode("suggested");
  };

  return (
    <div className="pt-8 sm:pt-12">
      {/* Dilemma preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8 pb-6"
        style={{ borderBottom: "1px solid var(--accent-border)" }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] mb-4 transition-colors"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
          data-testid="back-to-dilemma-btn"
        >
          <ArrowLeft size={14} />
          Edit dilemma
        </button>
        <p
          className="text-lg leading-relaxed line-clamp-2"
          style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", color: "var(--text-secondary)" }}
          data-testid="dilemma-preview"
        >
          "{dilemma}"
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── SUGGESTED MODE ── */}
        {mode === "suggested" && (
          <motion.div
            key="suggested"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="mb-6">
              <h2
                className="text-3xl sm:text-4xl tracking-tight leading-tight mb-2"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 400 }}
                data-testid="lens-heading"
              >
                The lab chose these lenses
              </h2>
              <p
                className="text-sm"
                style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
              >
                You can continue with these, or choose your own.
              </p>
            </div>

            {/* Suggested lens cards — compact horizontal grid */}
            <div
              className="suggested-lens-grid mb-8"
              data-testid="lens-grid"
            >
              {suggestedLenses.map((lens, idx) => {
                const cat = categoryConfig[lens.category] || categoryConfig.Practical;
                const CatIcon = cat.icon;
                return (
                  <motion.div
                    key={lens.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.08 }}
                    className="rounded-xl p-4"
                    style={{
                      backgroundColor: cat.bg,
                      border: `1px solid ${cat.border}`,
                    }}
                    data-testid={`lens-card-${lens.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <CatIcon size={11} style={{ color: cat.text, flexShrink: 0 }} />
                      <span
                        className="text-[10px] uppercase tracking-[0.14em] font-medium"
                        style={{ color: cat.text, fontFamily: "var(--font-body)" }}
                      >
                        {lens.category}
                      </span>
                    </div>
                    <p
                      className="leading-snug mb-1.5"
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "1.08rem",
                        fontWeight: 500,
                        color: "var(--text-primary)",
                      }}
                    >
                      {lens.name}
                    </p>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
                    >
                      {lens.description || describeL(lens.name)}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Suggested mode CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <motion.button
                onClick={() => suggestedCanRun && onRun(suggestedLenses, "suggested")}
                disabled={!suggestedCanRun}
                className="group flex items-center gap-3 px-8 py-3.5 rounded-full text-sm font-medium transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--text-primary)",
                  color: "var(--bg-main)",
                  fontFamily: "var(--font-body)",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                data-testid="run-experiment-btn"
              >
                Continue with these lenses
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </motion.button>

              <button
                onClick={switchToManual}
                className="text-sm transition-colors"
                style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
              >
                Choose my own →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── MANUAL MODE ── */}
        {mode === "manual" && (
          <motion.div
            key="manual"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Heading row */}
            <div className="mb-6">
              {hasSuggested && (
                <button
                  onClick={switchToSuggested}
                  className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] mb-3 transition-colors"
                  style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
                >
                  <ArrowLeft size={12} />
                  Back to suggested
                </button>
              )}
              <h2
                className="text-3xl sm:text-4xl tracking-tight leading-tight mb-2"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 400 }}
                data-testid="lens-heading"
              >
                Choose your lenses
              </h2>
              <p
                className="text-sm"
                style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
              >
                Pick 2–5.{" "}
                <span style={{ color: canRun ? "var(--cat-quick-text)" : "var(--text-secondary)" }}>
                  {selected.length} selected
                </span>
              </p>
            </div>

            {/* Selected lens chips */}
            <AnimatePresence>
              {selected.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-wrap gap-2 mb-5 overflow-hidden"
                >
                  {selected.map((lens) => {
                    const cat = categoryConfig[lens.category] || categoryConfig.Practical;
                    return (
                      <button
                        key={lens.name}
                        onClick={() => toggleLens(lens)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all"
                        style={{
                          backgroundColor: cat.bg,
                          border: `1px solid ${cat.border}`,
                          color: cat.text,
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {lens.name}
                        <X size={11} strokeWidth={2.5} />
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Category filter chips */}
            <div className="flex flex-wrap gap-2 mb-5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-body)",
                    backgroundColor: activeCategory === cat ? "var(--text-primary)" : "transparent",
                    color: activeCategory === cat ? "var(--bg-main)" : "var(--text-secondary)",
                    border: activeCategory === cat ? "1px solid transparent" : "1px solid var(--accent-border)",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Lens grid — 2-col on sm+, 1-col on mobile */}
            <div
              className="lens-manual-grid"
              data-testid="lens-grid"
            >
              {filteredLenses.map((lens, idx) => {
                const cat = categoryConfig[lens.category];
                const active = isSelected(lens);
                const CatIcon = cat.icon;
                return (
                  <motion.button
                    key={lens.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.025 }}
                    onClick={() => toggleLens(lens)}
                    className="w-full text-left p-3.5 sm:p-4 rounded-lg transition-all duration-200"
                    style={{
                      backgroundColor: active ? cat.bg : "var(--bg-surface)",
                      border: `1px solid ${active ? cat.border : "var(--accent-border)"}`,
                    }}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.995 }}
                    data-testid={`lens-card-${lens.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 transition-all duration-200"
                        style={{
                          backgroundColor: active ? cat.text : "transparent",
                          border: active ? "none" : `1.5px solid ${cat.border}`,
                        }}
                      >
                        {active ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          >
                            <Check size={12} color="white" strokeWidth={3} />
                          </motion.div>
                        ) : (
                          <CatIcon size={11} style={{ color: cat.text, opacity: 0.5 }} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className="leading-snug mb-0.5"
                          style={{
                            fontFamily: "var(--font-heading)",
                            fontSize: "1.05rem",
                            fontWeight: 500,
                            color: "var(--text-primary)",
                          }}
                        >
                          {lens.name}
                        </p>
                        <p
                          className="text-xs leading-relaxed"
                          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
                        >
                          {lens.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Run button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between"
            >
              <span
                className="text-xs"
                style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
              >
                {selected.length < 2
                  ? `Select ${2 - selected.length} more`
                  : selected.length >= 5
                  ? "Maximum reached"
                  : `${5 - selected.length} more available`}
              </span>

              <motion.button
                onClick={() => canRun && onRun(selected, "manual")}
                disabled={!canRun}
                className="group flex items-center gap-3 px-8 py-3.5 rounded-full text-sm font-medium transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: canRun ? "var(--text-primary)" : "transparent",
                  color: canRun ? "var(--bg-main)" : "var(--text-secondary)",
                  fontFamily: "var(--font-body)",
                  border: canRun ? "none" : "1px solid var(--accent-border)",
                }}
                whileHover={canRun ? { scale: 1.02 } : {}}
                whileTap={canRun ? { scale: 0.98 } : {}}
                data-testid="run-experiment-btn"
              >
                Continue with selected lenses
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
