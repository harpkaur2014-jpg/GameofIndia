# BharatQuest: States & Territories of India Interactive Geography Quiz

An interactive geography study game designed for students to master the states and union territories of India through map-based identification, spaced repetition for mistakes, on-demand capital city hints, and celebratory confetti rewards.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your selections during Phase 1 clarification, here are the confirmed core specifications and the recommended defaults:

- **Answer Mode (Confirmed)**: 4 randomized multiple-choice options per question, featuring the correct state and three plausible distractor states from the same or adjacent regions, with keyboard shortcuts (keys 1–4) for rapid quizzing.
- **Scope of Territories (Confirmed)**: All 28 States and Union Territories (36 distinct territories matching the provided reference map). Students can also toggle between "All 36 States & UTs" and "28 States Only" if focusing purely on state curricula.
- **Study Aids & Hints (Confirmed)**: On-demand "Hint" button that reveals the state capital, geographic region (e.g. Western Ghats, Northeast India), and a distinctive landmark or fact without giving away the name directly.
- **Spaced Repetition & Retry Logic**: When a question is missed, the system shows the correct answer with a brief review card, locks the wrong answer, and re-inserts that territory into the active queue **3 to 5 questions later** (or at the end if fewer remain). A territory is only permanently retired from the active pool once answered correctly.
- **Map Visual Highlighting**: The provided map image (`/public/assets/aistudio/image_18b005dd.png`) is integrated with interactive SVG overlay masks and pulsing target reticles/pins. In **Quiz Mode**, state labels on the map are masked so students cannot simply read the text, while the target state illuminates with a dynamic golden glow and spotlight marker. In **Study / Reference Mode**, students can freely inspect, hover, and view the original labeled map with detailed fact sheets.
- **Victory & Confetti**: Every correct answer triggers a cheerful burst of confetti; completing all 36 territories triggers an epic full-screen victory parade with performance stats (accuracy, mistakes rectified, time spent) and a "Study Mastery Certificate".

---

## 1. Overview & Core Concept

- **What It Does**: Presents students with an interactive map of India where one state or union territory is spotlighted at a time. The student identifies the spotlighted region from four randomized choices. Incorrect answers trigger educational review cards and automatically reschedule the state 3–5 turns later until mastered.
- **Target Audience / Persona**: School and college students preparing for geography exams, competitive test aspirants (such as UPSC, SSC, Olympiads), and curious learners of Indian geography.
- **Key Value**: Replaces passive textbook memorization with active recall and adaptive spaced repetition. Students can see their real-time mastery bar fill up as states transition from "Unseen" $\to$ "Needs Practice" $\to$ "Mastered".

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Start Screen / Mode Select**:
   - Title banner with clean typography, quick summary stats (Best Streak, Total Mastered).
   - Mode toggles: **Active Test Mode** (default) or **Explore / Study Mode** (interactive map atlas).
   - Territory filter: "All 36 States & UTs" (default) or "28 States Only".
   - "Start Quiz" button initiating the randomized queue.

2. **Active Quiz Step**:
   - **Top HUD**: Progress meter showing Mastered (Green), In Queue (Slate), Needs Retry (Amber), Current Question number, and Streak counter.
   - **Interactive Map Stage (Left / Center)**: High-resolution India map featuring a synchronized spotlight animation over the target state, coordinates pointer, and zoom/pan capability so smaller states (Goa, Sikkim, Tripura, Puducherry) can be inspected clearly.
   - **Question Deck (Right / Bottom)**: 
     - Prompt: *"Which state or territory is highlighted?"*
     - Four distinct option buttons with clear labels and keyboard indicators (`[1]`, `[2]`, `[3]`, `[4]`).
     - Optional "Need a Hint?" button revealing Capital city and geographic clues.
     - Skip / Pass button (re-queues state without penalizing as a hard failure).

