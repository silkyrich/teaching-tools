# Linear Bootstrap Specification

This document defines the complete Linear workspace setup for MathSteps.
Use this as a script — create everything in this order via Linear UI or API.

---

## 1. Teams

### Platform Engineering
- **Key:** `ENG`
- **Description:** Flutter app, backend, infrastructure, CI/CD, App Store
- **Workflow states:**
  - Backlog (default)
  - Todo
  - In Progress (started)
  - In Review (started)
  - Done (completed)
  - Cancelled (cancelled)

### Content Factory
- **Key:** `CON`
- **Description:** Question generation engines, curriculum mapping, method implementations, QA
- **Workflow states:**
  - Spec (default)
  - In Generation (started)
  - Review (started)
  - QA (started)
  - Published (completed)
  - Rejected (cancelled)

### Operations
- **Key:** `OPS`
- **Description:** App Store management, user feedback, analytics, marketing, support
- **Workflow states:**
  - Incoming (default)
  - Triaged
  - In Progress (started)
  - Awaiting Response (started)
  - Resolved (completed)
  - Won't Do (cancelled)

### Compliance
- **Key:** `CMP`
- **Description:** Privacy policy, DPIA, Children's Code, App Store requirements, data protection
- **Workflow states:**
  - Backlog (default)
  - In Progress (started)
  - Review (started)
  - Complete (completed)
  - Not Applicable (cancelled)

---

## 2. Labels

Create these as workspace-level labels (available across all teams):

| Label | Colour | Description |
|-------|--------|-------------|
| `phase-1` | Green | Ship this week — free calculator |
| `phase-2` | Blue | Subscription tier, practice mode, proficiency |
| `phase-3` | Purple | Schools, AI tutor, multi-subject |
| `planning` | Yellow | Task produces a plan/spec, not code |
| `blocker` | Red | Blocks other work |
| `needs-human` | Orange | Requires founder decision |

---

## 3. Projects

### Phase 1: Step-by-Step Calculator
- **Teams:** Platform Engineering (lead), Compliance (supporting)
- **Target date:** End of this week
- **Status:** In Progress
- **Description:**
  Free maths calculator app for UK primary school children.
  User enters an arithmetic problem (e.g. "347 + 285"), sees the UK-taught
  method walked through step by step. No login, no subscription, no personal
  data collection. Anonymous analytics only.

  Methods: column addition, column subtraction (decomposition), grid
  multiplication, short division (bus stop).

  Success = in App Store with all four methods working correctly.

### Phase 2: Practice & Proficiency
- **Teams:** Platform Engineering, Content Factory
- **Status:** Planned
- **Description:**
  Subscription tier. Parent accounts, child profiles, question generation
  engine, proficiency tracking per curriculum topic. RevenueCat payments.
  Firebase auth and Firestore.

### Phase 3: School Platform
- **Teams:** All
- **Status:** Future
- **Description:**
  School integration, teacher dashboards, AI tutoring, government reporting,
  multi-subject expansion. Full IXL competitor.

---

## 4. Issues — Planning

### ENG-1: [Planning] Define Flutter project architecture
- **Team:** Platform Engineering
- **Labels:** `planning`, `phase-1`
- **Priority:** Urgent
- **Description:**
  Decide and document:
  - State management: Riverpod (recommended — already proven in v1 with Zustand)
  - Routing: GoRouter
  - Folder structure: feature-first (see scaffold)
  - Analysis options: strict mode, all lints enabled
  - Core dependencies: flutter_riverpod, go_router, google_fonts, freezed

  Output: Architecture Decision Record (ADR) and final pubspec.yaml spec.

  Context: This starts as a no-login calculator but must eventually support
  auth (Firebase), subscriptions (RevenueCat), and a large content library.
  Don't build for Phase 2, but don't prevent it.
- **Acceptance criteria:**
  - [ ] ADR document committed to docs/
  - [ ] pubspec.yaml finalised
  - [ ] Folder structure matches ADR

