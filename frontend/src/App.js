import "@/App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "@/components/LandingPage";
import InfoPage from "@/components/InfoPage";
import ThoughtLab from "@/components/ThoughtLab";
import { Toaster } from "@/components/ui/sonner";

const privacySections = [
  {
    title: "What We Store",
    body:
      "We store the dilemma you write, the lenses you choose, the responses the lab generates, and whether you felt the session helped you close the thought cycle.",
  },
  {
    title: "What We Do Not Ask For",
    body:
      "There are no accounts, no usernames, and no profile fields in the product flow. The app is designed to stay focused on the thought itself rather than personal identity.",
  },
  {
    title: "How To Use It Wisely",
    body:
      "Treat the lab like a private thinking companion, not a vault for information you would never want stored anywhere. Sensitive thoughts can still be deeply personal even when they are anonymous.",
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
      "It is not emergency support, not a therapist, and not a substitute for urgent real-world help. If something sounds life-threatening or dangerous, the normal reflection flow should stop.",
  },
  {
    title: "When We Slow Things Down",
    body:
      "If a prompt suggests self-harm, harm to someone else, or another immediate crisis, the app should move into a safer response mode and point the user toward human support and emergency resources.",
  },
];

function App() {
  return (
    <div className="App" style={{ fontFamily: "var(--font-body)" }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/lab" element={<ThoughtLab />} />
          <Route
            path="/privacy"
            element={
              <InfoPage
                eyebrow="Privacy"
                title="A clarity tool should earn trust before it earns attention."
                intro="This product keeps the session focused on the user's thought. It stores the reflection itself, but it avoids turning people into accounts, profiles, or dossiers."
                sections={privacySections}
              />
            }
          />
          <Route
            path="/safety"
            element={
              <InfoPage
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
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