3. **Answer Feedback State**:
   - **Correct Answer**: Instant green flash on button and map, uplifting audio chime (optional toggle), and vibrant confetti shower across the screen. Automatically advances to the next question after 800ms (or on spacebar/Enter).
   - **Incorrect Answer**: Button turns soft crimson with an "X", the actual correct state button lights up in emerald with a checkmark, and a learning drawer reveals:
     - Correct State Name & Official Capital
     - Key fact (e.g., *"Rajasthan is India's largest state by area and home to the Thar Desert."*)
     - "Got it! Re-queueing in 4 turns" acknowledgement button.

4. **Quiz Completion & Mastery Celebration**:
   - Grand confetti cascade and celebratory fanfare.
   - Comprehensive score card: Accuracy percentage, total attempts, states mastered on first try vs. states learned through spaced repetition.
   - Interactive review list with quick-jump to revisit any state.
   - "Play Again" or "Review Mistakes" options.

### Visual Identity & Theme

- **Design Philosophy**: Educational clarity, clean cartographic aesthetics, warm Indian saffron and deep navy accents balanced against crisp neutral surfaces.
- **Color Palette (60-30-10 Budget)**:
  - *Dominant Canvas (60%)*: Off-white ivory canvas (`#FAF9F6`) with dark mode support (`#0F172A` deep navy slate).
  - *Structural Surfaces (30%)*: Card backdrops (`#FFFFFF` / `#1E293B`), subtle hairline borders (`#E2E8F0` / `#334155`), slate typography (`#1E293B` / `#F8FAFC`).
  - *Accent Budget (10%)*: Saffron Amber (`#EA580C` / `#F59E0B`) for active highlights and streak indicators; Emerald (`#10B981`) for mastered states; Indigo (`#4F46E5`) for primary interactive controls.
- **Typography**:
  - *Headings & Wordmark*: `Plus Jakarta Sans`, SemiBold/Bold, geometric and welcoming.
  - *Body Prose & Options*: `Plus Jakarta Sans`, clean 15px/16px line-height.
  - *Data & Progress Counters*: `font-mono tabular-nums` for timers, streak counters, and mastery percentage.
- **Interactive Motion**:
  - Smooth 150ms button scale and shadow response on press.
  - Radial pulse radar beacon positioned on the target state's center coordinate.
  - Lightweight DOM/Canvas confetti particle bursts configured with realistic gravity and festive colors.

---

## 3. Key Product Decisions & Trade-Offs

- **Spaced Repetition Queue Logic**:
  - *Chosen Approach*: Maintain an active array queue `[stateA, stateB, stateC, ...]`. When `stateA` is answered incorrectly, remove it from the head, pick an offset $k = \min(3 + \lfloor\text{random} \times 3\rfloor, \text{remainingQueueLength})$, and insert `stateA` at index $k$.
  - *Why*: This ensures students encounter the mistake again while the learning is still fresh (after 3–5 items), preventing rote immediate regurgitation while ensuring long-term retention.
- **Handling Map Labels vs. Quiz Anonymity**:
  - *Chosen Approach*: The user provided map image (`image_18b005dd.png`) contains printed text labels. For Quiz Mode, we overlay a clean calibrated SVG canvas that provides precise region highlights, masking patches over text labels during testing, and a prominent animated locator reticle with region pulse. In Explore/Study Mode, the full original map with all labels and callouts is viewable at full fidelity with interactive hover tooltips.
  - *Why*: Gives the student the exact visual cartography they will see on their test sheet, without allowing them to "cheat" by reading the printed label during the quiz.
- **Smart Distractor Generation**:
  - *Chosen Approach*: Distractor choices for each question are chosen strategically (e.g. for Punjab, plausible distractors include Haryana, Himachal Pradesh, Rajasthan) rather than purely random states, making the quiz genuinely educational for geography students.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          App Container (App.tsx)                       │