### ENG-2: [Planning] Define step-by-step method protocol
- **Team:** Platform Engineering
- **Labels:** `planning`, `phase-1`
- **Priority:** Urgent
- **Description:**
  Design the abstract interface that all arithmetic methods implement.

  A method:
  1. Takes a problem (operation + operands)
  2. Validates applicability (e.g. subtraction requires a > b)
  3. Returns structured step data for UI rendering/animation

  **CRITICAL LESSON FROM V1:** The v1 React codebase has working engines for
  all five operations. The type system is proven:
  - `StepInput` — individual step with position, correctValue, type, status
  - `GridCell` — rendering cell with content, editability, visual status
  - `OperationConfig` — getLayout, getCells, getStepExplanation per operation
  - `StepType` — answer_digit, carry, borrow, remainder, bring_down, partial_product

  These types WORK. Port them to Dart with freezed, don't redesign from scratch.
  The separation of engine logic (pure computation) from rendering (grid cells)
  from explanation (step text) is the right architecture.

  Methods to support:
  - Column addition (with carrying, multiple addends)
  - Column subtraction with decomposition (NOT equal addition)
  - Grid/box multiplication (partition by place value)
  - Short division / bus stop (divisor ≤ 12)

  Output: Dart protocol spec, freezed data models, abstract class definition.
- **Acceptance criteria:**
  - [ ] Abstract `MathMethod` class defined
  - [ ] `StepInput`, `GridCell`, `StepExplanation` models defined with freezed
  - [ ] Common output format documented
  - [ ] All four Phase 1 methods can conform to the protocol

### ENG-3: [Planning] Design calculator UI/UX
- **Team:** Platform Engineering
- **Labels:** `planning`, `phase-1`
- **Priority:** Urgent
- **Description:**
  Design the user experience for the calculator.

  **Screens:**
  1. Home / Problem Input — user types "347 + 285" or picks an operation
  2. Step-by-Step Working — the main screen, shows column layout with animation
  3. Completion — answer revealed, celebration, "try another"

  **V1 lessons to carry forward:**
  - Natural text input works well ("347 + 285") — keep this
  - Accept × and *, ÷ and / — users type different symbols
  - Step-by-step with forward/back navigation — proven UX
  - Digit-cell grid for column layouts — the core rendering pattern
  - Three support levels (full/some/none) are good granularity
  - Themed visual environments engage children
  - Number pad for digit entry on the working screen

  **V1 lessons to improve:**
  - The React app is web-only; Flutter gives us native performance
  - Grid multiplication in v1 uses partial products, not the grid/box layout
    children actually learn. Redesign for visual fidelity to UK exercise books.
  - Division layout should look like an actual bus stop division, not a table
  - Need better progressive disclosure — don't show all steps at once
  - Animations need to be smoother (v1 had some jank)

  Output: Screen flow diagram, widget breakdown, interaction model.
- **Acceptance criteria:**
  - [ ] Screen flow covers input → working → completion
  - [ ] Widget tree documented for each screen
  - [ ] Responsive layout strategy (phone + tablet)
  - [ ] Accessibility considerations noted

### ENG-4: [Planning] App Store and distribution strategy
- **Team:** Platform Engineering → Operations
- **Labels:** `planning`, `phase-1`
- **Priority:** High
- **Description:**
  Requirements for App Store and Play Store submission.

  Key decisions:
  - App name: "MathSteps" (check availability)
  - Bundle ID: com.mathsteps.app (or similar)
  - Age rating: 4+ (no objectionable content, no data collection)
  - Privacy nutrition labels: "Data Not Collected" for Phase 1
  - Category: Education
  - Keywords: maths, primary school, KS1, KS2, column addition, step by step

  Output: Submission checklist and draft metadata for both stores.
- **Acceptance criteria:**
  - [ ] Both store submission checklists complete
  - [ ] Privacy nutrition labels documented
  - [ ] Age rating justification documented
  - [ ] Screenshot dimensions and requirements listed

### ENG-5: [Planning] Phase 2 technical architecture
- **Team:** Platform Engineering
- **Labels:** `planning`, `phase-2`
- **Priority:** Medium
- **Description:**
  Architecture decisions for Phase 2 so Phase 1 doesn't paint us in a corner.

  Topics:
  - Firebase Auth (parent accounts, child profiles)
  - Firestore schema for proficiency data
  - RevenueCat subscription integration
  - Question generation engine protocol
  - Offline-first data strategy

  Output: ADRs for auth, data, and payments.
- **Acceptance criteria:**
  - [ ] Auth flow documented (parent creates account, adds child profiles)
  - [ ] Firestore schema designed
  - [ ] RevenueCat integration approach documented
  - [ ] Phase 1 code confirmed compatible

---

## 5. Issues — Content Factory Planning

