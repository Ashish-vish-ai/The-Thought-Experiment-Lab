# Product Context: Thought Experiment Lab

## Product Summary

Thought Experiment Lab is a guided clarity product for people who are stuck in a dilemma, decision, or recurring thought loop.

It is **not** a general chatbot, not therapy, not a journaling app, and not an open-ended AI companion.

The core promise is:

> A user comes with a messy thought, dilemma, or tension. The product helps them reframe that exact thought clearly using structured thinking lenses, then guides them toward closure.

The product should help users exit a thought loop, not deepen it unnecessarily.

---

## Core Product Goal

The most important user outcome is:

> Clearer framing.

The user does not always need a final answer. They need to understand the real shape of the thought, dilemma, assumption, tradeoff, or tension they brought in.

The app should help them move from:

> “I am stuck in this messy thought.”

to:

> “I understand what this is really about, what I may be assuming, and what I can do next.”

---

## Target Users

The primary users are people who are open-minded and willing to challenge their own ideas, assumptions, and recurring thoughts.

The app should also be usable by normal users who simply want a third-person perspective on something they are thinking about.

The product should not require users to already understand philosophy, mental models, or thinking frameworks.

Users may come in with:
- messy thoughts
- dilemmas
- decisions
- emotional uncertainty
- recurring mental loops
- situations where they want another perspective

The user should decide how serious their dilemma is. The product should support light, medium, and heavier reflections while staying within safety limits.

---

## What This Product Is

Thought Experiment Lab is:

- a clarity tool
- a structured reflection system
- a perspective-shifting product
- a loop-closing assistant
- a decision-support product

It should feel like a tool with intention, not a chatbot.

Users should arrive with a thought, use the product intentionally, and leave with more clarity.

---

## What This Product Is Not

Thought Experiment Lab must not become:

- a generic chatbot
- a therapy replacement
- an emergency service
- an infinite journaling app
- a social product
- an account-driven memory product
- a productivity SaaS app
- a gamified engagement product

Avoid features that create endless conversation or keep pulling the user deeper into unrelated thoughts.

The product must avoid becoming “GPT with a nicer UI.”

---

## Core Product Philosophy

The product exists to stop unnecessary thought spirals.

A user should be able to come in with Thought A and leave with clarity about Thought A.

The product may reveal hidden assumptions, relevant emotions, tensions, risks, tradeoffs, or alternative views, but it should not drift into a completely new topic unless the user’s original input clearly requires it.

The app should not encourage infinite exploration.

The ideal experience is:

1. user dumps messy thought
2. system understands the real tension
3. system applies useful thinking lenses
4. system gives specific, neutral clarity
5. user chooses a closure-oriented next action
6. session ends intentionally

---

## Tone and Positioning

The product should feel:

- calm
- reflective
- precise
- premium
- thoughtful
- grounded
- non-judgmental
- gently challenging

It should not feel:

- clinical
- overly therapeutic
- motivational-speaker-like
- productivity-SaaS-like
- overly academic
- mystical
- generic

The product should be neutral. It should not automatically take the user’s side.

Good tone:

> “This thought seems to be asking whether you are avoiding risk or protecting stability.”

Bad tone:

> “You are right to feel this way and should follow your heart.”

The product should challenge the user kindly without making them feel attacked.

---

## Current UI Style

The current visual identity is good and should be preserved.

The product currently uses:

- warm editorial aesthetic
- serif heading font: Cormorant Garamond
- sans body font: Manrope
- cream/beige backgrounds
- muted green, brown, and lavender accents
- soft glassmorphism cards
- blur
- gradients
- floating chips
- subtle motion
- premium contemplative tone

The app should continue to feel like a contemplative clarity tool, not a utilitarian dashboard.

The current theme is good. Add dark theme support while preserving the same premium reflective feeling.

---

## Current Routes

Main routes:

- `/`
- `/lab`
- `/privacy`
- `/safety`

Preserve this basic structure unless there is a very strong reason to change it.

---

## Current Tech Stack

Frontend:

- React
- React Router
- Tailwind CSS
- Framer Motion
- Lucide icons

Backend:

- FastAPI
- Groq
- MongoDB

Keep this stack.

---

## Hard Constraints

These are non-negotiable:

1. Keep the product stateless from the user’s perspective.
2. Do not add accounts.
3. Do not add login.
4. Do not add long-term memory.
5. Do not turn it into chat.
6. Do not create infinite follow-up loops.
7. Keep the current tech stack.
8. Keep the current premium editorial aesthetic.
9. Keep safety routing.
10. Keep no-auth low-friction experience.
11. Add dark theme.
12. Support analytics only in an anonymous/session-based way.
13. Do not store personally identifying user information.
14. Do not claim “no trace” if sessions are stored anonymously for analytics.