│  - Active Mode: 'quiz' | 'study' | 'summary'                           │
│  - State Queue & Mastery Tracking Store (useQuizState)                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
┌─────────────────────────────────┐   ┌──────────────────────────────────┐
│        Top Navigation Bar       │   │        Quiz Progress HUD         │
│  - Wordmark ("BharatQuest")     │   │  - Mastered / Needs Retry / Left │
│  - Mode & Territory Filters     │   │  - Streak Multiplier             │
│  - Sound / Theme Toggles        │   │  - Tabular Percentage Progress   │
└─────────────────────────────────┘   └──────────────────────────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
┌─────────────────────────────────┐   ┌──────────────────────────────────┐
│       Interactive Map Stage     │   │       Question & Action Deck     │
│  (MapStage.tsx)                 │   │  (QuestionDeck.tsx)              │
│  - Reference Image Overlay      │   │  - 4 Randomized Multiple Choices │
│  - Calibrated SVG Paths/Polys   │   │  - Keyboard shortcuts [1, 2, 3, 4│
│  - Target Pulse & Radar Beacon  │   │  - On-Demand Capital Hint Drawer │
│  - Zoom / Pan Control Panel     │   │  - Next / Skip Action Controls   │
└─────────────────────────────────┘   └──────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         Feedback & Effects Engine                      │
│  - Confetti Rain Engine (canvas-confetti)                              │
│  - Correct/Incorrect Sound & Haptic Cues                               │
│  - Spaced Repetition Rescheduler (re-insert at index + 3..5)           │
│  - Victory Ceremony & Completion Summary Report                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Territory Data Structure (`src/data/indiaStates.ts`)

Each of the 36 states and territories is modeled with:
- `id`: Unique identifier (e.g. `'rj'`, `'mh'`, `'ka'`, `'dl'`).
- `name`: Official name (e.g. `"Rajasthan"`, `"Maharashtra"`, `"Delhi"`).
- `type`: `'state' | 'ut'`.
- `capital`: Official capital (e.g. `"Jaipur"`, `"Mumbai"`, `"New Delhi"`).
- `region`: Geographical zone (`"North"`, `"South"`, `"West"`, `"East"`, `"Central"`, `"Northeast"`).
- `coordinates`: `{ xPercent: number, yPercent: number }` matching the reference image.
- `svgPath`: Normalized vector outline coordinate data for the highlight glow.
- `funFact`: Engaging bite-sized trivia (e.g. *"Known as the Land of Kings; home to the ancient Aravalli Range."*).
- `commonDistractors`: Associated neighboring states to prioritize as smart multiple choice options.

### Interactive State Lifecycle

```
[Start Session] ──> Queue initialized with 36 territories (shuffled)
        │
        ▼
[Present State] ──> Highlight target on map with animated pulse
        │
   [User Click] ──> Option 1, 2, 3, or 4
        ├── [CORRECT] ──> 1. Confetti burst
        │                 2. Move state to "Mastered" set
        │                 3. Increment streak & play celebratory chime
        │                 4. Check if Queue empty ──> [Victory Summary]
        │
        └── [INCORRECT] ─> 1. Highlight wrong choice (red) + correct choice (green)
                          2. Open Educational Hint Card (Capital + Geography)
                          3. Calculate insert position: currentPos + random(3..5)
                          4. Re-insert into Queue for spaced review
```

---

## 5. Verification & Testing Plan

1. **Queue & Spaced Repetition Test**:
   - Verify that answering correctly removes the state permanently and increments the mastered counter.
   - Verify that answering incorrectly re-inserts the state exactly 3–5 items down the queue, and displays the state again later until mastered.
2. **Confetti Verification**:
   - Verify that confetti showers trigger dynamically on every correct answer without lagging or blocking the UI.
   - Verify that final victory triggers a full celebratory confetti burst.
3. **Map Highlighting & Responsiveness**:
   - Test that each state's spotlight marker and SVG highlight accurately align with the provided image on desktop and mobile viewports.
   - Test zoom/pan controls for dense/small territories (Goa, Puducherry, Delhi, Chandigarh).
4. **Build & Type Checking**:
   - Run `compile_applet` and `lint_applet` to verify clean TypeScript compilation and zero console warnings.