### CON-1: [Planning] Map KS1 maths curriculum to topics
- **Team:** Content Factory
- **Labels:** `planning`, `phase-2`
- **Priority:** Low
- **Description:**
  Break down entire UK KS1 (Years 1-2) maths national curriculum into
  discrete, testable topics.

  Each topic: ID, display name, year group, strand, prerequisites,
  applicable methods, difficulty range (1-5).

  Source: DfE National Curriculum for Mathematics, KS1 Programme of Study.

  Output: Structured curriculum map (JSON or YAML).
- **Acceptance criteria:**
  - [ ] All KS1 maths topics identified and categorised
  - [ ] Prerequisites chain is valid (no circular dependencies)
  - [ ] Format is machine-readable

### CON-2: [Planning] Map KS2 maths curriculum to topics
- **Team:** Content Factory
- **Labels:** `planning`, `phase-2`
- **Priority:** Low
- **Description:**
  Same as CON-1 but for KS2 (Years 3-6). Larger scope — includes fractions,
  decimals, percentages, algebra, ratio, statistics by Year 6.

  Output: Structured curriculum map.
- **Acceptance criteria:**
  - [ ] All KS2 maths topics identified and categorised
  - [ ] Year group progression is clear
  - [ ] Connects to KS1 map (shared topic ID scheme)

### CON-3: [Planning] Define question generation engine protocol
- **Team:** Content Factory
- **Labels:** `planning`, `phase-2`
- **Priority:** Low
- **Description:**
  Protocol for engines that generate random questions within topic constraints.

  **CRITICAL RULE (from V1):** Engines compute answers algorithmically.
  NEVER hardcode answers. NEVER use lookup tables. The engine generates
  operands, then computes the correct answer and step-by-step working
  using the same algorithm every time.

  V1's `problemGenerator.ts` is a good starting point — it generates
  constrained random operands per operation and digit count. Port the
  concept but make it topic-aware for Phase 2.

  Requirements:
  - Generate operands within constraints (digit count, value range)
  - Compute correct answer algorithmically
  - Produce step-by-step working via the method protocol
  - Include hint generation
  - Tag output with curriculum metadata
  - Support difficulty scaling within a topic

  Output: Engine protocol spec.
- **Acceptance criteria:**
  - [ ] Abstract engine interface defined
  - [ ] Input constraints model defined
  - [ ] Output format matches method protocol
  - [ ] QA validation strategy documented

---

## 6. Issues — Operations Planning

### OPS-1: [Planning] Analytics and monitoring strategy
- **Team:** Operations
- **Labels:** `planning`, `phase-1`
- **Priority:** High
- **Description:**
  What to measure from day one:
  - Downloads (store analytics)
  - DAU/MAU
  - Methods used (which operations, which difficulty)
  - Session duration
  - Problem completion rate
  - Step error rate (where do children get stuck?)

  Firebase Analytics with child-directed treatment flag.
  No personal data. No advertising ID. No user-level tracking.

  Weekly summary → Linear comment on a standing issue.

  Output: Analytics event spec and reporting plan.
- **Acceptance criteria:**
  - [ ] Event taxonomy defined
  - [ ] Firebase child-directed configuration documented
  - [ ] Reporting cadence and format defined

### OPS-2: [Planning] Feedback and support pipeline
- **Team:** Operations
- **Labels:** `planning`, `phase-1`
- **Priority:** Medium
- **Description:**
  How App Store reviews and in-app feedback flow into Linear.

  Pipeline:
  1. App Store review appears
  2. AI classifies (bug report, feature request, praise, complaint)
  3. Creates Linear issue in Operations with classification
  4. Drafts response for founder review
  5. Founder approves/edits, response sent

  Output: Support pipeline spec.
- **Acceptance criteria:**
  - [ ] Classification taxonomy defined
  - [ ] Routing rules documented
  - [ ] Response templates created
  - [ ] Escalation criteria defined (when needs-human)

### OPS-3: [Planning] Marketing and launch plan
- **Team:** Operations
- **Labels:** `planning`, `phase-1`
- **Priority:** Medium
- **Description:**
  Getting initial downloads with zero budget.

  Channels:
  - App Store Optimisation (ASO)
  - Mumsnet / parenting forums
  - Twitter/X education community
  - Reddit r/primaryteaching, r/ukparenting
  - Local Facebook parent groups
  - TES community

  What agents can produce: social media posts, forum posts, ASO copy.
  What needs human: actual posting, community engagement, responding.

  Output: Launch playbook.
