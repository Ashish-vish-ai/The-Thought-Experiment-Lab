import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkles, BookOpen, Wrench } from "lucide-react";

const LENSES = [
  { name: "Trolley problem", category: "Quick & fun", description: "Force hidden trade-offs to the surface by flipping the stakes" },
  { name: "Veil of ignorance", category: "Deep", description: "Would you choose this if you didn't know your position in the outcome?" },
  { name: "Regret minimization", category: "Practical", description: "Which choice will you regret least at 80?" },
  { name: "Pre-mortem", category: "Practical", description: "Imagine it failed \u2014 what went wrong?" },
  { name: "Double the stakes", category: "Quick & fun", description: "What if this decision affected 10x more people?" },
  { name: "Alien observer", category: "Quick & fun", description: "How would a rational outsider with zero cultural bias view this?" },
  { name: "Experience machine", category: "Deep", description: "If you could simulate the ideal outcome, would you plug in?" },
  { name: "Categorical imperative", category: "Deep", description: "What if everyone in this situation made the same choice as you?" },
  { name: "10-year test", category: "Practical", description: "Fast-forward a decade \u2014 which option built the better life?" },
  { name: "Best friend's advice", category: "Practical", description: "What would your most honest, loving friend tell you to do?" },
];

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

export default function LensSelector({ onRun, onBack, dilemma }) {
  const [selected, setSelected] = useState([]);

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

      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <h2
          className="text-3xl sm:text-4xl tracking-tight leading-tight mb-2"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 400 }}
          data-testid="lens-heading"
        >
          Pick your lenses
        </h2>
        <p
          className="text-sm"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
        >
          Select 2-5 philosophical frameworks to examine your dilemma.{" "}
          <span style={{ color: canRun ? "var(--cat-quick-text)" : "var(--text-secondary)" }}>
            {selected.length} selected
          </span>
        </p>
      </motion.div>

      {/* Lens grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3 mb-10"
        data-testid="lens-grid"
      >
        {LENSES.map((lens) => {
          const cat = categoryConfig[lens.category];
          const active = isSelected(lens);
          const CatIcon = cat.icon;
          return (
            <motion.button
              key={lens.name}
              variants={itemVariants}
              onClick={() => toggleLens(lens)}
              className="w-full text-left p-4 sm:p-5 rounded-lg transition-all duration-300 group relative overflow-hidden"
              style={{
                backgroundColor: active ? cat.bg : "var(--bg-surface)",
                border: `1px solid ${active ? cat.border : "var(--accent-border)"}`,
              }}
              whileHover={{
                y: -2,
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              }}
              whileTap={{ scale: 0.995 }}
              data-testid={`lens-card-${lens.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
            >
              <div className="flex items-start gap-4">
                {/* Checkmark / Number */}
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
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
                      <Check size={14} color="white" strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <CatIcon size={14} style={{ color: cat.text, opacity: 0.5 }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className="text-base font-medium"
                      style={{ fontFamily: "var(--font-heading)", fontSize: "1.15rem", color: "var(--text-primary)" }}
                    >
                      {lens.name}
                    </span>
                    <span
                      className="text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: cat.bg,
                        color: cat.text,
                        border: `1px solid ${cat.border}`,
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {lens.category}
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
                  >
                    {lens.description}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Run button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
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
          onClick={() => canRun && onRun(selected)}
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
          Run thought experiments
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </motion.button>
      </motion.div>
    </div>
  );
}
