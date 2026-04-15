import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ThoughtLab from "@/components/ThoughtLab";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App" style={{ fontFamily: 'var(--font-body)' }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ThoughtLab />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
