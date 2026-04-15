import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import DilemmaInput from "./DilemmaInput";
import LensSelector from "./LensSelector";
import ResultsDisplay from "./ResultsDisplay";
import FollowUpActions from "./FollowUpActions";
import LoadingState from "./LoadingState";

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const PHASES = {
  INPUT: "input",
  LENSES: "lenses",
  LOADING: "loading",
  RESULTS: "results",
};

const pageVariants = {
  enter: { opacity: 0, y: 30 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: "tween",
  ease: [0.4, 0, 0.2, 1],
  duration: 0.5,
};

export default function ThoughtLab() {
  const [phase, setPhase] = useState(PHASES.INPUT);
  const [dilemma, setDilemma] = useState("");
  const [selectedLenses, setSelectedLenses] = useState([]);
  const [experiment, setExperiment] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [followUpLoading, setFollowUpLoading] = useState(false);

  const handleDilemmaSubmit = useCallback((text) => {
    setDilemma(text);
    setPhase(PHASES.LENSES);
  }, []);

  const handleRunExperiment = useCallback(async (lenses) => {
    setSelectedLenses(lenses);
    setPhase(PHASES.LOADING);
    try {
      const { data } = await axios.post(`${API}/experiments/run`, {
        dilemma,
        lenses: lenses.map((l) => ({ name: l.name, category: l.category })),
      });
      setExperiment(data);
      setFollowUps([]);
      setPhase(PHASES.RESULTS);
    } catch (err) {
      toast.error("Something went wrong generating insights. Please try again.");
      setPhase(PHASES.LENSES);
    }
  }, [dilemma]);

  const handleFollowUp = useCallback(async (action, lensName) => {
    if (!experiment) return;
    setFollowUpLoading(true);
    try {
      const { data } = await axios.post(
        `${API}/experiments/${experiment.id}/followup`,
        { action, lens_name: lensName }
      );
      setFollowUps((prev) => [...prev, data]);
    } catch (err) {
      toast.error("Failed to get follow-up. Try again.");
    } finally {
      setFollowUpLoading(false);
    }
  }, [experiment]);

  const handleStartOver = useCallback(() => {
    setPhase(PHASES.INPUT);
    setDilemma("");
    setSelectedLenses([]);
    setExperiment(null);
    setFollowUps([]);
  }, []);

  const handleBackToLenses = useCallback(() => {
    setPhase(PHASES.LENSES);
  }, []);

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundColor: "var(--bg-main)" }}
      data-testid="thought-lab-container"
    >
      {/* Subtle texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.08] mix-blend-multiply"
        style={{
          backgroundImage: `url(https://static.prod-images.emergentagent.com/jobs/3ece4255-5225-4b01-943d-927b4db876e3/images/3cd606ddd9afe5de0ce9719ba3f0e494df5c771b7e872568f8f1a244c32f4683.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 sm:px-12 pt-8 pb-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-between max-w-3xl mx-auto"
          >
            <button
              onClick={handleStartOver}
              className="group flex items-center gap-2"
              data-testid="logo-home-btn"
            >
              <span
                className="text-xs uppercase tracking-[0.25em] font-medium"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--text-secondary)",
                }}
              >
                Thought Experiment Lab
              </span>
            </button>
            {phase !== PHASES.INPUT && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleStartOver}
                className="text-xs uppercase tracking-[0.2em] px-4 py-2 rounded-full transition-colors"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--accent-border)",
                }}
                whileHover={{ backgroundColor: "var(--cat-quick-bg)" }}
                data-testid="start-over-btn"
              >
                Start over
              </motion.button>
            )}
          </motion.div>
        </header>

        {/* Main content */}
        <main className="px-6 sm:px-12 pb-24">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              {phase === PHASES.INPUT && (
                <motion.div
                  key="input"
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={pageTransition}
                >
                  <DilemmaInput onSubmit={handleDilemmaSubmit} />
                </motion.div>
              )}

              {phase === PHASES.LENSES && (
                <motion.div
                  key="lenses"
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={pageTransition}
                >
                  <LensSelector
                    onRun={handleRunExperiment}
                    onBack={() => setPhase(PHASES.INPUT)}
                    dilemma={dilemma}
                  />
                </motion.div>
              )}

              {phase === PHASES.LOADING && (
                <motion.div
                  key="loading"
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={pageTransition}
                >
                  <LoadingState lenses={selectedLenses} />
                </motion.div>
              )}

              {phase === PHASES.RESULTS && experiment && (
                <motion.div
                  key="results"
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={pageTransition}
                >
                  <ResultsDisplay
                    experiment={experiment}
                    followUps={followUps}
                  />
                  <FollowUpActions
                    experiment={experiment}
                    followUps={followUps}
                    onFollowUp={handleFollowUp}
                    loading={followUpLoading}
                    onBackToLenses={handleBackToLenses}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
