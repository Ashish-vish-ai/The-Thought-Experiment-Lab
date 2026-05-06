import "@/App.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "@/components/LandingPage";
import InfoPage from "@/components/InfoPage";
import ThoughtLab from "@/components/ThoughtLab";
import { Toaster } from "@/components/ui/sonner";

const privacySections = [
  {
    title: "What We Store",
    body:
      "We store the dilemma you write, the lenses used, the responses the lab generates, and whether the session helped you close the thought cycle.",
  },
  {
    title: "What We Do Not Ask For",
    body:
      "There are no accounts, no usernames, and no profile fields in the product flow. Your reflections are not tied to a personal profile.",
  },
  {
    title: "The Short Version",
    body:
      "No account is required, but sessions are stored as anonymous data so we can understand whether the lab is helping. Treat it as a clarity tool, not a vault for secrets.",
  },
];

const safetySections = [
  {
    title: "What The Lab Is For",
    body:
      "Thought Experiment Lab is for reflection, trade-offs, perspective shifts, and moments when you want to think more clearly before acting.",
  },
  {
    title: "What The Lab Is Not For",
    body:
      "It is not emergency support, not a therapist, and not a substitute for urgent real-world help. If something sounds life-threatening or dangerous, the lab will stop and direct you toward real help instead.",
  },
  {
    title: "When We Slow Things Down",
    body:
      "If your message sounds like you or someone else may be in danger, the lab will pause and show support resources rather than continuing the exercise.",
  },
];

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem("thought-lab-theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function App() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
    window.localStorage.setItem("thought-lab-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  return (
    <div className="App" style={{ fontFamily: "var(--font-body)" }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage theme={theme} onToggleTheme={toggleTheme} />} />
          <Route path="/lab" element={<ThoughtLab theme={theme} onToggleTheme={toggleTheme} />} />
          <Route
            path="/privacy"
            element={
              <InfoPage
                theme={theme}
                onToggleTheme={toggleTheme}
                eyebrow="Privacy"
                title="A clarity tool should earn trust before it earns attention."
                intro="The lab keeps the focus on your thought, not on you. It stores anonymous session data, but it doesn't turn you into an account, a profile, or a dossier."
                sections={privacySections}
              />
            }
          />
          <Route
            path="/safety"
            element={
              <InfoPage
                theme={theme}
                onToggleTheme={toggleTheme}
                eyebrow="Safety"
                title="Reflection is helpful. Emergencies need more than reflection."
                intro="The lab is designed to support thoughtful decision-making, not to handle crises on its own. Serious, life-threatening situations deserve faster and more direct support."
                sections={safetySections}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" theme={theme} />
    </div>
  );
}

export default App;
