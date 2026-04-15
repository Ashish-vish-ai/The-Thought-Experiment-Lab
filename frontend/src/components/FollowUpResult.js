import { motion } from "framer-motion";
import { Layers, Swords, Compass } from "lucide-react";
import TypewriterText from "./TypewriterText";

const actionLabels = {
  deeper: { label: "Deeper Analysis", icon: Layers },
  counter: { label: "Counter-Arguments", icon: Swords },
  decide: { label: "Decision Recommendation", icon: Compass },
};

function DeeperResult({ data }) {
  return (
    <div>
      <h4
        className="text-xl mb-3"
        style={{ fontFamily: "var(--font-heading)", fontWeight: 500 }}
      >
        {data.name}
      </h4>
      <p
        className="text-base leading-relaxed mb-4"
        style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
      >
        <TypewriterText text={data.deeper_insight} speed={12} />
      </p>
      {data.question && (
        <p
          className="text-base italic leading-relaxed"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
        >
          <TypewriterText text={data.question} speed={15} delay={500} />
        </p>
      )}
    </div>
  );
}

function CounterResult({ data }) {
  return (
    <div className="space-y-6">
      {data.counters?.map((c, i) => (
        <div key={i}>
          <h4
            className="text-lg mb-2"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 500 }}
          >
            {c.name}
          </h4>
          <p
            className="text-base leading-relaxed"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
          >
            <TypewriterText text={c.counter} speed={12} delay={i * 200} />
          </p>
        </div>
      ))}
      {data.revised_synthesis && (
        <div
          className="mt-6 p-6 rounded-lg"
          style={{ backgroundColor: "var(--cat-deep-bg)", border: "1px solid var(--cat-deep-border)" }}
        >
          <span
            className="text-xs uppercase tracking-[0.2em] font-medium block mb-3"
            style={{ color: "var(--cat-deep-text)", fontFamily: "var(--font-body)" }}
          >
            Revised Synthesis
          </span>
          <p
            className="text-base leading-relaxed"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
          >
            <TypewriterText text={data.revised_synthesis} speed={15} delay={600} />
          </p>
        </div>
      )}
    </div>
  );
}

function DecideResult({ data }) {
  return (
    <div>
      <div
        className="p-6 rounded-lg mb-6"
        style={{ backgroundColor: "var(--cat-practical-bg)", border: "1px solid var(--cat-practical-border)" }}
      >
        <span
          className="text-xs uppercase tracking-[0.2em] font-medium block mb-3"
          style={{ color: "var(--cat-practical-text)", fontFamily: "var(--font-body)" }}
        >
          Recommendation
        </span>
        <p
          className="text-lg leading-relaxed"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", fontWeight: 500 }}
        >
          <TypewriterText text={data.recommendation} speed={12} />
        </p>
      </div>

      {data.reasons && (
        <div className="mb-6">
          <span
            className="text-xs uppercase tracking-[0.2em] font-medium block mb-3"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
          >
            Why
          </span>
          <div className="space-y-3">
            {data.reasons.map((reason, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mt-0.5"
                  style={{
                    backgroundColor: "var(--cat-practical-bg)",
                    color: "var(--cat-practical-text)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {i + 1}
                </span>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
                >
                  <TypewriterText text={reason} speed={12} delay={i * 300} />
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.sacrifice && (
        <div className="mb-6">
          <span
            className="text-xs uppercase tracking-[0.2em] font-medium block mb-2"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
          >
            The trade-off
          </span>
          <p
            className="text-base leading-relaxed"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
          >
            <TypewriterText text={data.sacrifice} speed={12} delay={800} />
          </p>
        </div>
      )}

      {data.empowerment && (
        <p
          className="text-lg leading-relaxed italic mt-6"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
        >
          <TypewriterText text={data.empowerment} speed={15} delay={1200} />
        </p>
      )}
    </div>
  );
}

export default function FollowUpResult({ followUp, lenses }) {
  const config = actionLabels[followUp.action] || actionLabels.deeper;
  const ActionIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-xl p-6 sm:p-8"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--accent-border)",
      }}
      data-testid={`followup-result-${followUp.action}`}
    >
      <div className="flex items-center gap-2 mb-6">
        <ActionIcon size={16} style={{ color: "var(--text-secondary)" }} />
        <span
          className="text-xs uppercase tracking-[0.2em] font-medium"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
        >
          {config.label}
          {followUp.lens_name ? ` \u2014 ${followUp.lens_name}` : ""}
        </span>
      </div>

      {followUp.action === "deeper" && <DeeperResult data={followUp.data} />}
      {followUp.action === "counter" && <CounterResult data={followUp.data} />}
      {followUp.action === "decide" && <DecideResult data={followUp.data} />}
    </motion.div>
  );
}
