import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import DilemmaInput from "./DilemmaInput";
import FollowUpActions from "./FollowUpActions";
import LensSelector from "./LensSelector";
import LoadingState from "./LoadingState";
import ResultsDisplay from "./ResultsDisplay";
import ThemeToggle from "./ThemeToggle";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function resolveApiBase() {
  const configured = (process.env.REACT_APP_BACKEND_URL || "").trim().replace(/\/+$/, "");

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocalHost = host === "localhost" || host === "127.0.0.1";
    const configuredIsLocal = configured.includes("localhost") || configured.includes("127.0.0.1");

    if (isLocalHost && !configuredIsLocal) {
      return "http://localhost:8001/api";
    }
  }

  return configured ? `${configured}/api` : "/api";
}

const API = resolveApiBase();

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

export default function ThoughtLab({ theme, onToggleTheme }) {
  const [phase, setPhase] = useState(PHASES.INPUT);
  const [dilemma, setDilemma] = useState("");
  const [selectedLenses, setSelectedLenses] = useState([]);
  const [experiment, setExperiment] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [preflightLoading, setPreflightLoading] = useState(false);
  const [resolutionLoading, setResolutionLoading] = useState(false);
  const [resolutionFeedback, setResolutionFeedback] = useState(null);

  const handleDilemmaSubmit = useCallback(async (text) => {
    setPreflightLoading(true);
    setDilemma(text);
    setExperiment(null);
    setFollowUps([]);
    setSelectedLenses([]);
    setResolutionFeedback(null);

    try {
      const [{ data }] = await Promise.all([
        axios.post(`${API}/experiments/preflight`, { dilemma: text }),
        sleep(900),
      ]);

      if (data.status === "safety_hold") {
        setExperiment(data);
        setFollowUps(data.follow_ups || []);
        setPhase(PHASES.RESULTS);
        return;
      }

      const suggested = data.suggested_lenses || [];
      setSelectedLenses(suggested);
      setPhase(PHASES.LENSES);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not review that thought right now. Please try again.");
    } finally {
      setPreflightLoading(false);
    }
  }, []);

  const handleRunExperiment = useCallback(async (lenses, source = null) => {
    setSelectedLenses(lenses);
    setPhase(PHASES.LOADING);

    try {
      const [{ data }] = await Promise.all([
        axios.post(`${API}/experiments/run`, {
          dilemma,
          lenses: lenses.map((lens) => ({ name: lens.name, category: lens.category })),
          lenses_source: source,
        }),
        sleep(1100),
      ]);

      setExperiment(data);
      setFollowUps(data.follow_ups || []);
      setResolutionFeedback(data.resolution_action || null);
      setPhase(PHASES.RESULTS);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Something went wrong generating insights. Please try again.");
      setPhase(PHASES.LENSES);
    }
  }, [dilemma]);

  const handleFollowUp = useCallback(async (action, lensName) => {
    if (!experiment) return;

    setFollowUpLoading(true);
    try {
      const { data } = await axios.post(`${API}/experiments/${experiment.id}/followup`, {
        action,
        lens_name: lensName,
      });

      setFollowUps((prev) => [...prev, data]);
      setExperiment((prev) => (
        prev
          ? { ...prev, follow_ups: [...(prev.follow_ups || []), data] }
          : prev
      ));
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to get follow-up. Try again.");
    } finally {
      setFollowUpLoading(false);
    }
  }, [experiment]);

  const handleResolution = useCallback(async (action) => {
    if (!experiment || resolutionLoading) return;

    setResolutionLoading(true);
    try {
      const { data } = await axios.post(`${API}/experiments/${experiment.id}/resolve`, { action });
      setExperiment(data);
      setFollowUps(data.follow_ups || []);
      setResolutionFeedback(data.resolution_action || action);
      toast.success(action === "clarity" ? "Thought cycle closed." : "Session saved for reflection.");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not update the session right now.");
    } finally {
      setResolutionLoading(false);
    }
  }, [experiment, resolutionLoading]);

  const handleStartOver = useCallback(() => {
    setPhase(PHASES.INPUT);
    setDilemma("");
    setSelectedLenses([]);
    setExperiment(null);
    setFollowUps([]);
    setResolutionFeedback(null);
    setPreflightLoading(false);
  }, []);

  const handleBackToLenses = useCallback(() => {
    setPhase(PHASES.LENSES);
  }, []);

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-main)" }}
      data-testid="thought-lab-container"
    >
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.08] mix-blend-multiply"
        style={{
          backgroundImage: theme === "dark"
            ? "radial-gradient(circle at 20% 20%, rgba(122, 104, 144, 0.16), transparent 26%), radial-gradient(circle at 80% 12%, rgba(88, 119, 99, 0.16), transparent 24%), radial-gradient(circle at 50% 80%, rgba(164, 123, 89, 0.16), transparent 30%)"
            : "radial-gradient(circle at 20% 20%, rgba(93, 78, 109, 0.08), transparent 26%), radial-gradient(circle at 80% 12%, rgba(79, 99, 84, 0.08), transparent 24%), radial-gradient(circle at 50% 80%, rgba(142, 106, 75, 0.08), transparent 30%)",
        }}
      />

      <div className="relative z-10">
        <header className="px-6 sm:px-12 pt-8 pb-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-between max-w-3xl mx-auto"
          >
            <Link to="/" className="group flex items-center gap-2" data-testid="logo-home-btn">
              <span
                className="text-xs uppercase tracking-[0.25em] font-medium"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--text-secondary)",
                }}
              >
                Thought Experiment Lab
              </span>
            </Link>

            <div className="flex items-center gap-3 flex-wrap justify-end">
              <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
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
                  Start fresh
                </motion.button>
              )}
            </div>
          </motion.div>
        </header>

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
                  <DilemmaInput onSubmit={handleDilemmaSubmit} loading={preflightLoading} />
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
                    suggestedLenses={selectedLenses}
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
                  key={`results-${experiment.id}`}
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={pageTransition}
                >
                  <ResultsDisplay experiment={experiment} followUps={followUps} />
                  <FollowUpActions
                    experiment={experiment}
                    followUps={followUps}
                    onFollowUp={handleFollowUp}
                    onResolve={handleResolution}
                    loading={followUpLoading}
                    resolutionLoading={resolutionLoading}
                    resolutionFeedback={resolutionFeedback}
                    onBackToLenses={handleBackToLenses}
                    onBackToInput={() => setPhase(PHASES.INPUT)}
                    onStartOver={handleStartOver}
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
