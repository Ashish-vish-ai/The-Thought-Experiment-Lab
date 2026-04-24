import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function InfoPage({ eyebrow, title, intro, sections }) {
  return (
    <div className="public-page min-h-screen relative overflow-hidden">
      <div className="page-grain" />
      <div className="public-gradient public-gradient-one" />
      <div className="public-gradient public-gradient-two" />

      <div className="relative z-10 px-6 sm:px-10 lg:px-14 pb-16">
        <header className="max-w-4xl mx-auto pt-7 pb-10 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/"
            className="text-xs uppercase tracking-[0.28em] font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            Thought Experiment Lab
          </Link>

          <div className="flex items-center gap-4 text-sm">
            <Link to="/privacy" className="transition-opacity hover:opacity-70" style={{ color: "var(--text-secondary)" }}>
              Privacy
            </Link>
            <Link to="/safety" className="transition-opacity hover:opacity-70" style={{ color: "var(--text-secondary)" }}>
              Safety
            </Link>
            <Link to="/lab" className="site-pill-button site-pill-button--solid">
              Start the lab
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto pt-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-eyebrow">{eyebrow}</span>
            <h1 className="section-heading max-w-3xl mt-3">{title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {intro}
            </p>
          </motion.div>

          <div className="mt-12 space-y-5">
            {sections.map((section, index) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 * index }}
                className="info-panel"
              >
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </motion.section>
            ))}
          </div>

          <div className="mt-12">
            <Link to="/lab" className="site-pill-button site-pill-button--solid">
              Start a clarity session
              <ArrowRight size={16} />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