---

## Privacy and Storage Truth

The app currently stores sessions in MongoDB for analytics.

This is acceptable, but the product copy must be honest.

Do not say:

- “No trace”
- “Nothing is stored”
- “Fully anonymous” if that implies zero backend storage

Better messaging:

> “No account required. Sessions are stored without personal identity so we can understand whether the product is helping.”

or:

> “Your reflections are not tied to a user profile. We store anonymous session data to improve the product.”

The product should remain anonymous from the user’s perspective, but not falsely imply that absolutely nothing is stored.

The backend tracks whether the user closed the session with:

- “I got clarity”
- “I want to sit with this”

This is useful and should remain.

---

## Safety Behavior

Safety mode is important and must remain.

If the user enters something suggesting self-harm, suicide, violence, or harm to others, the normal reflection flow should stop immediately.

This should happen early, before lens selection.

Example:

User enters:

> “I want to kill myself.”

The app should not let the user continue into lens selection or normal analysis.

Instead, the UI should shift seamlessly into a safety/crisis support mode.

Tone should be:

- calm
- firm
- supportive
- non-judgmental
- not dramatic
- not cold
- not overly clinical

The safety mode should feel like a seamless shift within the same product, not like a totally different app.

The product must not attempt normal philosophical analysis of self-harm or violence prompts.

---

## Current UX Flow

The current flow is:

1. Landing page explains the concept.
2. User clicks “Open the lab” / “Start a session.”
3. User writes a dilemma in a large editorial textarea.
4. User picks 2 to 5 lenses from a selectable list.
5. App shows loading/interstitial state with rotating thinking copy.
6. Results page shows:
   - one-line summary of central tension
   - per-lens insights revealed progressively with typewriter animation
   - final synthesis block
7. After results, user can:
   - get a decision recommendation
   - go deeper on a specific lens
   - hear counter-arguments
   - rerun with different lenses
8. User can close session with:
   - “I got clarity”
   - “I want to sit with this”
9. If safety detection triggers, normal flow stops and safety mode appears.

---

## Current Product Strengths

Preserve these strengths:

- clear positioning around reflection and decision support
- strong visual identity
- non-default design aesthetic
- focused linear flow
- low cognitive overhead
- good emphasis on closure
- safety routing exists in UI and backend
- no-auth experience lowers friction
- product does not feel like normal SaaS

---

## Current Product Problems

### 1. Lens selection creates friction

The biggest product issue is lens selection.

Users should not have to deeply understand lenses before getting value.

The current flow forces the user to write a messy thought and then make an abstract intellectual choice. That creates unnecessary friction.

The product should still teach lenses over time, but not require lens expertise upfront.

### 2. Output can feel generic

At least one user gave feedback that the response felt generic.

This is a serious issue.

The output must feel specific to the user’s exact thought.

The product should avoid advice that could apply to anyone.

Bad output:

> “You should weigh the pros and cons and consider what matters most.”

Good output:

> “You are not only deciding whether to leave. You are deciding whether the discomfort of uncertainty is now smaller than the cost of staying unchanged.”

### 3. Landing page and lab are not fully aligned

Current mismatch:

- landing says 24+ lenses
- actual selector has around 10
- landing showcases lenses that may not exist in actual selector

Fix this.

Do not oversell lens count.

### 4. Copy has encoding issues

There are visible mojibake issues such as:

- `Â·`
- `â†’`
- `2â€“5`
- `â€”`

Fix all text encoding issues.

### 5. Persistence exists technically but not experientially

Sessions are stored in backend for analytics, but the user should still experience the product as stateless.

Do not add account-based history.

Do not add revisit/history features unless explicitly asked later.

### 6. Typewriter animation may slow readability

The typewriter reveal is intentional because it gives a sense that the system is working.

Keep the sense of progressive reveal and reflection, but ensure users can scan results quickly.

Consider adding:
- “show all”
- faster reveal
- progressive sections without forcing slow reading

### 7. Explore further is hidden or too open-ended

Follow-up actions are not nice-to-have. They exist to help users close the thought.

But they must not encourage endless exploration.

Rename or reframe follow-ups away from “explore further.”

Use closure-oriented language.

---

## Lens System

Current lens definition example:

```js
{
  name: "Veil of ignorance",
  category: "Deep",
  description: "Would you choose this if you didn't know your position in the outcome?"
}