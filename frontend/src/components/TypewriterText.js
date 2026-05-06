import { useEffect, useState } from "react";

export default function TypewriterText({ text, speed = 15, delay = 0, showAll = false }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (showAll) {
      setDisplayed(text || "");
      setStarted(true);
      return undefined;
    }

    setDisplayed("");
    setStarted(false);
    const delayTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(delayTimer);
  }, [delay, showAll, text]);

  useEffect(() => {
    if (showAll || !started || !text) return;
    if (displayed.length >= text.length) return;

    const timer = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);

    return () => clearTimeout(timer);
  }, [showAll, started, displayed, text, speed]);

  if (!started) return null;

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="typewriter-cursor inline-block w-[2px] h-[1em] ml-[1px] align-middle" style={{ backgroundColor: "currentColor" }} />
      )}
    </span>
  );
}