- **Acceptance criteria:**
  - [ ] Channel list with strategy per channel
  - [ ] Content calendar for launch week
  - [ ] ASO keyword research completed
  - [ ] Clear human-vs-agent responsibility split

---

## 7. Issues — Compliance Planning

### CMP-1: [Planning] Privacy policy for Phase 1
- **Team:** Compliance
- **Labels:** `planning`, `phase-1`, `blocker`
- **Priority:** Urgent
- **Description:**
  Phase 1 collects NO personal data:
  - No accounts, no names, no login
  - No advertising
  - Anonymous analytics only (Firebase child-directed)
  - No third-party data sharing
  - No cookies (native app)

  Write privacy policy covering:
  - UK GDPR compliance (trivially satisfied — no personal data)
  - ICO Children's Code (Age Appropriate Design Code) — 15 standards,
    most trivially satisfied for a no-data app
  - Apple App Store requirements
  - Google Play Store requirements

  Output: Privacy policy text and compliance checklist.
- **Acceptance criteria:**
  - [ ] Privacy policy draft complete
  - [ ] All 15 Children's Code standards addressed
  - [ ] App Store privacy nutrition labels documented
  - [ ] Play Store data safety section documented
  - [ ] Reviewed by founder (needs-human)

### CMP-2: [Planning] DPIA framework for Phase 2
- **Team:** Compliance
- **Labels:** `planning`, `phase-2`
- **Priority:** Low
- **Description:**
  When accounts and learning data arrive in Phase 2, we need a DPIA.

  Design the framework now:
  - Data inventory (what we'll collect)
  - Processing purposes (educational progress tracking)
  - Legal basis (parental consent for under-13s)
  - Storage and retention
  - Access controls
  - Children's rights (erasure, portability)
  - Risk assessment template

  Output: DPIA template.
- **Acceptance criteria:**
  - [ ] DPIA template complete
  - [ ] Data flow diagram included
  - [ ] Risk matrix populated with Phase 2 scenarios

### CMP-3: [Planning] Consent architecture for Phase 2
- **Team:** Compliance
- **Labels:** `planning`, `phase-2`
- **Priority:** Low
- **Description:**
  Consent flow for parent accounts when we add subscriptions.

  Under-13s need parental consent (UK GDPR, COPPA if US expansion).
  Parent creates account → adds child profiles → consents to educational
  processing → manages child's data.

  Phase 3 note: When schools adopt, legal basis shifts from consent to
  "public task" under school authority. Design Phase 2 consent so Phase 3
  transition is smooth.

  Output: Consent flow spec and legal basis mapping.
- **Acceptance criteria:**
  - [ ] Consent flow wireframes
  - [ ] Legal basis documented per processing activity
  - [ ] Phase 3 transition path identified

---

## 8. Issues — Phase 1 Execution

### ENG-10: Scaffold Flutter project
- **Team:** Platform Engineering
- **Labels:** `phase-1`
- **Priority:** Urgent
- **Depends on:** ENG-1 (but start with sensible defaults)
- **Description:**
  Create Flutter project with:
  - Strict Dart analysis (all lints)
  - Core deps: flutter_riverpod, go_router, google_fonts
  - Feature-first folder structure
  - CLAUDE.md at root
  - Basic app shell with routing
  - Placeholder screens that compile

  NOTE: Initial scaffold already created in mathsteps/ directory.
  Verify it compiles and flesh out as needed.
- **Acceptance criteria:**
  - [ ] `flutter run` works on iOS simulator and Android emulator
  - [ ] Folder structure matches architecture ADR
  - [ ] CLAUDE.md exists and is comprehensive
  - [ ] `flutter analyze` passes with zero issues

### ENG-11: Implement column addition method
- **Team:** Platform Engineering
- **Labels:** `phase-1`
- **Priority:** Urgent
- **Description:**
  Port from v1 TypeScript (`src/engines/addition.ts`).

  Takes two or more numbers, performs column addition with carrying,
  returns step-by-step data conforming to the method protocol.

  V1 implementation handles:
  - Right-to-left column processing
  - Single and multiple carries
  - Multiple addends (2-5 numbers)
  - Different digit counts (automatic padding)
  - Compound values for carry visualisation
  - Linked steps (carry linked to answer digit)

  All of this is correct and tested. Port faithfully to Dart.

  **CRITICAL:** Algorithm must compute answers. Never hardcode.
  Test with edge cases: 999+1=1000, 0+0=0, 9999+9999=19998.
- **Acceptance criteria:**
  - [ ] Unit tests: no-carry, single carry, multi-carry, 999+1, multiple addends
  - [ ] All tests pass
  - [ ] Step data conforms to method protocol
  - [ ] Produces identical results to v1 for same inputs

### ENG-12: Implement column subtraction method
- **Team:** Platform Engineering
- **Labels:** `phase-1`
- **Priority:** High
- **Description:**
  Port from v1 TypeScript (`src/engines/subtraction.ts`).

  Column subtraction with DECOMPOSITION (borrowing). UK schools use
  decomposition, NOT equal addition. This is non-negotiable.

  V1 implementation handles:
  - Right-to-left processing
  - Simple borrowing from adjacent column
  - Chain borrowing through zeros (e.g. 1000-1)
  - Borrow steps linked to answer steps

  **CRITICAL:** Decomposition, not equal addition. Test with borrow-across-zero.
- **Acceptance criteria:**
  - [ ] Unit tests: simple, single borrow, multi-borrow, borrow-across-zero
  - [ ] All tests pass
  - [ ] Uses decomposition method (not equal addition)
  - [ ] Produces identical results to v1

### ENG-13: Implement grid multiplication method
- **Team:** Platform Engineering
- **Labels:** `phase-1`
- **Priority:** High
- **Description:**
  **NOTE: This is a REDESIGN, not a direct port.**

  V1 uses long multiplication with partial products. Phase 1 needs the
  GRID METHOD (box method) that UK primary schools actually teach:

  Example: 34 × 27
  ```
         30    4
    20  600   80   = 680
     7  210   28   = 238
                     918
  ```

  Both numbers partitioned by place value. Grid filled with products.
  Rows summed, then totals summed for final answer.

  This is visually different from v1's approach. Design a new engine
  that produces grid-layout step data.

  Steps should be:
  1. Show the partitioning (34 → 30 + 4, 27 → 20 + 7)
  2. Fill each grid cell (e.g. 30 × 20 = 600)
  3. Sum each row
  4. Sum row totals for final answer
- **Acceptance criteria:**
  - [ ] Grid layout renders correctly for 2×1, 2×2, 3×2 digit problems
  - [ ] Step-by-step fills grid cells in logical order
  - [ ] Row sums and final sum computed algorithmically
  - [ ] Unit tests cover all size combinations
  - [ ] Visual output matches UK exercise book format

### ENG-14: Implement short division (bus stop) method
- **Team:** Platform Engineering
- **Labels:** `phase-1`
- **Priority:** High
- **Description:**
  Port from v1 TypeScript (`src/engines/shortDivision.ts`).

  Short division with bus stop layout. Divisor ≤ 12 initially.

  V1 implementation handles:
  - Left-to-right digit processing
  - Quotient digits above the bus stop line
  - Carry remainders below/beside
  - Final remainder notation (r3)

  Port faithfully. The bus stop visual layout needs to look right —
  the dividend goes under the "roof", divisor to the left.
- **Acceptance criteria:**
  - [ ] Unit tests: exact division, with remainder, with carries, divisor 2-12
  - [ ] All tests pass
  - [ ] Layout matches bus stop format
  - [ ] Remainder notation correct

### ENG-15: Build problem input UI
- **Team:** Platform Engineering
- **Labels:** `phase-1`
- **Priority:** Urgent
- **Description:**
  Screen where users enter maths problems.

  **Input modes (from v1, both proven):**
  1. Natural text: type "347 + 285" and parse it
  2. Structured: pick operation, enter numbers separately

  **Parser requirements:**
  - Detect +, -, ×/*, ÷// operations
  - Extract operands
  - Validate (positive integers only for Phase 1)
  - Reject invalid input with helpful message
  - Route to correct method engine

  **V1 lesson:** The custom number entry (structured) mode is used more
  than the text input by children. Keep both, but make structured the
  default for younger users.
- **Acceptance criteria:**
  - [ ] Both input modes work
  - [ ] Parser handles all four operations
  - [ ] Accepts × and *, ÷ and /
  - [ ] Invalid input shows helpful error
  - [ ] Routes to correct method

### ENG-16: Build step-by-step display UI
- **Team:** Platform Engineering
- **Labels:** `phase-1`
- **Priority:** Urgent
- **Description:**
  Main screen showing the step-by-step working.

  **Core widget: DigitGrid**
  Renders the column/grid/bus-stop layout using GridCell data from engines.
  Each cell can be: fixed (operand digit), pending, active, completed.

  **V1 proven patterns to keep:**
  - Grid-based rendering with row/col positioning
  - Cell status system (fixed, pending, active, completed)
  - Number pad for digit entry
  - Step explanations below the grid
  - Forward/back step navigation
  - Three support levels controlling visibility

  **V1 improvements needed:**
  - Smoother animations (Flutter gives us this natively)
  - Better progressive disclosure (reveal steps one at a time)
  - Clearer visual hierarchy (active cell should be obvious)
  - Grid method needs a different layout widget (not column-based)

  **Per-method rendering:**
  - Addition/Subtraction: column layout with carry/borrow row
  - Grid multiplication: partitioned grid with row sums
  - Short division: bus stop layout with quotient above
- **Acceptance criteria:**
  - [ ] Renders all four methods correctly
  - [ ] Step navigation (forward/back) works
  - [ ] Number pad input works
  - [ ] Three support levels work
  - [ ] Looks good on phone (375px width minimum)
  - [ ] Looks good on tablet

### ENG-17: App icon and branding
- **Team:** Platform Engineering
- **Labels:** `phase-1`
- **Priority:** Medium
- **Description:**
  Simple, clean app icon. Child-friendly but not childish — parents
  download this too.

  Concept: stylised "=" sign or step-by-step visual.
  Colours: bright but not garish.

  Generate launcher icons for both platforms at all required sizes.
- **Acceptance criteria:**
  - [ ] Icon designed and approved (needs-human)
  - [ ] iOS icon set generated (all sizes)
  - [ ] Android adaptive icon generated
  - [ ] App screenshots for store listings

### ENG-18: Build and test on iOS and Android
- **Team:** Platform Engineering
- **Labels:** `phase-1`
- **Priority:** High
- **Depends on:** ENG-15, ENG-16, all method implementations
- **Description:**
  End-to-end testing on both platforms.

  Test matrix:
  - iPhone SE (small), iPhone 15 (medium), iPad (large)
  - Pixel 4a (small), Pixel 7 (medium), tablet
  - All four methods with various inputs
  - All three support levels
  - Both input modes

  Fix any platform-specific issues.
- **Acceptance criteria:**
  - [ ] Clean build on iOS
  - [ ] Clean build on Android
  - [ ] All methods render correctly on all screen sizes
  - [ ] No platform-specific crashes or layout issues

---

## 9. Execution Order

Phase 1 critical path:
```
ENG-1 (architecture) ──→ ENG-10 (scaffold) ──→ ENG-2 (method protocol)
                                                        │
                              ┌──────────────────────────┤
                              ▼              ▼           ▼           ▼
                          ENG-11         ENG-12      ENG-13      ENG-14
                       (addition)   (subtraction)  (grid mult)  (division)
                              │              │           │           │
                              └──────────────┴─────┬─────┴───────────┘
                                                   ▼
                                    ENG-15 (input UI) + ENG-16 (display UI)
                                                   │
                                                   ▼
CMP-1 (privacy) ──────────────────────→ ENG-18 (build & test)
OPS-1 (analytics) ────────────────────→ ENG-4 (store submission)
                                                   │
                                                   ▼
                                              🚀 LAUNCH
```

Parallel tracks:
- Compliance can work on CMP-1 immediately (no dependencies)
- Operations can work on OPS-1, OPS-2, OPS-3 immediately
- Content Factory planning (CON-1, CON-2, CON-3) runs in background for Phase 2

---

## 10. Agent Assignment Notes

Each issue type maps to an agent capability:

| Issue Type | Agent Needs | Notes |
|-----------|-------------|-------|
| Planning (architecture) | Code analysis, Dart/Flutter knowledge | Can read v1 codebase for context |
| Planning (UI/UX) | Design thinking, Flutter widget knowledge | May need human review |
| Planning (compliance) | UK GDPR, Children's Code knowledge | Web research + drafting |
| Planning (curriculum) | UK national curriculum knowledge | Web research + structuring |
| Engine implementation | Dart, algorithm design, testing | Port from v1 TypeScript |
| UI implementation | Flutter widgets, animation | Fresh build |
| Store submission | App Store/Play Store guidelines | Checklist + drafting |

All `needs-human` decisions:
- App name final approval
- App icon approval
- Privacy policy sign-off
- Store listing copy approval
- Launch date go/no-go
