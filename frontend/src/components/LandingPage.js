import { motion } from "framer-motion";
import { ArrowRight, Compass, Layers3, ShieldAlert, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { SUPPORT_URL } from "@/constants";

const lensGroups = [
  {
    category: "Quick & fun",
    color: "quick",
    items: ["Trolley problem", "Double the stakes", "Alien observer"],
  },
  {
    category: "Deep",
    color: "deep",
    items: ["Veil of ignorance", "Experience machine", "Categorical imperative"],
  },
  {
    category: "Practical",
    color: "practical",
    items: ["Regret minimization", "Pre-mortem", "10-year test", "Best friend's advice"],
  },
];

const principles = [
  { icon: Layers3, title: "Not another chat box", line: "Guides you to an exit, not a loop." },
  { icon: ShieldAlert, title: "Safety built in", line: "Crisis prompts get redirected to real help." },
  {
    icon: Sparkles,
    title: "No account required",
    line: "No account needed. Anonymous sessions, including what you write, help us improve the lab.",
  },
];

export default function LandingPage({ theme, onToggleTheme }) {
  return (
    <div className="lp-root">
      <div className="lp-bg-orb lp-bg-orb-1" />
      <div className="lp-bg-orb lp-bg-orb-2" />

      <header className="lp-nav-bar">
        <div className="lp-wrap lp-nav-inner">
          <Link to="/" className="lp-logo">Thought Experiment Lab</Link>
          <nav className="lp-nav-links">
            <Link to="/privacy" className="lp-text-link">Privacy</Link>
            <Link to="/safety" className="lp-text-link">Safety</Link>
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
            <Link to="/lab" className="lp-btn lp-btn--solid">
              Open the lab <ArrowRight size={14} />
            </Link>
          </nav>
        </div>
      </header>

      <section className="lp-wrap lp-hero">
        <motion.div
          className="lp-hero-left"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="lp-badge">
            <Zap size={11} /> Free / No account needed
          </div>

          <h1 className="lp-h1">
            Drop the loop<br />
            in your head.<br />
            <em>Leave steadier.</em>
          </h1>

          <p className="lp-hero-sub">
            Bring one messy thought. Let the lab suggest useful lenses. Leave with clearer framing.
          </p>

          <div className="lp-hero-ctas">
            <Link to="/lab" className="lp-btn lp-btn--solid lp-btn--lg">
              Start a session <ArrowRight size={16} />
            </Link>
            <Link to="/safety" className="lp-btn lp-btn--ghost">Safety</Link>
          </div>
        </motion.div>

        <motion.div
          className="lp-hero-right"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="lp-preview">
            <div className="lp-preview-chrome">
              <span className="lp-chrome-dot" />
              <span className="lp-chrome-dot" />
              <span className="lp-chrome-dot" />
              <span className="lp-chrome-url">session in progress</span>
            </div>

            <div className="lp-preview-thought">
              <div className="lp-micro-label">Thought entering the lab</div>
              <p>"I can't tell if I'm afraid for the right reasons, or just delaying what I actually want."</p>
            </div>

            <div className="lp-preview-lenses">
              <span className="lp-lens lp-lens--practical">Regret minimization</span>
              <span className="lp-lens lp-lens--deep">Veil of ignorance</span>
              <span className="lp-lens lp-lens--quick">Alien observer</span>
            </div>

            <div className="lp-preview-insight">
              <div className="lp-preview-insight-hd">
                <Compass size={13} strokeWidth={1.6} />
                <span>Central tension found</span>
              </div>
              <p>This may not be about safe vs. risky. It may be about whether fear is protecting you or delaying you.</p>
            </div>

            <div className="lp-preview-btns">
              <button className="lp-preview-btn">Make this clearer</button>
              <button className="lp-preview-btn">Strongest counter-view</button>
              <button className="lp-preview-btn lp-preview-btn--cta">{"Help me decide ->"}</button>
            </div>
          </div>

        </motion.div>
      </section>

      <section className="lp-dark">
        <div className="lp-wrap">
          <div className="lp-eyebrow lp-eyebrow--light">How it works</div>
          <div className="lp-steps">
            {[
              { num: "01", title: "Say the real thing" },
              { num: "02", title: "Start with suggested lenses" },
              { num: "03", title: "Leave with clearer framing" },
            ].map((s, i) => (
              <motion.div
                key={s.num}
                className="lp-step"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
              >
                <div className="lp-step-num">{s.num}</div>
                <h3 className="lp-step-h3">{s.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-wrap lp-section">
        <div className="lp-eyebrow">Guided lenses</div>
        <div className="lp-lens-grid">
          {lensGroups.map((group, i) => (
            <motion.div
              key={group.category}
              className="lp-card lp-lens-card"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <div className={`lp-lens-badge lp-lens-badge--${group.color}`}>{group.category}</div>
              <div className="lp-lens-list">
                {group.items.map((item) => (
                  <span key={item} className={`lp-lens lp-lens--${group.color}`}>{item}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="lp-wrap lp-section">
        <div className="lp-principles">
          {principles.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                className="lp-card lp-principle"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.42, delay: i * 0.08 }}
              >
                <div className="lp-principle-icon"><Icon size={17} strokeWidth={1.5} /></div>
                <h3 className="lp-principle-h3">{p.title}</h3>
                <p className="lp-principle-p">{p.line}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="lp-wrap lp-section">
        <div className="lp-cta-block">
          <h2 className="lp-cta-h2">
            You only need to say<br /><em>what the tension is.</em>
          </h2>
          <div className="lp-cta-block-actions">
            <Link to="/lab" className="lp-btn lp-btn--solid lp-btn--lg">
              Open the lab <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-inner">
          <Link to="/" className="lp-logo lp-logo--muted">Thought Experiment Lab</Link>
          <div className="lp-footer-links">
            <Link to="/privacy" className="lp-text-link">Privacy</Link>
            <Link to="/safety" className="lp-text-link">Safety</Link>
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="lp-text-link"
            >
              Support the lab
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
